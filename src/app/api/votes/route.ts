import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured } from "@/lib/db";
import { castDemoVote, castVote } from "@/lib/data/decks";
import { getAnonVoterId, ensureAnonVoter } from "@/lib/anon";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit";

const bodySchema = z.object({
  deckId: z.string(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(clientKey(request, "vote"), 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { deckId, value } = parsed.data;
  const voterId = await getAnonVoterId();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(castDemoVote(deckId, voterId, value));
  }

  await ensureAnonVoter(voterId);
  return NextResponse.json(await castVote(deckId, voterId, value));
}
