import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPriceRows } from "@/lib/data/cards";

const querySchema = z.object({
  q: z.string().optional(),
  ext: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
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
  const result = await getPriceRows({
    search: q.q,
    extensionId: q.ext,
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
