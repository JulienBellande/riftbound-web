import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sampleCards } from "@/lib/data/sample-data";

/**
 * Anonymous identity layer.
 *
 * The site has no user accounts: anyone can browse, build decks, and post on
 * the forum without signing in. When someone publishes something, we attach a
 * throwaway pseudonym derived from a real Riftbound card name (e.g. "Ahri
 * #4821") so contributions stay readable without ever identifying a person.
 */

// Clean character names pulled from the real card pool: drop any "(Signature)"
// /"(Alternate Art)" suffix and keep the part before " - <title>".
const ALIAS_NAMES: string[] = Array.from(
  new Set(
    sampleCards
      .map((c) =>
        c.nameEn
          .replace(/\s*\([^)]*\)\s*$/g, "")
          .split(" - ")[0]
          .trim()
      )
      .filter((n): n is string => Boolean(n))
  )
);

/** A fresh, human-readable anonymous pseudonym based on a random card name. */
export function randomCardAlias(): string {
  const name =
    ALIAS_NAMES[Math.floor(Math.random() * ALIAS_NAMES.length)] ?? "Invocateur";
  const tag = Math.floor(1000 + Math.random() * 9000);
  return `${name} #${tag}`;
}

/** A stable card-name alias for a given index — used to attribute seed/sample
 *  content without inventing fake gamer handles. */
export function seedAlias(index: number): string {
  if (ALIAS_NAMES.length === 0) return "Invocateur";
  return ALIAS_NAMES[index % ALIAS_NAMES.length];
}

const VOTER_COOKIE = "rb_voter";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Stable per-visitor identifier kept in a cookie. Used to deduplicate/toggle
 * deck votes without accounts. Can only be set from a route handler / server
 * action (not during RSC render), which is exactly where voting happens.
 */
export async function getAnonVoterId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VOTER_COOKIE)?.value;
  if (existing) return existing;

  const id = `anon_${crypto.randomUUID()}`;
  try {
    jar.set(VOTER_COOKIE, id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR,
    });
  } catch {
    // Read-only context: fall back to an ephemeral id for this request.
  }
  return id;
}

/**
 * Database mode only: materialise a lightweight anonymous user row so foreign
 * keys (topics, decks, comments) resolve. Demo mode never calls this.
 */
export async function createAnonUser(username: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `anon_${crypto.randomUUID()}`;
    try {
      await prisma.user.create({
        data: { id, username, email: `${id}@anon.riftforge.local` },
      });
      return id;
    } catch {
      username = `${username.split(" #")[0]} #${Math.floor(
        1000 + Math.random() * 9000
      )}`;
    }
  }
  throw new Error("could_not_create_anon_user");
}

/** Database mode only: upsert the anonymous user backing a given voter id. */
export async function ensureAnonVoter(id: string): Promise<string> {
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      username: randomCardAlias(),
      email: `${id}@anon.riftforge.local`,
    },
  });
  return id;
}
