import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReply } from "@/lib/data/forum";
import { randomCardAlias } from "@/lib/anon";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit";

const bodySchema = z.object({
  topicId: z.string().min(1),
  content: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(clientKey(request, "forum-reply"), 10, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const result = await createReply(
      parsed.topicId,
      parsed.content,
      randomCardAlias()
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    const status = message === "topic_locked" ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
