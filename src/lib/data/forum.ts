import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { demoRead, demoMutate } from "./demo-store";
import { createAnonUser } from "@/lib/anon";
import type { SupportedLocale, PaginatedResponse } from "@/types";

export interface ForumCategoryWithCounts {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Icon key resolved to a lucide icon by the UI. */
  icon: string;
  topicCount: number;
  replyCount: number;
  lastActivity: string | null;
}

export interface ForumTopicSummary {
  id: string;
  title: string;
  user: { username: string; avatarUrl: string | null };
  replyCount: number;
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

// ──────────────────────────────────────────────
// Fixed category set. Clear, self-explanatory sections so newcomers know
// exactly where to post. Counts are always computed from real topics — never
// fabricated.
// ──────────────────────────────────────────────

interface CategoryDef {
  slug: string;
  icon: string;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    slug: "general",
    icon: "general",
    nameFr: "Général",
    nameEn: "General",
    descFr: "Discussions ouvertes autour de Riftbound et de la communauté.",
    descEn: "Open discussion about Riftbound and the community.",
  },
  {
    slug: "strategy",
    icon: "strategy",
    nameFr: "Stratégie & Méta",
    nameEn: "Strategy & Meta",
    descFr: "Tactiques, analyses de matchups et évolution du métagame.",
    descEn: "Tactics, matchup analysis and how the metagame is shifting.",
  },
  {
    slug: "decks",
    icon: "decks",
    nameFr: "Decks",
    nameEn: "Decks",
    descFr: "Partagez vos listes, demandez des retours et améliorez vos decks.",
    descEn: "Share your lists, ask for feedback and refine your decks.",
  },
  {
    slug: "help",
    icon: "help",
    nameFr: "Entraide",
    nameEn: "Help",
    descFr: "Questions de règles et coups de main pour les nouveaux joueurs.",
    descEn: "Rules questions and a hand for new players.",
  },
  {
    slug: "events",
    icon: "events",
    nameFr: "Événements & Tournois",
    nameEn: "Events & Tournaments",
    descFr: "Organisez, annoncez et débriefez vos tournois et rencontres.",
    descEn: "Organise, announce and recap your tournaments and meetups.",
  },
];

function iconForSlug(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.icon ?? "general";
}

export function isForumCategory(slug: string): boolean {
  return CATEGORIES.some((c) => c.slug === slug);
}

// Topics created during a demo session, persisted via the file store so they
// survive the RSC-page / route-handler worker boundary in production builds.
type SessionTopic = ForumTopicDetail & { categorySlug: string };
const sessionTopics = () => demoRead<SessionTopic[]>("topics", []);

function toSummary(t: SessionTopic): ForumTopicSummary {
  return {
    id: t.id,
    title: t.title,
    user: t.user,
    replyCount: t.replies.length,
    isPinned: t.isPinned,
    isLocked: t.isLocked,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function getForumCategories(
  locale: SupportedLocale
): Promise<ForumCategoryWithCounts[]> {
  if (!isDatabaseConfigured()) {
    const topics = sessionTopics();
    return CATEGORIES.map((c) => {
      const inCat = topics.filter((t) => t.categorySlug === c.slug);
      const replyCount = inCat.reduce((s, t) => s + t.replies.length, 0);
      const lastActivity = inCat.reduce<string | null>(
        (acc, t) => (!acc || t.updatedAt > acc ? t.updatedAt : acc),
        null
      );
      return {
        id: `cat-${c.slug}`,
        slug: c.slug,
        name: locale === "fr" ? c.nameFr : c.nameEn,
        description: locale === "fr" ? c.descFr : c.descEn,
        icon: c.icon,
        topicCount: inCat.length,
        replyCount,
        lastActivity,
      };
    });
  }

  const nameField = locale === "fr" ? "nameFr" : "nameEn";
  const descField = locale === "fr" ? "descriptionFr" : "descriptionEn";

  const categories = await prisma.forumCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { topics: true } },
      topics: {
        select: { _count: { select: { replies: true } }, updatedAt: true },
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
    icon: iconForSlug(c.slug),
    topicCount: c._count.topics,
    replyCount: c.topics.reduce((s, t) => s + t._count.replies, 0),
    lastActivity: c.topics[0]?.updatedAt.toISOString() ?? null,
  }));
}

export async function getForumCategory(
  slug: string,
  locale: SupportedLocale
): Promise<ForumCategoryWithCounts | null> {
  const categories = await getForumCategories(locale);
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getTopics(
  categorySlug: string,
  filters: { page?: number; perPage?: number }
): Promise<PaginatedResponse<ForumTopicSummary>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 20, 1), 50);

  if (!isDatabaseConfigured()) {
    const topics = sessionTopics()
      .filter((t) => t.categorySlug === categorySlug)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    const start = (page - 1) * perPage;
    return {
      data: topics.slice(start, start + perPage).map(toSummary),
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
    return sessionTopics().find((t) => t.id === id) ?? null;
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
  authorName: string
): Promise<{ id: string }> {
  if (!isForumCategory(categorySlug)) throw new Error("unknown_category");
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
        user: { username: authorName, avatarUrl: null },
        replyCount: 0,
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

  const userId = await createAnonUser(authorName);
  const topic = await prisma.forumTopic.create({
    data: {
      categoryId: category.id,
      userId,
      title: input.title,
      content: input.content,
    },
  });
  return { id: topic.id };
}

export async function createReply(
  topicId: string,
  content: string,
  authorName: string
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
          updatedAt: createdAt,
          replies: [
            ...t.replies,
            {
              id,
              content,
              user: { username: authorName, avatarUrl: null },
              createdAt,
            },
          ],
        };
      })
    );
    if (!found) throw new Error("topic_not_found");
    return { id };
  }

  const topic = await prisma.forumTopic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error("topic_not_found");
  if (topic.isLocked) throw new Error("topic_locked");

  const userId = await createAnonUser(authorName);
  const reply = await prisma.forumReply.create({
    data: { topicId, userId, content },
  });
  return { id: reply.id };
}

/** Whether a topic accepts replies (true unless explicitly locked). */
export async function isTopicReplyable(topicId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return sessionTopics().some((t) => t.id === topicId && !t.isLocked);
  }
  const topic = await prisma.forumTopic.findUnique({
    where: { id: topicId },
    select: { isLocked: true },
  });
  return !!topic && !topic.isLocked;
}
