import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { demoRead, demoMutate } from "./demo-store";
import { createAnonUser } from "@/lib/anon";

export interface DeckComment {
  id: string;
  content: string;
  user: { username: string; avatarUrl: string | null };
  createdAt: string;
}

type CommentMap = Record<string, DeckComment[]>;

export async function getDeckComments(deckId: string): Promise<DeckComment[]> {
  if (!isDatabaseConfigured()) {
    return demoRead<CommentMap>("comments", {})[deckId] ?? [];
  }

  const comments = await prisma.comment.findMany({
    where: { parentType: "DECK", deckId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, avatarUrl: true } } },
  });

  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    user: { username: c.user.username, avatarUrl: c.user.avatarUrl },
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function createDeckComment(
  deckId: string,
  content: string,
  authorName: string
): Promise<DeckComment> {
  if (!isDatabaseConfigured()) {
    const comment: DeckComment = {
      id: `demo-comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content,
      user: { username: authorName, avatarUrl: null },
      createdAt: new Date().toISOString(),
    };
    demoMutate<CommentMap>("comments", {}, (map) => {
      map[deckId] = [comment, ...(map[deckId] ?? [])];
      return map;
    });
    return comment;
  }

  const userId = await createAnonUser(authorName);
  const c = await prisma.comment.create({
    data: { parentType: "DECK", deckId, userId, content },
    include: { user: { select: { username: true, avatarUrl: true } } },
  });

  return {
    id: c.id,
    content: c.content,
    user: { username: c.user.username, avatarUrl: c.user.avatarUrl },
    createdAt: c.createdAt.toISOString(),
  };
}
