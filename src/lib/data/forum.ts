import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { demoRead, demoMutate } from "./demo-store";
import type { CurrentUser } from "@/lib/auth";
import type { SupportedLocale, PaginatedResponse } from "@/types";

export interface ForumCategoryWithCounts {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  topicCount: number;
  replyCount: number;
  lastActivity: string | null;
}

export interface ForumTopicSummary {
  id: string;
  title: string;
  user: { username: string; avatarUrl: string | null };
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumTopicDetail extends ForumTopicSummary {
  content: string;
  replies: {
    id: string;
    content: string;
    user: { username: string; avatarUrl: string | null };
    createdAt: string;
  }[];
}

const DEMO_CATEGORIES: (ForumCategoryWithCounts & {
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
})[] = [
  {
    id: "cat-strategy",
    slug: "strategy",
    name: "",
    nameFr: "Stratégie",
    nameEn: "Strategy",
    description: null,
    descFr: "Discussions autour des stratégies et du métagame",
    descEn: "Discussions about strategies and the metagame",
    topicCount: 142,
    replyCount: 1203,
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "cat-trades",
    slug: "trades",
    name: "",
    nameFr: "Échanges",
    nameEn: "Trades",
    description: null,
    descFr: "Proposez vos échanges de cartes",
    descEn: "Post your card trade offers",
    topicCount: 89,
    replyCount: 567,
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "cat-tournaments",
    slug: "tournaments",
    name: "",
    nameFr: "Tournois",
    nameEn: "Tournaments",
    description: null,
    descFr: "Annonces et résultats de tournois",
    descEn: "Tournament announcements and results",
    topicCount: 34,
    replyCount: 298,
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cat-general",
    slug: "general",
    name: "",
    nameFr: "Général",
    nameEn: "General",
    description: null,
    descFr: "Discussion libre autour de Riftbound",
    descEn: "Open discussion about Riftbound",
    topicCount: 210,
    replyCount: 1876,
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
  },
];

const DEMO_TOPICS: (ForumTopicDetail & { categorySlug: string })[] = [
  {
    id: "topic-1",
    categorySlug: "strategy",
    title: "Ignis nerf incoming — what decks survive?",
    content:
      "With the announced nerf to Ignis, Emberheart Control will take a hit. What do you think will rise to fill the void? I'm betting on Chainbreaker Midrange personally.",
    user: { username: "ShadowMage", avatarUrl: null },
    replyCount: 23,
    viewCount: 412,
    isPinned: true,
    isLocked: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [
      {
        id: "reply-1",
        content:
          "Tide Oracle Combo will definitely benefit. Without Ignis burning you down, slower decks can thrive.",
        user: { username: "RiftWalker42", avatarUrl: null },
        createdAt: new Date(Date.now() - 1.5 * 86400000).toISOString(),
      },
      {
        id: "reply-2",
        content:
          "I think aggro decks like Duskblade will dominate. Less control = more face damage.",
        user: { username: "FlameKnight", avatarUrl: null },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    id: "topic-2",
    categorySlug: "strategy",
    title: "Best budget deck for ranked climb?",
    content:
      "I'm a new player with a limited collection. What's the cheapest competitive deck I can build right now?",
    user: { username: "NewRifter", avatarUrl: null },
    replyCount: 15,
    viewCount: 287,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    replies: [
      {
        id: "reply-3",
        content:
          "Blitz Runes is very cheap to build — mostly commons and uncommons, and it's surprisingly effective up to Gold rank.",
        user: { username: "TideQueen", avatarUrl: null },
        createdAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "topic-3",
    categorySlug: "trades",
    title: "[WTT] My Kaelen for your Theron",
    content:
      "I have a foil Kaelen, Duskblade that I'd like to trade for Theron, Chainbreaker. DM me if interested!",
    user: { username: "FlameKnight", avatarUrl: null },
    replyCount: 4,
    viewCount: 67,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    replies: [],
  },
  {
    id: "topic-4",
    categorySlug: "tournaments",
    title: "Rift Masters S2 — Looking for team practice partners",
    content:
      "Anyone registered for Rift Masters Season 2 and wants to practice together? I'm currently Diamond 2.",
    user: { username: "TideQueen", avatarUrl: null },
    replyCount: 8,
    viewCount: 156,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    replies: [],
  },
  {
    id: "topic-5",
    categorySlug: "general",
    title: "What's your favourite card art?",
    content:
      "Just curious — which card do you think has the best artwork? For me it's Vyra, Tide Oracle. The colours are incredible.",
    user: { username: "RiftWalker42", avatarUrl: null },
    replyCount: 31,
    viewCount: 543,
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    replies: [],
  },
];

// Topics created during a demo session, persisted via the demo file store so
// they survive the RSC-page / route-handler worker boundary.
type SessionTopic = ForumTopicDetail & { categorySlug: string };
const sessionTopics = () => demoRead<SessionTopic[]>("topics", []);

export async function getForumCategory(
  slug: string,
  locale: SupportedLocale
): Promise<ForumCategoryWithCounts | null> {
  const categories = await getForumCategories(locale);
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getForumCategories(
  locale: SupportedLocale
): Promise<ForumCategoryWithCounts[]> {
  if (!isDatabaseConfigured()) {
    return DEMO_CATEGORIES.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: locale === "fr" ? c.nameFr : c.nameEn,
      description: locale === "fr" ? c.descFr : c.descEn,
      topicCount: c.topicCount,
      replyCount: c.replyCount,
      lastActivity: c.lastActivity,
    }));
  }

  const nameField = locale === "fr" ? "nameFr" : "nameEn";
  const descField = locale === "fr" ? "descriptionFr" : "descriptionEn";

  const categories = await prisma.forumCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { topics: true } },
      topics: {
        select: {
          _count: { select: { replies: true } },
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c[nameField] as string,
    description: (c[descField] as string) ?? null,
    topicCount: c._count.topics,
    replyCount: c.topics.reduce((s, t) => s + t._count.replies, 0),
    lastActivity: c.topics[0]?.updatedAt.toISOString() ?? null,
  }));
}

export async function getTopics(
  categorySlug: string,
  filters: { page?: number; perPage?: number }
): Promise<PaginatedResponse<ForumTopicSummary>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 20, 1), 50);

  if (!isDatabaseConfigured()) {
    const topics = [...sessionTopics(), ...DEMO_TOPICS]
      .filter((t) => t.categorySlug === categorySlug)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    const start = (page - 1) * perPage;
    return {
      data: topics.slice(start, start + perPage),
      total: topics.length,
      page,
      perPage,
      totalPages: Math.ceil(topics.length / perPage),
    };
  }

  const category = await prisma.forumCategory.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) return { data: [], total: 0, page, perPage, totalPages: 0 };

  const where = { categoryId: category.id };
  const [total, topics] = await Promise.all([
    prisma.forumTopic.count({ where }),
    prisma.forumTopic.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { username: true, avatarUrl: true } },
        _count: { select: { replies: true } },
      },
    }),
  ]);

  return {
    data: topics.map((t) => ({
      id: t.id,
      title: t.title,
      user: { username: t.user.username, avatarUrl: t.user.avatarUrl },
      replyCount: t._count.replies,
      viewCount: t.viewCount,
      isPinned: t.isPinned,
      isLocked: t.isLocked,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getTopicById(
  id: string
): Promise<ForumTopicDetail | null> {
  if (!isDatabaseConfigured()) {
    return (
      sessionTopics().find((t) => t.id === id) ??
      DEMO_TOPICS.find((t) => t.id === id) ??
      null
    );
  }

  const t = await prisma.forumTopic.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { username: true, avatarUrl: true } } },
      },
      _count: { select: { replies: true } },
    },
  });
  if (!t) return null;

  return {
    id: t.id,
    title: t.title,
    content: t.content,
    user: { username: t.user.username, avatarUrl: t.user.avatarUrl },
    replyCount: t._count.replies,
    viewCount: t.viewCount,
    isPinned: t.isPinned,
    isLocked: t.isLocked,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    replies: t.replies.map((r) => ({
      id: r.id,
      content: r.content,
      user: { username: r.user.username, avatarUrl: r.user.avatarUrl },
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function createTopic(
  categorySlug: string,
  input: { title: string; content: string },
  user: CurrentUser
): Promise<{ id: string }> {
  const now = new Date().toISOString();

  if (!isDatabaseConfigured()) {
    const id = `user-topic-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    demoMutate<SessionTopic[]>("topics", [], (topics) => [
      {
        id,
        categorySlug,
        title: input.title,
        content: input.content,
        user: { username: user.username, avatarUrl: user.avatarUrl },
        replyCount: 0,
        viewCount: 0,
        isPinned: false,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
        replies: [],
      },
      ...topics,
    ]);
    return { id };
  }

  const category = await prisma.forumCategory.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) throw new Error("unknown_category");

  const topic = await prisma.forumTopic.create({
    data: {
      categoryId: category.id,
      userId: user.id,
      title: input.title,
      content: input.content,
    },
  });
  return { id: topic.id };
}

export async function createReply(
  topicId: string,
  content: string,
  user: CurrentUser
): Promise<{ id: string }> {
  if (!isDatabaseConfigured()) {
    const id = `user-reply-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const createdAt = new Date().toISOString();
    let found = false;
    demoMutate<SessionTopic[]>("topics", [], (topics) =>
      topics.map((t) => {
        if (t.id !== topicId) return t;
        found = true;
        return {
          ...t,
          replyCount: t.replyCount + 1,
          updatedAt: createdAt,
          replies: [
            ...t.replies,
            {
              id,
              content,
              user: { username: user.username, avatarUrl: user.avatarUrl },
              createdAt,
            },
          ],
        };
      })
    );
    if (!found) throw new Error("topic_not_found_or_readonly");
    return { id };
  }

  const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error("topic_not_found");
  if (topic.isLocked) throw new Error("topic_locked");

  const reply = await prisma.forumReply.create({
    data: { topicId, userId: user.id, content },
  });
  return { id: reply.id };
}

/** True when a topic accepts replies in the current mode (demo topics from the
 *  static seed are read-only; only session-created ones can be replied to). */
export function isTopicReplyable(topicId: string): boolean {
  if (!isDatabaseConfigured()) {
    return sessionTopics().some((t) => t.id === topicId);
  }
  return true;
}
