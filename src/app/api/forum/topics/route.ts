import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTopic } from "@/lib/data/forum";
import { randomCardAlias } from "@/lib/anon";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit";

const bodySchema = z.object({
  categorySlug: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(clientKey(request, "forum-topic"), 5, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const result = await createTopic(
      parsed.categorySlug,
      { title: parsed.title, content: parsed.content },
      randomCardAlias()
    );
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "unknown_category" }, { status: 400 });
  }
}
