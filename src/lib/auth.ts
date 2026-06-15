import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  isDemo: boolean;
}

/**
 * Synthetic account used in demo mode (no database / Supabase configured) so
 * that every community feature — saving decks, posting on the forum,
 * commenting, voting — is fully explorable without any external service.
 */
export const DEMO_USER: CurrentUser = {
  id: "demo-user",
  username: "Compte démo",
  email: "demo@riftbound.local",
  avatarUrl: null,
  role: "USER",
  isDemo: true,
};

function supabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Returns the currently authenticated user, or a demo account when running
 * without a database. Returns null only in configured (production) mode when
 * no valid session exists.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isDatabaseConfigured() || !supabaseConfigured()) {
    return DEMO_USER;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Lazily mirror the Supabase auth user into our own users table so that
  // foreign keys (decks, votes, comments…) resolve.
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing) {
    return {
      id: existing.id,
      username: existing.username,
      email: existing.email,
      avatarUrl: existing.avatarUrl,
      role: existing.role,
      isDemo: false,
    };
  }

  const email = user.email ?? `${user.id}@users.noreply.riftbound`;
  const metaName =
    (user.user_metadata?.username as string | undefined) ??
    email.split("@")[0];

  const created = await createUserWithUniqueUsername(user.id, email, metaName);
  return {
    id: created.id,
    username: created.username,
    email: created.email,
    avatarUrl: created.avatarUrl,
    role: created.role,
    isDemo: false,
  };
}

async function createUserWithUniqueUsername(
  id: string,
  email: string,
  desiredUsername: string
) {
  let username = desiredUsername.slice(0, 24) || "player";
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.user.create({
        data: { id, email, username },
      });
    } catch {
      // Username (or email) collision — append a short random suffix and retry.
      username = `${desiredUsername.slice(0, 18)}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;
    }
  }
  // Last resort: guarantee uniqueness from the auth id.
  return prisma.user.create({
    data: { id, email, username: `player_${id.slice(0, 8)}` },
  });
}
