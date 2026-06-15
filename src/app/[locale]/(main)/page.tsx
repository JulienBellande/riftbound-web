import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  Hammer,
  Crown,
  BarChart3,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { getDecks } from "@/lib/data/decks";
import { getPosts } from "@/lib/data/blog";
import { getPriceRows, getExtensions } from "@/lib/data/cards";
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
  rank,
}: {
  row: PriceRow;
  locale: SupportedLocale;
  rank?: number;
}) {
  const up = (row.trend7d ?? 0) >= 0;
  return (
    <Link
      href={{ pathname: "/cards/[id]", params: { id: row.id } }}
      className="group relative overflow-hidden rounded-xl bg-zinc-900/50 ring-1 ring-zinc-800/60 transition-all duration-300 hover:-translate-y-1 hover:ring-zinc-700 hover:shadow-xl hover:shadow-black/30"
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
        {rank && (
          <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-zinc-950/80 text-[10px] font-bold text-zinc-300 backdrop-blur-sm">
            {rank}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-10">
          <p className="truncate text-[11px] font-semibold text-zinc-100">
            {localizedName(row, locale)}
          </p>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200">
              {row.latestPrice
                ? formatPrice(row.latestPrice.priceEur, "EUR", locale)
                : "—"}
            </span>
            {row.trend7d !== null && (
              <span
                className={`flex items-center gap-0.5 text-[10px] font-bold ${up ? "text-emerald-400" : "text-red-400"}`}
              >
                {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {formatTrend(row.trend7d)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({
  icon,
  title,
  linkHref,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-lg font-bold text-zinc-100 sm:text-xl">{title}</h2>
      </div>
      {linkHref && linkText && (
        <Link
          href={linkHref as "/prices"}
          className="group flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-indigo-400"
        >
          {linkText}
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
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

  const [topDecks, latestPosts, priceData, extensions] = await Promise.all([
    getDecks({ period: "week", sortBy: "score", perPage: 3 }),
    getPosts(typedLocale, { perPage: 3 }),
    getPriceRows({ perPage: 100, sortOrder: "desc" }),
    getExtensions(),
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_rgba(99,102,241,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(245,158,11,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(139,92,246,0.06),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-400" />
            {t("hero.badge")}
          </div>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-zinc-50">{t("hero.titlePart1")}</span>
            <br />
            <span className="text-gradient-brand">{t("hero.titlePart2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-zinc-400 sm:text-base">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cards"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-110"
            >
              <Layers size={15} />
              {t("hero.cta")}
            </Link>
            <Link
              href="/deck-builder"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-900/40 px-6 py-2.5 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-800/50"
            >
              <Hammer size={15} />
              {t("hero.ctaSecondary")}
            </Link>
          </div>

          {/* Stats row */}
          <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-6 sm:gap-10">
            {[
              { value: "1 064", key: "cards" },
              { value: String(extensions.length), key: "sets" },
              { value: "€", key: "prices" },
            ].map((s) => (
              <div key={s.key} className="text-center">
                <div className="text-2xl font-black text-zinc-100 sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">
                  {t(`hero.stats.${s.key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </section>

      {/* Rising */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<TrendingUp className="text-emerald-400" size={20} />}
          title={t("movers.risingTitle")}
          linkHref="/prices"
          linkText={t("movers.viewAll")}
        />
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
          {rising.map((row) => (
            <MoverCard key={row.id} row={row} locale={typedLocale} />
          ))}
        </div>
      </section>

      {/* Falling */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<TrendingDown className="text-red-400" size={20} />}
          title={t("movers.fallingTitle")}
        />
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
          {falling.map((row) => (
            <MoverCard key={row.id} row={row} locale={typedLocale} />
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

      {/* Most valuable */}
      <section className="bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Crown className="text-amber-400" size={20} />}
            title={t("movers.valuableTitle")}
            linkHref="/prices"
            linkText={t("movers.viewAll")}
          />
          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
            {valuable.map((row, i) => (
              <MoverCard
                key={row.id}
                row={row}
                locale={typedLocale}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

      {/* Browse by set */}
      {extensions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<Layers className="text-indigo-400" size={20} />}
            title={t("browseSets.title")}
            linkHref="/cards"
            linkText={t("browseSets.viewAll")}
          />
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {extensions.map((ext) => (
              <Link
                key={ext.code}
                href={`/cards?ext=${ext.code}` as "/cards"}
                className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5"
              >
                <span className="text-xl font-black text-zinc-300 transition-colors group-hover:text-indigo-400">
                  {ext.code}
                </span>
                <span className="text-center text-[10px] leading-tight text-zinc-500">
                  {typedLocale === "fr" ? ext.nameFr : ext.nameEn}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {ext.count} {t("browseSets.cards")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

      {/* Top Decks */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          icon={<BarChart3 className="text-violet-400" size={20} />}
          title={t("topDecks.title")}
          linkHref="/decks"
          linkText={t("topDecks.viewAll")}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topDecks.data.map((deck) => (
            <Link
              key={deck.id}
              href={{ pathname: "/decks/[id]", params: { id: deck.id } }}
              className="group flex gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3.5 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <VoteButton deckId={deck.id} initialScore={deck.score} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-zinc-100">
                  {deck.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {deck.user.username} · {deck.format} ·{" "}
                  {deck.cards.reduce((s, c) => s + c.quantity, 0)}{" "}
                  {tDecks("cards")}
                </p>
                {deck.description && (
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
                    {deck.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

      {/* Latest News */}
      <section className="bg-gradient-to-b from-zinc-900/20 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader
            icon={<MessageCircle className="text-sky-400" size={20} />}
            title={t("latestNews.title")}
            linkHref="/blog"
            linkText={t("latestNews.viewAll")}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.data.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/30 transition-all hover:border-zinc-700"
              >
                <div className="aspect-video bg-gradient-to-br from-zinc-800/50 via-zinc-850/30 to-zinc-900/50" />
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                    {post.category.replace("_", " ")}
                  </span>
                  <h3 className="mt-1.5 text-sm font-bold text-zinc-100 transition-colors group-hover:text-indigo-400">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] text-zinc-600">
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
