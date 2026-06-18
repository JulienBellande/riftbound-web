/**
 * Minimal in-memory rate limiter for anonymous write endpoints.
 *
 * Fixed-window per (scope, client-ip). This is a per-instance baseline that
 * blunts casual spam/floods; a multi-instance deployment that needs hard
 * guarantees should back this with a shared store (e.g. Upstash Redis).
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (when blocked). */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup to keep the map bounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count++;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client identifier from proxy headers. */
export function clientKey(request: Request, scope: string): string {
  const xff = request.headers.get("x-forwarded-for");
  const ip =
    xff?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(JSON.stringify({ error: "rate_limited" }), {
    status: 429,
    headers: {
      "content-type": "application/json",
      "retry-after": String(retryAfter),
    },
  });
}
