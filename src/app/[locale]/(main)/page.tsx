import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
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
      className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <div className="relative aspect-[744/1039] w-full overflow-hidden">
        {row.imageUrl && (
          <Image
            src={row.imageUrl}
            alt={localizedName(row, locale)}
            fill
            quality={85}
            sizes="(max-width: 640px) 45vw, 180px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        {rank && (
          <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-[10px] font-bold text-zinc-300">
            {rank}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-8">
          <p className="truncate text-[11px] font-medium text-white">
            {localizedName(row, locale)}
          </p>
          <div className="mt-0.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              {row.latestPrice
                ? formatPrice(row.latestPrice.priceEur, "EUR", locale)
                : "—"}
            </span>
            {row.trend7d !== null && (
              <span
                className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}
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
  title,
  linkHref,
  linkText,
}: {
  title: string;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      {linkHref && linkText && (
        <Link
          href={linkHref as "/prices"}
          className="flex items-center gap-0.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {linkText}
          <ChevronRight size={12} />
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
      <section className="border-b border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {t("hero.badge")}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
              {t("hero.titlePart1")}{" "}
              <span className="text-amber-500">{t("hero.titlePart2")}</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {t("hero.subtitle")}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/cards"
                className="rounded-lg bg-zinc-100 px-5 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
              >
                {t("hero.cta")}
              </Link>
              <Link
                href="/deck-builder"
                className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>

          <div className="mt-10 flex gap-8">
            {[
              { value: "1 064", key: "cards" },
              { value: String(extensions.length), key: "sets" },
              { value: "€", key: "prices" },
            ].map((s) => (
              <div key={s.key}>
                <div className="text-xl font-bold text-zinc-100">
                  {s.value}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {t(`hero.stats.${s.key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rising */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          title={t("movers.risingTitle")}
          linkHref="/prices"
          linkText={t("movers.viewAll")}
        />
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {rising.map((row) => (
            <MoverCard key={row.id} row={row} locale={typedLocale} />
          ))}
        </div>
      </section>

      {/* Falling */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <SectionHeader title={t("movers.fallingTitle")} />
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {falling.map((row) => (
            <MoverCard key={row.id} row={row} locale={typedLocale} />
          ))}
        </div>
      </section>

      {/* Most valuable */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            title={t("movers.valuableTitle")}
            linkHref="/prices"
            linkText={t("movers.viewAll")}
          />
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
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

      {/* Browse by set */}
      {extensions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            title={t("browseSets.title")}
            linkHref="/cards"
            linkText={t("browseSets.viewAll")}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {extensions.map((ext) => (
              <Link
                key={ext.code}
                href={`/cards?ext=${ext.code}` as "/cards"}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center transition-colors hover:border-zinc-700"
              >
                <div className="text-sm font-bold text-zinc-200">
                  {ext.code}
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-500">
                  {typedLocale === "fr" ? ext.nameFr : ext.nameEn}
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-600">
                  {ext.count} {t("browseSets.cards")}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Decks */}
      <section className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            title={t("topDecks.title")}
            linkHref="/decks"
            linkText={t("topDecks.viewAll")}
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topDecks.data.map((deck) => (
              <Link
                key={deck.id}
                href={{ pathname: "/decks/[id]", params: { id: deck.id } }}
                className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700"
              >
                <VoteButton deckId={deck.id} initialScore={deck.score} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-zinc-100">
                    {deck.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {deck.user.username} · {deck.format} ·{" "}
                    {deck.cards.reduce((s, c) => s + c.quantity, 0)}{" "}
                    {tDecks("cards")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            title={t("latestNews.title")}
            linkHref="/blog"
            linkText={t("latestNews.viewAll")}
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.data.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
              >
                <div className="aspect-video bg-zinc-800" />
                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                    {post.category.replace("_", " ")}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
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
