import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDecks } from "@/lib/data/decks";

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
