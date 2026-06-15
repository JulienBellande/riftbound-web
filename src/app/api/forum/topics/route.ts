import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTopic } from "@/lib/data/forum";
import { getCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  categorySlug: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(1).max(5000),
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

  try {
    const result = await createTopic(
      parsed.categorySlug,
      { title: parsed.title, content: parsed.content },
      user
    );
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "unknown_category" }, { status: 400 });
  }
}
