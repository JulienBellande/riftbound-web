import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDeckComment } from "@/lib/data/comments";
import { getCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  deckId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const comment = await createDeckComment(parsed.deckId, parsed.content, user);
  return NextResponse.json(comment, { status: 201 });
}
