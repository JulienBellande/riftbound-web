import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReply } from "@/lib/data/forum";
import { randomCardAlias } from "@/lib/anon";

const bodySchema = z.object({
  topicId: z.string().min(1),
  content: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
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
