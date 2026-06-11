import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters = {
    format: searchParams.get("format") ?? undefined,
    period: searchParams.get("period") ?? "week",
    sortBy: searchParams.get("sortBy") ?? "score",
    page: Number(searchParams.get("page") ?? 1),
    perPage: Math.min(Number(searchParams.get("perPage") ?? 20), 50),
  };

  // TODO: Prisma query - public decks with vote score, sorted by period
  return NextResponse.json({
    data: [],
    total: 0,
    page: filters.page,
    perPage: filters.perPage,
    totalPages: 0,
  });
}

export async function POST(request: NextRequest) {
  // TODO: Auth check + create deck
  const body = await request.json();
  return NextResponse.json({ id: null }, { status: 201 });
}
