import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCardById, getCardVariants } from "@/lib/data/cards";
import {
  formatPrice,
  localizedName,
  localizedDescription,
} from "@/lib/utils/format";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-gradient-to-br from-amber-300 to-orange-500",
  PROMO: "bg-gradient-to-br from-fuchsia-400 to-pink-600",
};

const RARITY_BG: Record<string, string> = {
  COMMON: "border-zinc-800/60 bg-zinc-900/40",
  UNCOMMON: "border-emerald-800/30 bg-emerald-950/10",
  RARE: "border-sky-800/30 bg-sky-950/10",
  EPIC: "border-violet-800/30 bg-violet-950/10",
  SHOWCASE: "border-amber-800/30 bg-amber-950/10",
  PROMO: "border-fuchsia-800/30 bg-fuchsia-950/10",
};

function variantLabel(name: string): string {
  const m = name.match(/\(([^)]*)\)\s*$/);
  return m ? m[1] : "Standard";
}

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "bg-red-500/15 text-red-400 ring-red-500/25",
  Calm: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/25",
  Mind: "bg-purple-500/15 text-purple-400 ring-purple-500/25",
  Body: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  Chaos: "bg-rose-500/15 text-rose-400 ring-rose-500/25",
  Order: "bg-sky-500/15 text-sky-400 ring-sky-500/25",
  Colorless: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/25",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const card = await getCardById(id);
  if (!card) return {};

  const name = localizedName(card, locale as SupportedLocale);
  const description =
    localizedDescription(card, locale as SupportedLocale) ?? undefined;
  return {
    title: `${name} | RiftForge`,
    description,
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [card, variants] = await Promise.all([
    getCardById(id),
    getCardVariants(id),
  ]);
  if (!card) notFound();

  const t = await getTranslations({ locale, namespace: "cards" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const typedLocale = locale as SupportedLocale;

  const name = localizedName(card, typedLocale);
  const description = localizedDescription(card, typedLocale);
  const otherVariants = variants.filter((v) => v.id !== card.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Back link */}
      <Link
        href="/cards"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        {tCommon("back")}
      </Link>

      <div className="mt-5 grid gap-8 md:grid-cols-[300px_1fr] lg:gap-10">
        {/* Card image */}
        <div className="mx-auto w-full max-w-[300px]">
          <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/40 ring-1 ring-zinc-800/50">
            {card.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={name}
                width={744}
                height={1039}
                className="w-full"
                priority
              />
            ) : (
              <div className="aspect-[744/1039] w-full bg-zinc-800" />
            )}
          </div>
          {card.artist && (
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Art: {card.artist}
            </p>
          )}
        </div>

        {/* Card info */}
        <div>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black text-zinc-100 sm:text-3xl">
                {name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {card.extension.nameEn} · #{card.extension.code}
              </p>
            </div>
            {/* Rarity badge */}
            <div
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${RARITY_BG[card.rarity] ?? RARITY_BG.COMMON}`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${RARITY_DOT[card.rarity] ?? RARITY_DOT.COMMON}`}
                />
                <span className="text-zinc-200">
                  {t(`rarities.${card.rarity}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Domain + tags */}
          {(card.domain.length > 0 || card.tags.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.domain.map((d) => (
                <span
                  key={d}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${DOMAIN_COLORS[d] ?? "bg-zinc-800 text-zinc-400 ring-zinc-700"}`}
                >
                  {d}
                </span>
              ))}
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-800/50 px-2.5 py-0.5 text-[11px] text-zinc-400 ring-1 ring-zinc-700/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mt-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3.5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                {description}
              </p>
            </div>
          )}

          {/* Attributes grid */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                {t("filters.type")}
              </dt>
              <dd className="mt-1 text-sm font-bold text-zinc-200">
                {t(`types.${card.type}`)}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                {t("filters.rarity")}
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-bold text-zinc-200">
                <span
                  className={`h-2 w-2 rounded-full ${RARITY_DOT[card.rarity] ?? RARITY_DOT.COMMON}`}
                />
                {t(`rarities.${card.rarity}`)}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
              <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                {t("filters.cost")}
              </dt>
              <dd className="mt-1 text-sm font-black text-amber-400">
                {card.cost}
              </dd>
            </div>
            {card.attack !== null && (
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
                <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                  {t("detail.stats")}
                </dt>
                <dd className="mt-1 text-sm font-black text-orange-400">
                  {card.attack}
                </dd>
              </div>
            )}
          </div>

          {/* Prices */}
          {card.latestPrice && (
            <div className="mt-6">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <ExternalLink size={12} />
                {t("detail.marketPrices")}
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-amber-800/25 bg-amber-950/10 p-3 text-center">
                  <div className="text-lg font-black text-amber-400">
                    {formatPrice(
                      card.latestPrice.priceEur,
                      "EUR",
                      typedLocale
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                    EUR
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 text-center">
                  <div className="text-lg font-black text-zinc-200">
                    {formatPrice(
                      card.latestPrice.priceUsd,
                      "USD",
                      typedLocale
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                    USD
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 text-center">
                  <div className="text-lg font-black text-zinc-200">
                    {formatPrice(
                      card.latestPrice.priceGbp,
                      "GBP",
                      typedLocale
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase text-zinc-600">
                    GBP
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-zinc-700">
                {t("detail.priceDate", {
                  date: new Date(
                    card.latestPrice.fetchedAt
                  ).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB"),
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Other printings / variants */}
      {otherVariants.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {t("detail.otherVersions")} ({otherVariants.length})
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[card, ...otherVariants].map((v) => {
              const isCurrent = v.id === card.id;
              return (
                <Link
                  key={v.id}
                  href={{ pathname: "/cards/[id]", params: { id: v.id } }}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                    isCurrent
                      ? "border-indigo-500/40 bg-indigo-500/5"
                      : "border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }`}
                >
                  {v.imageUrl ? (
                    <Image
                      src={v.imageUrl}
                      alt=""
                      width={40}
                      height={56}
                      quality={70}
                      className="shrink-0 rounded ring-1 ring-zinc-800"
                    />
                  ) : (
                    <span className="h-14 w-10 shrink-0 rounded bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${RARITY_DOT[v.rarity] ?? "bg-zinc-500"}`}
                      />
                      <span className="truncate text-sm font-medium text-zinc-200">
                        {variantLabel(v.nameEn)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {v.extension.code} · {t(`rarities.${v.rarity}`)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-400">
                    {v.latestPrice
                      ? formatPrice(v.latestPrice.priceEur, "EUR", typedLocale)
                      : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
