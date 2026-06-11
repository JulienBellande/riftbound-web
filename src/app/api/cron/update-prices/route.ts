import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export const maxDuration = 60;

/**
 * Daily price snapshot job (Vercel Cron — see vercel.json).
 *
 * Fetches the current market price for every card and appends a new
 * CardPrice row, preserving full price history for trend charts.
 *
 * `fetchMarketPrice` is the integration point for a real price source
 * (Cardmarket / TCGplayer API, or a scraper service). Until one is wired
 * in, it derives a bounded random walk from the latest stored price so
 * that trends stay realistic in staging environments.
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

  const cards = await prisma.card.findMany({
    select: {
      id: true,
      prices: {
        orderBy: { fetchedAt: "desc" },
        take: 1,
        select: { priceEur: true },
      },
    },
  });

  const now = new Date();
  const rows = cards.map((card) => {
    const latestEur = Number(card.prices[0]?.priceEur ?? 1);
    const priceEur = fetchMarketPrice(latestEur);
    return {
      cardId: card.id,
      priceEur,
      priceUsd: round2(priceEur * USD_RATE),
      priceGbp: round2(priceEur * GBP_RATE),
      source: "cron",
      fetchedAt: now,
    };
  });

  await prisma.cardPrice.createMany({ data: rows });

  return NextResponse.json({ updated: rows.length, at: now.toISOString() });
}

const USD_RATE = 1.08;
const GBP_RATE = 0.85;

function fetchMarketPrice(latestEur: number): number {
  // ±5 % bounded random walk, floored at 0.05 €
  const variation = 1 + (Math.random() - 0.5) * 0.1;
  return Math.max(0.05, round2(latestEur * variation));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
