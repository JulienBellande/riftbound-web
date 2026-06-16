import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDecks, createDeck } from "@/lib/data/decks";
import { randomCardAlias } from "@/lib/anon";

const querySchema = z.object({
  q: z.string().optional(),
  format: z.string().optional(),
  period: z.enum(["week", "month", "all"]).default("week"),
  sort: z.enum(["score", "date", "name"]).default("score"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const q = parsed.data;
  const result = await getDecks({
    search: q.q,
    format: q.format,
    period: q.period,
    sortBy: q.sort,
    page: q.page,
    perPage: q.perPage,
  });

  return NextResponse.json(result);
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  format: z.enum(["standard", "extended", "draft"]).default("standard"),
  isPublic: z.boolean().default(false),
  cards: z
    .array(
      z.object({
        cardId: z.string().min(1),
        quantity: z.number().int().min(1).max(4),
      })
    )
    .min(1)
    .max(60),
});

export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = createSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const result = await createDeck(parsed, randomCardAlias());
  return NextResponse.json(result, { status: 201 });
}
