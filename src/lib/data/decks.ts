import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  sampleCards,
  sampleExtensions,
  samplePricePoints,
} from "./sample-data";
import { demoRead, demoMutate } from "./demo-store";
import type { CurrentUser } from "@/lib/auth";
import type {
  CardWithPrice,
  DeckFilters,
  DeckWithDetails,
  PaginatedResponse,
} from "@/types";

// ──────────────────────────────────────────────
// Demo decks — built from the sample card pool
// ──────────────────────────────────────────────

interface DemoUser {
  username: string;
  avatarUrl: string | null;
}

const DEMO_USERS: DemoUser[] = [
  { username: "ShadowMage", avatarUrl: null },
  { username: "FlameKnight", avatarUrl: null },
  { username: "RiftWalker42", avatarUrl: null },
  { username: "TideQueen", avatarUrl: null },
];

function demoCardDto(slug: string): CardWithPrice | null {
  const card = sampleCards.find((c) => c.slug === slug);
  if (!card) return null;
  const ext = sampleExtensions.find((e) => e.code === card.extensionCode)!;
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
    extension: { code: ext.code, nameFr: ext.nameFr, nameEn: ext.nameEn },
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

interface DemoDeckDef {
  id: string;
  name: string;
  description: string;
  format: string;
  score: number;
  user: DemoUser;
  createdAt: string;
  cardSlugs: { slug: string; qty: number }[];
}

// Deck recipes themed on a real domain; cards are selected from the real
// card pool at module load so every demo deck contains valid cards.
interface DeckRecipe {
  id: string;
  name: string;
  description: string;
  domain: string;
  score: number;
  user: DemoUser;
  ageDays: number;
}

const DECK_RECIPES: DeckRecipe[] = [
  {
    id: "demo-deck-1",
    name: "Fury Aggro",
    description:
      "Fast aggressive Fury deck that floods the board with cheap units and closes early.",
    domain: "Fury",
    score: 47,
    user: DEMO_USERS[0],
    ageDays: 2,
  },
  {
    id: "demo-deck-2",
    name: "Calm Control",
    description:
      "Patient Calm control shell that stabilises and grinds out the late game.",
    domain: "Calm",
    score: 38,
    user: DEMO_USERS[1],
    ageDays: 4,
  },
  {
    id: "demo-deck-3",
    name: "Mind Tempo",
    description: "Mind-based tempo deck leveraging card selection and value units.",
    domain: "Mind",
    score: 31,
    user: DEMO_USERS[2],
    ageDays: 1,
  },
  {
    id: "demo-deck-4",
    name: "Body Midrange",
    description: "Balanced Body midrange built around resilient threats.",
    domain: "Body",
    score: 24,
    user: DEMO_USERS[3],
    ageDays: 6,
  },
  {
    id: "demo-deck-5",
    name: "Order Ramp",
    description: "Order ramp into powerful top-end finishers to lock the board.",
    domain: "Order",
    score: 19,
    user: DEMO_USERS[0],
    ageDays: 3,
  },
  {
    id: "demo-deck-6",
    name: "Chaos Burn",
    description: "Aggressive Chaos burn that empties the hand and goes face.",
    domain: "Chaos",
    score: 12,
    user: DEMO_USERS[2],
    ageDays: 5,
  },
];

const QUANTITIES = [4, 4, 3, 3, 3, 2, 2, 2, 1, 1];

const DEMO_DECKS: DemoDeckDef[] = DECK_RECIPES.map((r) => {
  // Pick real, playable cards of the recipe's domain (no signature/alt-art
  // chase variants), sorted for stability.
  const pool = sampleCards
    .filter(
      (c) =>
        c.domain.includes(r.domain) &&
        !c.signature &&
        !c.altArt &&
        c.type !== "BATTLEFIELD" &&
        c.type !== "LEGEND"
    )
    .sort((a, b) => a.collectorNum.localeCompare(b.collectorNum))
    .slice(0, QUANTITIES.length);

  return {
    id: r.id,
    name: r.name,
    description: r.description,
    format: "standard",
    score: r.score,
    user: r.user,
    createdAt: new Date(Date.now() - r.ageDays * 86400000).toISOString(),
    cardSlugs: pool.map((c, i) => ({ slug: c.slug, qty: QUANTITIES[i] })),
  };
});

function buildDemoDecks(): DeckWithDetails[] {
  return DEMO_DECKS.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    format: d.format,
    score: d.score,
    createdAt: d.createdAt,
    user: d.user,
    cards: d.cardSlugs
      .map((cs) => {
        const card = demoCardDto(cs.slug);
        return card ? { quantity: cs.qty, card } : null;
      })
      .filter((c): c is { quantity: number; card: CardWithPrice } => c !== null),
    _count: { comments: (d.score * 7) % 13 },
  }));
}

// Demo persistence (file-backed, see ./demo-store) so created decks and votes
// survive the RSC-page / route-handler worker boundary in production builds.
type StoredDeck = DeckWithDetails & { isPublic: boolean };
type DeckVotes = Record<string, Record<string, 1 | -1>>;

const readCreatedDecks = () => demoRead<StoredDeck[]>("decks", []);

function voteDelta(deckId: string): number {
  const v = demoRead<DeckVotes>("votes", {})[deckId];
  return v ? Object.values(v).reduce((sum, n) => sum + n, 0) : 0;
}

function applyVoteDelta<T extends DeckWithDetails>(deck: T): T {
  return { ...deck, score: deck.score + voteDelta(deck.id) };
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function getDecks(
  filters: DeckFilters
): Promise<PaginatedResponse<DeckWithDetails>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 20, 1), 50);

  if (!isDatabaseConfigured()) {
    let decks = [
      ...readCreatedDecks().filter((d) => d.isPublic),
      ...buildDemoDecks(),
    ].map(applyVoteDelta);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      decks = decks.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.description ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.format) {
      decks = decks.filter((d) => d.format === filters.format);
    }

    if (filters.period === "month") {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      decks = decks.filter((d) => d.createdAt >= monthAgo);
    } else if (filters.period === "week") {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      decks = decks.filter((d) => d.createdAt >= weekAgo);
    }

    const dir = filters.sortBy === "date" ? -1 : -1;
    decks.sort((a, b) => {
      if (filters.sortBy === "date") return b.createdAt.localeCompare(a.createdAt);
      if (filters.sortBy === "name") return a.name.localeCompare(b.name);
      return (b.score - a.score) * dir;
    });

    const start = (page - 1) * perPage;
    return {
      data: decks.slice(start, start + perPage),
      total: decks.length,
      page,
      perPage,
      totalPages: Math.ceil(decks.length / perPage),
    };
  }

  // ── Prisma path ──
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const where = {
    isPublic: true,
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { description: { contains: filters.search, mode: "insensitive" as const } },
      ],
    }),
    ...(filters.format && { format: filters.format }),
    ...(filters.period === "week" && { createdAt: { gte: sevenDaysAgo } }),
    ...(filters.period === "month" && { createdAt: { gte: thirtyDaysAgo } }),
  };

  const dir = "desc" as const;
  const orderBy =
    filters.sortBy === "date"
      ? { createdAt: dir }
      : filters.sortBy === "name"
        ? { name: "asc" as const }
        : { score: dir };

  const [total, decks] = await Promise.all([
    prisma.deck.count({ where }),
    prisma.deck.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { username: true, avatarUrl: true } },
        cards: {
          include: {
            card: {
              include: {
                extension: true,
                prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
              },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return {
    data: decks.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      format: d.format,
      score: d.score,
      createdAt: d.createdAt.toISOString(),
      user: { username: d.user.username, avatarUrl: d.user.avatarUrl },
      cards: d.cards.map((dc) => ({
        quantity: dc.quantity,
        card: {
          id: dc.card.id,
          collectorNum: dc.card.collectorNum,
          nameFr: dc.card.nameFr,
          nameEn: dc.card.nameEn,
          descriptionFr: dc.card.descriptionFr,
          descriptionEn: dc.card.descriptionEn,
          type: dc.card.type,
          rarity: dc.card.rarity,
          cost: dc.card.cost,
          attack: dc.card.attack,
          health: dc.card.health,
          imageUrl: dc.card.imageUrl,
          domain: [],
          artist: "",
          tags: [],
          extension: {
            code: dc.card.extension.code,
            nameFr: dc.card.extension.nameFr,
            nameEn: dc.card.extension.nameEn,
          },
          latestPrice: dc.card.prices[0]
            ? {
                priceEur: Number(dc.card.prices[0].priceEur),
                priceUsd: Number(dc.card.prices[0].priceUsd),
                priceGbp: Number(dc.card.prices[0].priceGbp),
                fetchedAt: dc.card.prices[0].fetchedAt.toISOString(),
              }
            : null,
        },
      })),
      _count: d._count,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getDeckById(id: string): Promise<DeckWithDetails | null> {
  if (!isDatabaseConfigured()) {
    const created = readCreatedDecks().find((d) => d.id === id);
    if (created) return applyVoteDelta(created);
    const found = buildDemoDecks().find((d) => d.id === id);
    return found ? applyVoteDelta(found) : null;
  }

  const d = await prisma.deck.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, avatarUrl: true } },
      cards: {
        include: {
          card: {
            include: {
              extension: true,
              prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
            },
          },
        },
      },
      _count: { select: { comments: true } },
    },
  });
  if (!d) return null;

  return {
    id: d.id,
    name: d.name,
    description: d.description,
    format: d.format,
    score: d.score,
    createdAt: d.createdAt.toISOString(),
    user: { username: d.user.username, avatarUrl: d.user.avatarUrl },
    cards: d.cards.map((dc) => ({
      quantity: dc.quantity,
      card: {
        id: dc.card.id,
        collectorNum: dc.card.collectorNum,
        nameFr: dc.card.nameFr,
        nameEn: dc.card.nameEn,
        descriptionFr: dc.card.descriptionFr,
        descriptionEn: dc.card.descriptionEn,
        type: dc.card.type,
        rarity: dc.card.rarity,
        cost: dc.card.cost,
        attack: dc.card.attack,
        health: dc.card.health,
        imageUrl: dc.card.imageUrl,
          domain: [],
          artist: "",
          tags: [],
        extension: {
          code: dc.card.extension.code,
          nameFr: dc.card.extension.nameFr,
          nameEn: dc.card.extension.nameEn,
        },
        latestPrice: dc.card.prices[0]
          ? {
              priceEur: Number(dc.card.prices[0].priceEur),
              priceUsd: Number(dc.card.prices[0].priceUsd),
              priceGbp: Number(dc.card.prices[0].priceGbp),
              fetchedAt: dc.card.prices[0].fetchedAt.toISOString(),
            }
          : null,
      },
    })),
    _count: d._count,
  };
}

function baseScore(deckId: string): number {
  const demo = DEMO_DECKS.find((d) => d.id === deckId);
  if (demo) return demo.score;
  return readCreatedDecks().find((d) => d.id === deckId)?.score ?? 0;
}

export function castDemoVote(
  deckId: string,
  userId: string,
  value: 1 | -1
): { newScore: number } {
  // Votes are tracked as deltas on top of the deck's base score, toggled when
  // the same value is cast twice.
  let deckVotes: Record<string, 1 | -1> = {};
  demoMutate<DeckVotes>("votes", {}, (all) => {
    const dv = all[deckId] ?? {};
    if (dv[userId] === value) delete dv[userId];
    else dv[userId] = value;
    all[deckId] = dv;
    deckVotes = dv;
    return all;
  });

  const sum = Object.values(deckVotes).reduce((s, n) => s + n, 0);
  return { newScore: baseScore(deckId) + sum };
}

/**
 * Persist a vote in the database and return the recomputed deck score.
 * Re-voting with the same value removes the vote (toggle), matching the
 * demo behaviour.
 */
export async function castVote(
  deckId: string,
  userId: string,
  value: 1 | -1
): Promise<{ newScore: number }> {
  const existing = await prisma.vote.findUnique({
    where: { userId_deckId: { userId, deckId } },
  });

  await prisma.$transaction(async (tx) => {
    if (existing && existing.value === value) {
      await tx.vote.delete({ where: { id: existing.id } });
    } else if (existing) {
      await tx.vote.update({ where: { id: existing.id }, data: { value } });
    } else {
      await tx.vote.create({ data: { userId, deckId, value } });
    }

    const agg = await tx.vote.aggregate({
      where: { deckId },
      _sum: { value: true },
    });
    await tx.deck.update({
      where: { id: deckId },
      data: { score: agg._sum.value ?? 0 },
    });
  });

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { score: true },
  });
  return { newScore: deck?.score ?? 0 };
}

// ──────────────────────────────────────────────
// Deck creation & user decks
// ──────────────────────────────────────────────

export interface CreateDeckInput {
  name: string;
  description?: string;
  format: string;
  isPublic: boolean;
  cards: { cardId: string; quantity: number }[];
}

export async function createDeck(
  input: CreateDeckInput,
  user: CurrentUser
): Promise<{ id: string }> {
  if (!isDatabaseConfigured()) {
    const id = `user-deck-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const deck: StoredDeck = {
      id,
      name: input.name,
      description: input.description ?? null,
      format: input.format,
      isPublic: input.isPublic,
      score: 0,
      createdAt: new Date().toISOString(),
      user: { username: user.username, avatarUrl: user.avatarUrl },
      cards: input.cards
        .map((c) => {
          const card = demoCardDto(c.cardId);
          return card ? { quantity: c.quantity, card } : null;
        })
        .filter(
          (c): c is { quantity: number; card: CardWithPrice } => c !== null
        ),
      _count: { comments: 0 },
    };
    demoMutate<StoredDeck[]>("decks", [], (decks) => [deck, ...decks]);
    return { id };
  }

  const deck = await prisma.deck.create({
    data: {
      userId: user.id,
      name: input.name,
      description: input.description,
      format: input.format,
      isPublic: input.isPublic,
      cards: {
        create: input.cards.map((c) => ({
          cardId: c.cardId,
          quantity: c.quantity,
        })),
      },
    },
  });
  return { id: deck.id };
}

export async function getDecksByUser(
  userId: string
): Promise<DeckWithDetails[]> {
  if (!isDatabaseConfigured()) {
    if (userId !== "demo-user") return [];
    return readCreatedDecks().map(applyVoteDelta);
  }

  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, avatarUrl: true } },
      cards: {
        include: {
          card: {
            include: {
              extension: true,
              prices: { orderBy: { fetchedAt: "desc" }, take: 1 },
            },
          },
        },
      },
      _count: { select: { comments: true } },
    },
  });

  return decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    format: d.format,
    score: d.score,
    createdAt: d.createdAt.toISOString(),
    user: { username: d.user.username, avatarUrl: d.user.avatarUrl },
    cards: d.cards.map((dc) => ({
      quantity: dc.quantity,
      card: {
        id: dc.card.id,
        collectorNum: dc.card.collectorNum,
        nameFr: dc.card.nameFr,
        nameEn: dc.card.nameEn,
        descriptionFr: dc.card.descriptionFr,
        descriptionEn: dc.card.descriptionEn,
        type: dc.card.type,
        rarity: dc.card.rarity,
        cost: dc.card.cost,
        attack: dc.card.attack,
        health: dc.card.health,
        imageUrl: dc.card.imageUrl,
          domain: [],
          artist: "",
          tags: [],
        extension: {
          code: dc.card.extension.code,
          nameFr: dc.card.extension.nameFr,
          nameEn: dc.card.extension.nameEn,
        },
        latestPrice: dc.card.prices[0]
          ? {
              priceEur: Number(dc.card.prices[0].priceEur),
              priceUsd: Number(dc.card.prices[0].priceUsd),
              priceGbp: Number(dc.card.prices[0].priceGbp),
              fetchedAt: dc.card.prices[0].fetchedAt.toISOString(),
            }
          : null,
      },
    })),
    _count: d._count,
  }));
}
