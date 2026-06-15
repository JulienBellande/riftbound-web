import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getDecks } from "@/lib/data/decks";
import { getPosts } from "@/lib/data/blog";
import { getCards, getPriceRows } from "@/lib/data/cards";
import { VoteButton } from "@/components/decks/vote-button";
import {
  formatPrice,
  formatTrend,
  localizedName,
} from "@/lib/utils/format";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tDecks = await getTranslations({ locale, namespace: "decks" });
  const typedLocale = locale as SupportedLocale;

  const [topDecks, latestPosts, priceData, featuredCards] = await Promise.all([
    getDecks({ period: "week", sortBy: "score", perPage: 3 }),
    getPosts(typedLocale, { perPage: 3 }),
    getPriceRows({ perPage: 50, sortOrder: "desc" }),
    getCards({ perPage: 8, sortBy: "rarity", sortOrder: "desc" }),
  ]);

  const rising = priceData.data
    .filter((r) => r.trend7d !== null && r.trend7d > 0)
    .sort((a, b) => (b.trend7d ?? 0) - (a.trend7d ?? 0))
    .slice(0, 4);
  const falling = priceData.data
    .filter((r) => r.trend7d !== null && r.trend7d < 0)
    .sort((a, b) => (a.trend7d ?? 0) - (b.trend7d ?? 0))
    .slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/40 bg-zinc-950 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(245,158,11,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(168,85,247,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-zinc-100">{t("hero.titlePart1")}</span>{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {t("hero.titlePart2")}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/cards"
                className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:brightness-110"
              >
                {t("hero.cta")}
              </Link>
              <Link
                href="/deck-builder"
                className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-7 py-3 text-sm font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-600 hover:text-zinc-100"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* Featured card images strip */}
          <div className="mt-14 flex justify-center gap-3 overflow-hidden">
            {featuredCards.data.slice(0, 6).map((card, i) => (
              <Link
                key={card.id}
                href={{ pathname: "/cards/[id]", params: { id: card.id } }}
                className="group relative w-28 shrink-0 overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:w-36"
                style={{ opacity: i === 0 || i === 5 ? 0.6 : 1 }}
              >
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={localizedName(card, typedLocale)}
                    width={148}
                    height={207}
                    className="aspect-[744/1039] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[744/1039] w-full bg-zinc-800" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Decks */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
            {t("topDecks.title")}
          </h2>
          <Link
            href="/decks"
            className="text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
          >
            {t("topDecks.viewAll")} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topDecks.data.map((deck) => (
            <Link
              key={deck.id}
              href={{ pathname: "/decks/[id]", params: { id: deck.id } }}
              className="flex gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <VoteButton deckId={deck.id} initialScore={deck.score} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-zinc-100">
                  {deck.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {deck.user.username} · {deck.format} ·{" "}
                  {deck.cards.reduce((s, c) => s + c.quantity, 0)}{" "}
                  {tDecks("cards")}
                </p>
                {deck.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                    {deck.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="border-t border-zinc-800/40 bg-zinc-900/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
              {t("latestNews.title")}
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
            >
              {t("latestNews.viewAll")} →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.data.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30 transition-all hover:border-zinc-700"
              >
                <div className="aspect-video bg-zinc-800/50" />
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                    {post.category.replace("_", " ")}
                  </span>
                  <h3 className="mt-2 font-semibold text-zinc-100">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-zinc-600">
                    {new Date(post.publishedAt).toLocaleDateString(
                      typedLocale === "fr" ? "fr-FR" : "en-GB"
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Price Movements */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
          {t("priceAlerts.title")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              ▲ {t("priceAlerts.rising")}
            </h3>
            <div className="mt-3 space-y-2">
              {rising.map((row) => (
                <Link
                  key={row.id}
                  href={{ pathname: "/cards/[id]", params: { id: row.id } }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-800/40"
                >
                  {row.imageUrl && (
                    <Image
                      src={row.imageUrl}
                      alt=""
                      width={28}
                      height={39}
                      className="rounded-sm"
                    />
                  )}
                  <span className="flex-1 truncate text-sm text-zinc-200">
                    {localizedName(row, typedLocale)}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {row.latestPrice
                      ? formatPrice(
                          row.latestPrice.priceEur,
                          "EUR",
                          typedLocale
                        )
                      : "—"}
                  </span>
                  <span className="w-16 text-right text-sm font-semibold text-emerald-400">
                    {row.trend7d !== null ? formatTrend(row.trend7d) : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">
              ▼ {t("priceAlerts.falling")}
            </h3>
            <div className="mt-3 space-y-2">
              {falling.map((row) => (
                <Link
                  key={row.id}
                  href={{ pathname: "/cards/[id]", params: { id: row.id } }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-800/40"
                >
                  {row.imageUrl && (
                    <Image
                      src={row.imageUrl}
                      alt=""
                      width={28}
                      height={39}
                      className="rounded-sm"
                    />
                  )}
                  <span className="flex-1 truncate text-sm text-zinc-200">
                    {localizedName(row, typedLocale)}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {row.latestPrice
                      ? formatPrice(
                          row.latestPrice.priceEur,
                          "EUR",
                          typedLocale
                        )
                      : "—"}
                  </span>
                  <span className="w-16 text-right text-sm font-semibold text-red-400">
                    {row.trend7d !== null ? formatTrend(row.trend7d) : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
