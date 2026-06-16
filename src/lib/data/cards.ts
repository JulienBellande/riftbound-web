import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  sampleCards,
  sampleExtensions,
  samplePricePoints,
  type SampleCard,
} from "./sample-data";
import { isLegalInDomains } from "@/lib/domains";
import type { CardFilters, CardWithPrice, PaginatedResponse } from "@/types";

export interface ExtensionSummary {
  id: string;
  code: string;
  nameFr: string;
  nameEn: string;
  releaseDate: string;
  count: number;
}

export interface PriceRow extends CardWithPrice {
  /** 7-day price change in percent, null when no history */
  trend7d: number | null;
}

const RARITY_ORDER = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "SHOWCASE",
  "PROMO",
];

// ──────────────────────────────────────────────
// Demo mode (no DATABASE_URL): serve the bundled dataset
// ──────────────────────────────────────────────

function demoCardToDto(card: SampleCard): CardWithPrice {
  const extension = sampleExtensions.find(
    (e) => e.code === card.extensionCode
  )!;
  const prices = samplePricePoints(card);
  const latest = prices[prices.length - 1];

  return {
    id: card.slug,
    collectorNum: card.collectorNum,
    nameFr: card.nameFr,
    nameEn: card.nameEn,
    descriptionFr: card.descriptionFr,
    descriptionEn: card.descriptionEn,
    type: card.type,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    health: card.health,
    imageUrl: card.imageUrl ?? null,
    domain: card.domain ?? [],
    artist: card.artist ?? "",
    tags: card.tags ?? [],
    extension: {
      code: extension.code,
      nameFr: extension.nameFr,
      nameEn: extension.nameEn,
    },
    latestPrice: latest
      ? {
          priceEur: latest.priceEur,
          priceUsd: latest.priceUsd,
          priceGbp: latest.priceGbp,
          fetchedAt: new Date().toISOString(),
        }
      : null,
  };
}

function applyDemoFilters(filters: CardFilters): CardWithPrice[] {
  let cards = sampleCards.map(demoCardToDto);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    cards = cards.filter(
      (c) =>
        c.nameFr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.collectorNum.toLowerCase().includes(q)
    );
  }
  if (filters.extensionId) {
    cards = cards.filter((c) => c.extension.code === filters.extensionId);
  }
  if (filters.type) {
    cards = cards.filter((c) => c.type === filters.type);
  }
  if (filters.rarity) {
    cards = cards.filter((c) => c.rarity === filters.rarity);
  }
  if (filters.domain) {
    cards = cards.filter((c) => c.domain.includes(filters.domain!));
  }
  if (filters.domains && filters.domains.length > 0) {
    cards = cards.filter((c) => isLegalInDomains(c.domain, filters.domains!));
  }
  if (filters.tag) {
    cards = cards.filter((c) => c.tags.includes(filters.tag!));
  }
  if (filters.costMin !== undefined) {
    cards = cards.filter((c) => c.cost >= filters.costMin!);
  }
  if (filters.costMax !== undefined) {
    cards = cards.filter((c) => c.cost <= filters.costMax!);
  }

  const dir = filters.sortOrder === "desc" ? -1 : 1;
  const sortBy = filters.sortBy ?? "name";
  cards.sort((a, b) => {
    switch (sortBy) {
      case "cost":
        return (a.cost - b.cost) * dir;
      case "rarity":
        return (
          (RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)) *
          dir
        );
      case "price":
        return (
          ((a.latestPrice?.priceEur ?? 0) - (b.latestPrice?.priceEur ?? 0)) *
          dir
        );
      default:
        return a.nameEn.localeCompare(b.nameEn) * dir;
    }
  });

  return cards;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function getExtensions(): Promise<ExtensionSummary[]> {
  if (!isDatabaseConfigured()) {
    const countBySet = new Map<string, number>();
    for (const c of sampleCards) {
      countBySet.set(c.extensionCode, (countBySet.get(c.extensionCode) ?? 0) + 1);
    }
    return sampleExtensions.map((e) => ({
      id: e.code,
      code: e.code,
      nameFr: e.nameFr,
      nameEn: e.nameEn,
      releaseDate: e.releaseDate,
      count: countBySet.get(e.code) ?? 0,
    }));
  }

  const extensions = await prisma.extension.findMany({
    orderBy: { releaseDate: "desc" },
    include: { _count: { select: { cards: true } } },
  });
  return extensions.map((e) => ({
    id: e.id,
    code: e.code,
    nameFr: e.nameFr,
    nameEn: e.nameEn,
    releaseDate: e.releaseDate.toISOString(),
    count: e._count.cards,
  }));
}

/**
 * All selectable Legends (one entry per Legend, excluding signature /
 * alternate-art printings). Each carries its two domains, which drive the
 * deck builder's colour constraints and rune selection.
 */
export async function getLegends(): Promise<CardWithPrice[]> {
  if (!isDatabaseConfigured()) {
    // One entry per Legend (collapse Signature / Alternate-art / Metal /
    // Overnumbered printings), preferring the plain printing.
    const byBase = new Map<string, SampleCard>();
    for (const c of sampleCards) {
      if (c.type !== "LEGEND") continue;
      const base = baseCardName(c.nameEn);
      const existing = byBase.get(base);
      if (!existing || (c.nameEn === base && existing.nameEn !== base)) {
        byBase.set(base, c);
      }
    }
    return [...byBase.values()]
      .map(demoCardToDto)
      .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }

  const cards = await prisma.card.findMany({
    where: { type: "LEGEND" as never },
    include: {
      extension: true,
      prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
    },
    orderBy: { nameEn: "asc" },
  });

  const seen = new Set<string>();
  const out: CardWithPrice[] = [];
  for (const c of cards) {
    const base = baseCardName(c.nameEn);
    if (seen.has(base)) continue;
    seen.add(base);
    out.push({
      id: c.id,
      collectorNum: c.collectorNum,
      nameFr: c.nameFr,
      nameEn: c.nameEn,
      descriptionFr: c.descriptionFr,
      descriptionEn: c.descriptionEn,
      type: c.type,
      rarity: c.rarity,
      cost: c.cost,
      attack: c.attack,
      health: c.health,
      imageUrl: c.imageUrl,
      domain: [],
      artist: "",
      tags: [],
      extension: {
        code: c.extension.code,
        nameFr: c.extension.nameFr,
        nameEn: c.extension.nameEn,
      },
      latestPrice: c.prices[0]
        ? {
            priceEur: Number(c.prices[0].priceEur),
            priceUsd: Number(c.prices[0].priceUsd),
            priceGbp: Number(c.prices[0].priceGbp),
            fetchedAt: c.prices[0].fetchedAt.toISOString(),
          }
        : null,
    });
  }
  return out;
}

export async function getCards(
  filters: CardFilters
): Promise<PaginatedResponse<CardWithPrice>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 24, 1), 100);

  if (!isDatabaseConfigured()) {
    const all = applyDemoFilters(filters);
    const start = (page - 1) * perPage;
    return {
      data: all.slice(start, start + perPage),
      total: all.length,
      page,
      perPage,
      totalPages: Math.ceil(all.length / perPage),
    };
  }

  const where = {
    ...(filters.search && {
      OR: [
        { nameFr: { contains: filters.search, mode: "insensitive" as const } },
        { nameEn: { contains: filters.search, mode: "insensitive" as const } },
        {
          collectorNum: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
    ...(filters.extensionId && {
      extension: { code: filters.extensionId },
    }),
    ...(filters.type && { type: filters.type as never }),
    ...(filters.rarity && { rarity: filters.rarity as never }),
    ...((filters.costMin !== undefined || filters.costMax !== undefined) && {
      cost: {
        ...(filters.costMin !== undefined && { gte: filters.costMin }),
        ...(filters.costMax !== undefined && { lte: filters.costMax }),
      },
    }),
  };

  const dir = filters.sortOrder === "desc" ? ("desc" as const) : ("asc" as const);
  // Price sorting happens in SQL via the latest price row; deferred until
  // the price snapshot table gets a `isLatest` flag — fall back to name.
  const orderBy =
    filters.sortBy === "cost"
      ? { cost: dir }
      : filters.sortBy === "rarity"
        ? { rarity: dir }
        : filters.sortBy === "date"
          ? { createdAt: dir }
          : { nameEn: dir };

  const [total, cards] = await Promise.all([
    prisma.card.count({ where }),
    prisma.card.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        extension: true,
        prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
      },
    }),
  ]);

  return {
    data: cards.map((c) => ({
      id: c.id,
      collectorNum: c.collectorNum,
      nameFr: c.nameFr,
      nameEn: c.nameEn,
      descriptionFr: c.descriptionFr,
      descriptionEn: c.descriptionEn,
      type: c.type,
      rarity: c.rarity,
      cost: c.cost,
      attack: c.attack,
      health: c.health,
      imageUrl: c.imageUrl,
      domain: [],
      artist: "",
      tags: [],
      extension: {
        code: c.extension.code,
        nameFr: c.extension.nameFr,
        nameEn: c.extension.nameEn,
      },
      latestPrice: c.prices[0]
        ? {
            priceEur: Number(c.prices[0].priceEur),
            priceUsd: Number(c.prices[0].priceUsd),
            priceGbp: Number(c.prices[0].priceGbp),
            fetchedAt: c.prices[0].fetchedAt.toISOString(),
          }
        : null,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getCardById(id: string): Promise<CardWithPrice | null> {
  if (!isDatabaseConfigured()) {
    const card = sampleCards.find((c) => c.slug === id);
    return card ? demoCardToDto(card) : null;
  }

  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      extension: true,
      prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
    },
  });
  if (!card) return null;

  return {
    id: card.id,
    collectorNum: card.collectorNum,
    nameFr: card.nameFr,
    nameEn: card.nameEn,
    descriptionFr: card.descriptionFr,
    descriptionEn: card.descriptionEn,
    type: card.type,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    health: card.health,
    imageUrl: card.imageUrl,
    domain: [],
    artist: "",
    tags: [],
    extension: {
      code: card.extension.code,
      nameFr: card.extension.nameFr,
      nameEn: card.extension.nameEn,
    },
    latestPrice: card.prices[0]
      ? {
          priceEur: Number(card.prices[0].priceEur),
          priceUsd: Number(card.prices[0].priceUsd),
          priceGbp: Number(card.prices[0].priceGbp),
          fetchedAt: card.prices[0].fetchedAt.toISOString(),
        }
      : null,
  };
}

/** Strips trailing parenthetical variant suffixes, e.g.
 *  "Ahri - Inquisitive (Signature)" → "Ahri - Inquisitive". */
export function baseCardName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

/** Returns every printing/variant that shares a base name (incl. the card
 *  itself), sorted cheapest-first. Powers the "other versions" panel. */
export async function getCardVariants(
  cardId: string
): Promise<CardWithPrice[]> {
  if (!isDatabaseConfigured()) {
    const card = sampleCards.find((c) => c.slug === cardId);
    if (!card) return [];
    const base = baseCardName(card.nameEn).toLowerCase();
    return sampleCards
      .filter((c) => baseCardName(c.nameEn).toLowerCase() === base)
      .map(demoCardToDto)
      .sort(
        (a, b) =>
          (a.latestPrice?.priceEur ?? 1e9) - (b.latestPrice?.priceEur ?? 1e9)
      );
  }

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return [];
  const base = baseCardName(card.nameEn);
  const cards = await prisma.card.findMany({
    where: { nameEn: { startsWith: base } },
    include: {
      extension: true,
      prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
    },
  });
  return cards.map((c) => ({
    id: c.id,
    collectorNum: c.collectorNum,
    nameFr: c.nameFr,
    nameEn: c.nameEn,
    descriptionFr: c.descriptionFr,
    descriptionEn: c.descriptionEn,
    type: c.type,
    rarity: c.rarity,
    cost: c.cost,
    attack: c.attack,
    health: c.health,
    imageUrl: c.imageUrl,
    domain: [],
    artist: "",
    tags: [],
    extension: {
      code: c.extension.code,
      nameFr: c.extension.nameFr,
      nameEn: c.extension.nameEn,
    },
    latestPrice: c.prices[0]
      ? {
          priceEur: Number(c.prices[0].priceEur),
          priceUsd: Number(c.prices[0].priceUsd),
          priceGbp: Number(c.prices[0].priceGbp),
          fetchedAt: c.prices[0].fetchedAt.toISOString(),
        }
      : null,
  }));
}

export async function getPriceRows(filters: {
  search?: string;
  extensionId?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}): Promise<PaginatedResponse<PriceRow>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 50, 1), 100);

  if (!isDatabaseConfigured()) {
    let rows: PriceRow[] = sampleCards.map((card) => {
      const dto = demoCardToDto(card);
      const points = samplePricePoints(card);
      const previous = points[0];
      const latest = points[points.length - 1];
      const trend7d =
        previous && latest && previous.priceEur > 0
          ? ((latest.priceEur - previous.priceEur) / previous.priceEur) * 100
          : null;
      return { ...dto, trend7d };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.nameFr.toLowerCase().includes(q) ||
          r.nameEn.toLowerCase().includes(q) ||
          r.collectorNum.toLowerCase().includes(q)
      );
    }
    if (filters.extensionId) {
      rows = rows.filter((r) => r.extension.code === filters.extensionId);
    }

    const dir = filters.sortOrder === "asc" ? 1 : -1;
    rows.sort(
      (a, b) =>
        ((a.latestPrice?.priceEur ?? 0) - (b.latestPrice?.priceEur ?? 0)) * dir
    );

    const start = (page - 1) * perPage;
    return {
      data: rows.slice(start, start + perPage),
      total: rows.length,
      page,
      perPage,
      totalPages: Math.ceil(rows.length / perPage),
    };
  }

  const where = {
    ...(filters.search && {
      OR: [
        { nameFr: { contains: filters.search, mode: "insensitive" as const } },
        { nameEn: { contains: filters.search, mode: "insensitive" as const } },
        {
          collectorNum: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
    ...(filters.extensionId && { extension: { code: filters.extensionId } }),
  };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cards = await prisma.card.findMany({
    where,
    include: {
      extension: true,
      prices: { orderBy: { fetchedAt: "desc" }, take: 30 },
    },
  });

  const dir = filters.sortOrder === "asc" ? 1 : -1;
  const rows: PriceRow[] = cards
    .map((c) => {
      const latest = c.prices[0];
      const previous = c.prices.find((p) => p.fetchedAt <= sevenDaysAgo);
      const latestEur = latest ? Number(latest.priceEur) : null;
      const previousEur = previous ? Number(previous.priceEur) : null;
      return {
        id: c.id,
        collectorNum: c.collectorNum,
        nameFr: c.nameFr,
        nameEn: c.nameEn,
        descriptionFr: c.descriptionFr,
        descriptionEn: c.descriptionEn,
        type: c.type,
        rarity: c.rarity,
        cost: c.cost,
        attack: c.attack,
        health: c.health,
        imageUrl: c.imageUrl,
        domain: [],
        artist: "",
        tags: [],
        extension: {
          code: c.extension.code,
          nameFr: c.extension.nameFr,
          nameEn: c.extension.nameEn,
        },
        latestPrice: latest
          ? {
              priceEur: Number(latest.priceEur),
              priceUsd: Number(latest.priceUsd),
              priceGbp: Number(latest.priceGbp),
              fetchedAt: latest.fetchedAt.toISOString(),
            }
          : null,
        trend7d:
          latestEur !== null && previousEur !== null && previousEur > 0
            ? ((latestEur - previousEur) / previousEur) * 100
            : null,
      };
    })
    .sort(
      (a, b) =>
        ((a.latestPrice?.priceEur ?? 0) - (b.latestPrice?.priceEur ?? 0)) * dir
    );

  const start = (page - 1) * perPage;
  return {
    data: rows.slice(start, start + perPage),
    total: rows.length,
    page,
    perPage,
    totalPages: Math.ceil(rows.length / perPage),
  };
}
