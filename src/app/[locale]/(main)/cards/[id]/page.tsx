import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getCardById } from "@/lib/data/cards";
import { CardFrame } from "@/components/cards/card-frame";
import {
  formatPrice,
  localizedName,
  localizedDescription,
} from "@/lib/utils/format";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

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
    title: `${name} | Riftbound`,
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

  const card = await getCardById(id);
  if (!card) notFound();

  const t = await getTranslations({ locale, namespace: "cards" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const typedLocale = locale as SupportedLocale;

  const name = localizedName(card, typedLocale);
  const description = localizedDescription(card, typedLocale);
  const extensionName = localizedName(card.extension, typedLocale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cards"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft size={16} />
        {tCommon("back")}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[300px_1fr]">
        {/* Card visual */}
        <div className="mx-auto w-full max-w-[300px]">
          <CardFrame
            card={card}
            locale={typedLocale}
            typeLabel={t(`types.${card.type}`)}
          />
        </div>

        {/* Card info */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {extensionName} · #{card.extension.code}
          </p>

          {description && (
            <p className="mt-4 text-zinc-300">{description}</p>
          )}

          {/* Attributes */}
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                {t("filters.type")}
              </dt>
              <dd className="mt-1 font-semibold text-zinc-200">
                {t(`types.${card.type}`)}
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                {t("filters.rarity")}
              </dt>
              <dd className="mt-1 font-semibold text-zinc-200">
                {t(`rarities.${card.rarity}`)}
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                {t("filters.cost")}
              </dt>
              <dd className="mt-1 font-semibold text-amber-400">
                {card.cost}
              </dd>
            </div>
            {card.attack !== null && card.health !== null && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  {t("detail.stats")}
                </dt>
                <dd className="mt-1 font-semibold">
                  <span className="text-orange-400">{card.attack}</span>
                  <span className="text-zinc-600"> / </span>
                  <span className="text-emerald-400">{card.health}</span>
                </dd>
              </div>
            )}
          </dl>

          {/* Prices */}
          {card.latestPrice && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                {t("detail.marketPrices")}
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-center">
                  <div className="text-lg font-bold text-amber-400">
                    {formatPrice(card.latestPrice.priceEur, "EUR", typedLocale)}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">EUR</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                  <div className="text-lg font-bold text-zinc-200">
                    {formatPrice(card.latestPrice.priceUsd, "USD", typedLocale)}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">USD</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                  <div className="text-lg font-bold text-zinc-200">
                    {formatPrice(card.latestPrice.priceGbp, "GBP", typedLocale)}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">GBP</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-600">
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
    </div>
  );
}
