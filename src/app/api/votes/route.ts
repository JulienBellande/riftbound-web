import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { deckId, value } = body;

  if (!deckId || ![1, -1].includes(value)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  // TODO: Auth check + upsert vote + update deck score
  return NextResponse.json({ success: true });
}
