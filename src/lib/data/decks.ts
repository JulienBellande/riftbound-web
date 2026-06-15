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
    latestPrice: {
      priceEur: latest.priceEur,
      priceUsd: latest.priceUsd,
      priceGbp: latest.priceGbp,
      fetchedAt: new Date().toISOString(),
    },
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

const DEMO_DECKS: DemoDeckDef[] = [
  {
    id: "demo-deck-1",
    name: "Duskblade Aggro",
    description: "Fast aggressive deck built around Kaelen and cheap units.",
    format: "standard",
    score: 47,
    user: DEMO_USERS[0],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    cardSlugs: [
      { slug: "ogn-002", qty: 4 },
      { slug: "ogn-001", qty: 3 },
      { slug: "ogn-004", qty: 1 },
      { slug: "ogn-005", qty: 2 },
      { slug: "ogn-003", qty: 3 },
      { slug: "sfr-001", qty: 4 },
      { slug: "sfr-009", qty: 3 },
      { slug: "emb-001", qty: 4 },
      { slug: "emb-006", qty: 2 },
      { slug: "emb-009", qty: 4 },
    ],
  },
  {
    id: "demo-deck-2",
    name: "Emberheart Control",
    description: "Heavy burn control deck that dominates the late game with Ignis.",
    format: "standard",
    score: 38,
    user: DEMO_USERS[1],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    cardSlugs: [
      { slug: "emb-004", qty: 1 },
      { slug: "emb-002", qty: 3 },
      { slug: "emb-003", qty: 4 },
      { slug: "emb-008", qty: 2 },
      { slug: "emb-007", qty: 2 },
      { slug: "emb-012", qty: 2 },
      { slug: "ogn-009", qty: 4 },
      { slug: "ogn-010", qty: 3 },
      { slug: "ogn-006", qty: 3 },
      { slug: "emb-005", qty: 1 },
    ],
  },
  {
    id: "demo-deck-3",
    name: "Tide Oracle Combo",
    description: "Spell-heavy combo deck leveraging Vyra's card selection and Echo Weaver.",
    format: "standard",
    score: 31,
    user: DEMO_USERS[2],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    cardSlugs: [
      { slug: "ogn-012", qty: 1 },
      { slug: "sfr-002", qty: 2 },
      { slug: "sfr-003", qty: 1 },
      { slug: "ogn-003", qty: 4 },
      { slug: "ogn-009", qty: 4 },
      { slug: "ogn-006", qty: 3 },
      { slug: "sfr-004", qty: 3 },
      { slug: "sfr-006", qty: 2 },
      { slug: "ogn-011", qty: 2 },
      { slug: "emb-009", qty: 3 },
    ],
  },
  {
    id: "demo-deck-4",
    name: "Chainbreaker Midrange",
    description: "Balanced midrange with Theron as a finisher against Gear-heavy metas.",
    format: "standard",
    score: 24,
    user: DEMO_USERS[3],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    cardSlugs: [
      { slug: "sfr-008", qty: 1 },
      { slug: "sfr-001", qty: 4 },
      { slug: "sfr-004", qty: 3 },
      { slug: "sfr-005", qty: 2 },
      { slug: "sfr-010", qty: 3 },
      { slug: "sfr-011", qty: 2 },
      { slug: "ogn-001", qty: 4 },
      { slug: "ogn-008", qty: 2 },
      { slug: "emb-010", qty: 3 },
      { slug: "emb-003", qty: 2 },
    ],
  },
  {
    id: "demo-deck-5",
    name: "Frost Ramp",
    description: "Ramp into Frost Colossus and Magma Behemoth to lock the board.",
    format: "standard",
    score: 19,
    user: DEMO_USERS[0],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    cardSlugs: [
      { slug: "ogn-008", qty: 2 },
      { slug: "emb-008", qty: 2 },
      { slug: "ogn-007", qty: 1 },
      { slug: "ogn-009", qty: 4 },
      { slug: "ogn-001", qty: 4 },
      { slug: "sfr-004", qty: 4 },
      { slug: "ogn-005", qty: 3 },
      { slug: "sfr-007", qty: 1 },
      { slug: "emb-009", qty: 4 },
      { slug: "ogn-010", qty: 2 },
    ],
  },
  {
    id: "demo-deck-6",
    name: "Blitz Runes",
    description: "Aggressive rune-based tempo deck that empties the hand fast.",
    format: "standard",
    score: 12,
    user: DEMO_USERS[2],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    cardSlugs: [
      { slug: "ogn-006", qty: 4 },
      { slug: "sfr-006", qty: 4 },
      { slug: "emb-007", qty: 3 },
      { slug: "ogn-002", qty: 4 },
      { slug: "sfr-001", qty: 4 },
      { slug: "emb-001", qty: 4 },
      { slug: "emb-006", qty: 2 },
      { slug: "sfr-009", qty: 4 },
      { slug: "emb-009", qty: 3 },
      { slug: "emb-010", qty: 3 },
    ],
  },
];

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
    _count: { comments: Math.floor(Math.random() * 12) },
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
