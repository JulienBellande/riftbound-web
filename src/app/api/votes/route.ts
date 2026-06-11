import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured } from "@/lib/db";
import { castDemoVote } from "@/lib/data/decks";

const bodySchema = z.object({
  deckId: z.string(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { deckId, value } = parsed.data;

  if (!isDatabaseConfigured()) {
    const result = castDemoVote(deckId, "demo-user", value);
    return NextResponse.json(result);
  }

  // TODO: Auth check + upsert vote + recalculate score in DB
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
