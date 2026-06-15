import "server-only";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Tiny JSON file store for demo-mode persistence.
 *
 * In a production build Next.js renders RSC pages in a worker separate from the
 * one running route handlers, so neither module-level variables nor globalThis
 * are shared between "writing" an entity (API route) and "reading" it (page).
 * A file in the OS temp dir is the simplest store that survives that boundary.
 *
 * This is only ever used when no database is configured (demo mode); it is not
 * a production data store.
 */
const FILE = join(tmpdir(), "riftbound-demo-store.json");

type Store = Record<string, unknown>;

function readAll(): Store {
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

function writeAll(store: Store): void {
  try {
    writeFileSync(FILE, JSON.stringify(store));
  } catch {
    // Best-effort: a read-only filesystem just means demo data won't persist.
  }
}

export function demoRead<T>(key: string, fallback: T): T {
  const all = readAll();
  return (all[key] as T) ?? fallback;
}

export function demoMutate<T>(key: string, fallback: T, fn: (current: T) => T): T {
  const all = readAll();
  const current = (all[key] as T) ?? fallback;
  const next = fn(current);
  all[key] = next;
  writeAll(all);
  return next;
}
