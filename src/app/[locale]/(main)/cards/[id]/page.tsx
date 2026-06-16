import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
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
  SHOWCASE: "bg-amber-400",
  PROMO: "bg-fuchsia-500",
};

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "bg-red-500/10 text-red-400",
  Calm: "bg-cyan-500/10 text-cyan-400",
  Mind: "bg-purple-500/10 text-purple-400",
  Body: "bg-amber-500/10 text-amber-400",
  Chaos: "bg-rose-500/10 text-rose-400",
  Order: "bg-sky-500/10 text-sky-400",
  Colorless: "bg-zinc-500/10 text-zinc-400",
};

function variantLabel(name: string): string {
  const m = name.match(/\(([^)]*)\)\s*$/);
  return m ? m[1] : "Standard";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const card = await getCardById(id);
  if (!card) return {};
  const name = localizedName(card, locale as SupportedLocale);
  return { title: `${name} | RiftForge` };
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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/cards"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft size={12} />
        {tCommon("back")}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Image */}
        <div className="mx-auto w-full max-w-[280px]">
          <div className="overflow-hidden rounded-lg border border-zinc-800">
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
            <p className="mt-1.5 text-center text-[10px] text-zinc-600">
              Art: {card.artist}
            </p>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{name}</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            {typedLocale === "fr"
              ? card.extension.nameFr
              : card.extension.nameEn}{" "}
            · #{card.collectorNum}
          </p>

          {/* Domain + tags */}
          {(card.domain.length > 0 || card.tags.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1">
              {card.domain.map((d) => (
                <span
                  key={d}
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${DOMAIN_COLORS[d] ?? "bg-zinc-800 text-zinc-400"}`}
                >
                  {d}
                </span>
              ))}
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {description}
            </p>
          )}

          {/* Attributes */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: t("filters.type"), value: t(`types.${card.type}`) },
              {
                label: t("filters.rarity"),
                value: t(`rarities.${card.rarity}`),
                dot: RARITY_DOT[card.rarity],
              },
              { label: t("filters.cost"), value: String(card.cost), amber: true },
              card.attack !== null
                ? { label: t("detail.stats"), value: String(card.attack), orange: true }
                : null,
            ]
              .filter(Boolean)
              .map((attr) => (
                <div
                  key={attr!.label}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-600">
                    {attr!.label}
                  </dt>
                  <dd className={`mt-1 text-sm font-bold ${attr!.amber ? "text-amber-400" : attr!.orange ? "text-orange-400" : "text-zinc-200"}`}>
                    {attr!.dot && (
                      <span
                        className={`mr-1.5 inline-block h-2 w-2 rounded-full ${attr!.dot}`}
                      />
                    )}
                    {attr!.value}
                  </dd>
                </div>
              ))}
          </div>

          {/* Prices */}
          {card.latestPrice && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("detail.marketPrices")}
              </h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { currency: "EUR" as const, price: card.latestPrice.priceEur, highlight: true },
                  { currency: "USD" as const, price: card.latestPrice.priceUsd },
                  { currency: "GBP" as const, price: card.latestPrice.priceGbp },
                ].map(({ currency, price, highlight }) => (
                  <div
                    key={currency}
                    className={`rounded-lg border p-3 text-center ${
                      highlight
                        ? "border-amber-800/30 bg-amber-950/10"
                        : "border-zinc-800 bg-zinc-900"
                    }`}
                  >
                    <div className={`text-lg font-bold ${highlight ? "text-amber-400" : "text-zinc-200"}`}>
                      {formatPrice(price, currency, typedLocale)}
                    </div>
                    <div className="mt-0.5 text-[10px] font-medium uppercase text-zinc-600">
                      {currency}
                    </div>
                  </div>
                ))}
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

      {/* Variants */}
      {otherVariants.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t("detail.otherVersions")} ({otherVariants.length})
          </h2>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {[card, ...otherVariants].map((v) => {
              const isCurrent = v.id === card.id;
              return (
                <Link
                  key={v.id}
                  href={{ pathname: "/cards/[id]", params: { id: v.id } }}
                  className={`flex items-center gap-2.5 rounded-lg border p-2 transition-colors ${
                    isCurrent
                      ? "border-zinc-600 bg-zinc-800"
                      : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                  }`}
                >
                  {v.imageUrl ? (
                    <Image
                      src={v.imageUrl}
                      alt=""
                      width={36}
                      height={50}
                      quality={60}
                      className="shrink-0 rounded"
                    />
                  ) : (
                    <span className="h-[50px] w-9 shrink-0 rounded bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${RARITY_DOT[v.rarity] ?? "bg-zinc-500"}`}
                      />
                      <span className="truncate text-xs font-medium text-zinc-200">
                        {variantLabel(v.nameEn)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      {v.extension.code} #{v.collectorNum} ·{" "}
                      {t(`rarities.${v.rarity}`)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-emerald-400">
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
