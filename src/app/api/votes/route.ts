import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured } from "@/lib/db";
import { castDemoVote, castVote } from "@/lib/data/decks";
import { getCurrentUser } from "@/lib/auth";

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

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await castVote(deckId, user.id, value);
  return NextResponse.json(result);
}
