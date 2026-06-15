import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCards } from "@/lib/data/cards";

const querySchema = z.object({
  q: z.string().optional(),
  ext: z.string().optional(),
  type: z.string().optional(),
  rarity: z.string().optional(),
  domain: z.string().optional(),
  costMin: z.coerce.number().int().min(0).optional(),
  costMax: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["name", "cost", "rarity", "price", "date"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(24),
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
  const result = await getCards({
    search: q.q,
    extensionId: q.ext,
    type: q.type,
    rarity: q.rarity,
    domain: q.domain,
    costMin: q.costMin,
    costMax: q.costMax,
    sortBy: q.sort,
    sortOrder: q.order,
    page: q.page,
    perPage: q.perPage,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
