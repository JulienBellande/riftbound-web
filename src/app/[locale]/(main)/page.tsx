import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDecks } from "@/lib/data/decks";
import { getPosts } from "@/lib/data/blog";
import { getPriceRows } from "@/lib/data/cards";
import { VoteButton } from "@/components/decks/vote-button";
import { formatPrice, formatTrend, localizedName } from "@/lib/utils/format";
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

  const [topDecks, latestPosts, priceData] = await Promise.all([
    getDecks({ period: "week", sortBy: "score", perPage: 3 }),
    getPosts(typedLocale, { perPage: 3 }),
    getPriceRows({ perPage: 50, sortOrder: "desc" }),
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
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cards"
              className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-colors hover:bg-amber-500"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href="/decks"
              className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Top Decks */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">
            {t("topDecks.title")}
          </h2>
          <Link
            href="/decks"
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            {t("topDecks.viewAll")}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topDecks.data.map((deck) => (
            <Link
              key={deck.id}
              href={{ pathname: "/decks/[id]", params: { id: deck.id } }}
              className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-100">{deck.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {deck.user.username} · {deck.format}
                  </p>
                </div>
                <VoteButton deckId={deck.id} initialScore={deck.score} />
              </div>
              {deck.description && (
                <p className="mt-3 flex-1 line-clamp-2 text-sm text-zinc-400">
                  {deck.description}
                </p>
              )}
              <div className="mt-3 text-xs text-zinc-500">
                {deck.cards.reduce((s, c) => s + c.quantity, 0)}{" "}
                {tDecks("cards")}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-100">
              {t("latestNews.title")}
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-amber-500 hover:text-amber-400"
            >
              {t("latestNews.viewAll")}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.data.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700"
              >
                <div className="aspect-video bg-zinc-800/50" />
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    {post.category.replace("_", " ")}
                  </span>
                  <h3 className="mt-2 font-semibold text-zinc-100">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-zinc-500">
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-zinc-100">
          {t("priceAlerts.title")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500">
              {t("priceAlerts.rising")}
            </h3>
            <div className="mt-4 space-y-3">
              {rising.map((row) => (
                <Link
                  key={row.id}
                  href={{ pathname: "/cards/[id]", params: { id: row.id } }}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-3 transition-colors hover:bg-zinc-800/50"
                >
                  <span className="text-sm text-zinc-200">
                    {localizedName(row, typedLocale)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">
                      {row.latestPrice
                        ? formatPrice(row.latestPrice.priceEur, "EUR", typedLocale)
                        : "—"}
                    </span>
                    <span className="text-sm font-medium text-emerald-400">
                      {row.trend7d !== null ? formatTrend(row.trend7d) : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500">
              {t("priceAlerts.falling")}
            </h3>
            <div className="mt-4 space-y-3">
              {falling.map((row) => (
                <Link
                  key={row.id}
                  href={{ pathname: "/cards/[id]", params: { id: row.id } }}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-3 transition-colors hover:bg-zinc-800/50"
                >
                  <span className="text-sm text-zinc-200">
                    {localizedName(row, typedLocale)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">
                      {row.latestPrice
                        ? formatPrice(row.latestPrice.priceEur, "EUR", typedLocale)
                        : "—"}
                    </span>
                    <span className="text-sm font-medium text-red-400">
                      {row.trend7d !== null ? formatTrend(row.trend7d) : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
