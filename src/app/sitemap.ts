import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCards } from "@/lib/data/cards";
import { getPosts } from "@/lib/data/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://riftforge.example.com";

const STATIC_PATHS = [
  "/",
  "/cards",
  "/decks",
  "/deck-builder",
  "/blog",
  "/forum",
  "/privacy",
  "/terms",
  "/legal",
] as const;

function localizedPath(pathname: string, locale: "fr" | "en"): string {
  const entry = routing.pathnames[pathname as keyof typeof routing.pathnames];
  const path = typeof entry === "string" ? entry : entry?.[locale] ?? pathname;
  return `/${locale}${path === "/" ? "" : path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}${localizedPath(path, locale)}`,
        changeFrequency: path === "/" ? "daily" : "weekly",
        priority: path === "/" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${BASE_URL}${localizedPath(path, l)}`])
          ),
        },
      });
    }
  }

  const [cards, posts] = await Promise.all([
    getCards({ perPage: 100 }),
    getPosts("fr", { perPage: 50 }),
  ]);

  for (const card of cards.data) {
    for (const locale of routing.locales) {
      const base = locale === "fr" ? "/fr/cartes" : "/en/cards";
      entries.push({
        url: `${BASE_URL}${base}/${card.id}`,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  for (const post of posts.data) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
