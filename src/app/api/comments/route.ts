import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDeckComment } from "@/lib/data/comments";
import { randomCardAlias } from "@/lib/anon";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit";

const bodySchema = z.object({
  deckId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(clientKey(request, "comment"), 10, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const comment = await createDeckComment(
    parsed.deckId,
    parsed.content,
    randomCardAlias()
  );
  return NextResponse.json(comment, { status: 201 });
}
