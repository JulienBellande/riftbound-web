import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters = {
    search: searchParams.get("search") ?? undefined,
    extensionId: searchParams.get("extensionId") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    rarity: searchParams.get("rarity") ?? undefined,
    costMin: searchParams.get("costMin")
      ? Number(searchParams.get("costMin"))
      : undefined,
    costMax: searchParams.get("costMax")
      ? Number(searchParams.get("costMax"))
      : undefined,
    sortBy: searchParams.get("sortBy") ?? "name",
    sortOrder: searchParams.get("sortOrder") ?? "asc",
    page: Number(searchParams.get("page") ?? 1),
    perPage: Math.min(Number(searchParams.get("perPage") ?? 24), 100),
  };

  // TODO: Prisma query with filters
  return NextResponse.json({
    data: [],
    total: 0,
    page: filters.page,
    perPage: filters.perPage,
    totalPages: 0,
  });
}
