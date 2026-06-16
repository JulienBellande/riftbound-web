import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  fetchRiftboundPriceIndex,
  USD_TO_EUR,
  USD_TO_GBP,
} from "@/lib/prices/tcgcsv";

export const maxDuration = 60;

/**
 * Daily price snapshot job (Vercel Cron — see vercel.json).
 *
 * Pulls the real TCGplayer market price for every card from TCGCSV and appends
 * a new CardPrice row, preserving full price history for trend charts. Cards
 * are matched to their individual printing by (set, name), so Overnumbered /
 * Signature / Alternate-art variants each get their own real price.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 503 }
    );
  }

  let index;
  try {
    index = await fetchRiftboundPriceIndex();
  } catch (err) {
    return NextResponse.json(
      { error: "Price source unavailable", detail: String(err) },
      { status: 502 }
    );
  }

  const cards = await prisma.card.findMany({
    select: {
      id: true,
      nameEn: true,
      extension: { select: { code: true } },
    },
  });

  const now = new Date();
  let unmatched = 0;
  const rows = cards.flatMap((card) => {
    const price = index.lookup(card.extension.code, card.nameEn);
    const usd = price?.marketUsd ?? price?.lowUsd ?? null;
    if (usd === null) {
      unmatched++;
      return [];
    }
    return [
      {
        cardId: card.id,
        priceUsd: round2(usd),
        priceEur: round2(usd * USD_TO_EUR),
        priceGbp: round2(usd * USD_TO_GBP),
        source: "tcgcsv",
        fetchedAt: now,
      },
    ];
  });

  if (rows.length > 0) {
    await prisma.cardPrice.createMany({ data: rows });
  }

  return NextResponse.json({
    updated: rows.length,
    unmatched,
    at: now.toISOString(),
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
