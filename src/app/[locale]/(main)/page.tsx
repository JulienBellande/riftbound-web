import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { TrendingUp, TrendingDown, Sparkles, Layers, Hammer } from "lucide-react";
import { getDecks } from "@/lib/data/decks";
import { getPosts } from "@/lib/data/blog";
import { getPriceRows } from "@/lib/data/cards";
import { VoteButton } from "@/components/decks/vote-button";
import {
  formatPrice,
  formatTrend,
  localizedName,
} from "@/lib/utils/format";
import type { PriceRow } from "@/lib/data/cards";
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

function MoverCard({
  row,
  locale,
}: {
  row: PriceRow;
  locale: SupportedLocale;
}) {
  const up = (row.trend7d ?? 0) >= 0;
  return (
    <Link
      href={{ pathname: "/cards/[id]", params: { id: row.id } }}
      className="group relative overflow-hidden rounded-xl bg-zinc-900/50 ring-1 ring-zinc-800/60 transition-all hover:ring-zinc-700"
    >
      <div className="relative aspect-[744/1039] w-full overflow-hidden bg-zinc-800/60">
        {row.imageUrl && (
          <Image
            src={row.imageUrl}
            alt={localizedName(row, locale)}
            fill
            quality={90}
            sizes="(max-width: 640px) 45vw, 180px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-8">
          <p className="truncate text-xs font-semibold text-zinc-100">
            {localizedName(row, locale)}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-200">
              {row.latestPrice
                ? formatPrice(row.latestPrice.priceEur, "EUR", locale)
                : "—"}
            </span>
            {row.trend7d !== null && (
              <span
                className={`flex items-center gap-0.5 text-xs font-bold ${up ? "text-emerald-400" : "text-red-400"}`}
              >
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {formatTrend(row.trend7d)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
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
    getPriceRows({ perPage: 100, sortOrder: "desc" }),
  ]);

  const rising = priceData.data
    .filter((r) => r.trend7d !== null && r.trend7d > 0 && r.imageUrl)
    .sort((a, b) => (b.trend7d ?? 0) - (a.trend7d ?? 0))
    .slice(0, 6);
  const falling = priceData.data
    .filter((r) => r.trend7d !== null && r.trend7d < 0 && r.imageUrl)
    .sort((a, b) => (a.trend7d ?? 0) - (b.trend7d ?? 0))
    .slice(0, 6);
  const valuable = priceData.data
    .filter((r) => r.imageUrl && r.latestPrice)
    .sort(
      (a, b) =>
        (b.latestPrice?.priceEur ?? 0) - (a.latestPrice?.priceEur ?? 0)
    )
    .slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,_rgba(99,102,241,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,_rgba(245,158,11,0.10),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur">
            <Sparkles size={13} className="text-amber-400" />
            {t("hero.badge")}
          </div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-zinc-50">{t("hero.titlePart1")}</span>
            <br />
            <span className="text-gradient-brand">{t("hero.titlePart2")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cards"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:brightness-110"
            >
              <Layers size={16} />
              {t("hero.cta")}
            </Link>
            <Link
              href="/deck-builder"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-7 py-3 text-sm font-semibold text-zinc-200 backdrop-blur transition-all hover:border-zinc-600 hover:bg-zinc-800/60"
            >
              <Hammer size={16} />
              {t("hero.ctaSecondary")}
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
            {[
              { value: "1064", key: "cards" },
              { value: "7", key: "sets" },
              { value: "€", key: "prices" },
            ].map((s) => (
              <div
                key={s.key}
                className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-3 py-4"
              >
                <div className="text-2xl font-black text-zinc-100">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-zinc-500">
                  {t(`hero.stats.${s.key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price movers */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={22} />
          <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
            {t("movers.risingTitle")}
          </h2>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {rising.map((row) => (
            <MoverCard key={row.id} row={row} locale={typedLocale} />
          ))}
        </div>

        <div className="mt-12 flex items-center gap-2">
          <TrendingDown className="text-red-400" size={22} />
          <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
            {t("movers.fallingTitle")}
          </h2>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {falling.map((row) => (
            <MoverCard key={row.id} row={row} locale={typedLocale} />
          ))}
        </div>
      </section>

      {/* Most valuable */}
      <section className="border-y border-zinc-800/40 bg-zinc-900/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={22} />
              <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl">
                {t("movers.valuableTitle")}
              </h2>
            </div>
            <Link
              href="/prices"
              className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              {t("movers.viewAll")} →
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {valuable.map((row) => (
              <MoverCard key={row.id} row={row} locale={typedLocale} />
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
            className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
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
              className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
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
                <div className="aspect-video bg-gradient-to-br from-zinc-800/60 to-zinc-900/60" />
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
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
    </>
  );
}
