import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getCardById } from "@/lib/data/cards";
import {
  formatPrice,
  localizedName,
  localizedDescription,
} from "@/lib/utils/format";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "bg-red-500/20 text-red-400 ring-red-500/30",
  Calm: "bg-cyan-500/20 text-cyan-400 ring-cyan-500/30",
  Mind: "bg-purple-500/20 text-purple-400 ring-purple-500/30",
  Body: "bg-amber-500/20 text-amber-400 ring-amber-500/30",
  Chaos: "bg-rose-500/20 text-rose-400 ring-rose-500/30",
  Order: "bg-sky-500/20 text-sky-400 ring-sky-500/30",
  Colorless: "bg-zinc-500/20 text-zinc-400 ring-zinc-500/30",
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

  const card = await getCardById(id);
  if (!card) notFound();

  const t = await getTranslations({ locale, namespace: "cards" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const typedLocale = locale as SupportedLocale;

  const name = localizedName(card, typedLocale);
  const description = localizedDescription(card, typedLocale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cards"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft size={16} />
        {tCommon("back")}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[320px_1fr]">
        {/* Card image */}
        <div className="mx-auto w-full max-w-[320px]">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={name}
              width={744}
              height={1039}
              className="w-full rounded-xl shadow-2xl"
              priority
            />
          ) : (
            <div className="aspect-[744/1039] w-full rounded-xl bg-zinc-800" />
          )}
          {card.artist && (
            <p className="mt-2 text-center text-xs text-zinc-600">
              Art: {card.artist}
            </p>
          )}
        </div>

        {/* Card info */}
        <div>
          <h1 className="text-3xl font-black text-zinc-100">{name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {card.extension.nameEn} · #{card.extension.code}
          </p>

          {/* Domain badges */}
          {card.domain.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {card.domain.map((d) => (
                <span
                  key={d}
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ring-1 ${DOMAIN_COLORS[d] ?? "bg-zinc-800 text-zinc-400 ring-zinc-700"}`}
                >
                  {d}
                </span>
              ))}
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-800/60 px-3 py-0.5 text-xs text-zinc-400 ring-1 ring-zinc-700/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {description}
            </p>
          )}

          {/* Attributes */}
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3.5">
              <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                {t("filters.type")}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-200">
                {t(`types.${card.type}`)}
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3.5">
              <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                {t("filters.rarity")}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-200">
                {t(`rarities.${card.rarity}`)}
              </dd>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3.5">
              <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                Energy
              </dt>
              <dd className="mt-1 text-sm font-bold text-amber-400">
                {card.cost}
              </dd>
            </div>
            {card.attack !== null && (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3.5">
                <dt className="text-[10px] uppercase tracking-widest text-zinc-600">
                  Might
                </dt>
                <dd className="mt-1 text-sm font-bold text-orange-400">
                  {card.attack}
                </dd>
              </div>
            )}
          </dl>

          {/* Prices */}
          {card.latestPrice && (
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {t("detail.marketPrices")}
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-amber-800/30 bg-amber-950/10 p-4 text-center">
                  <div className="text-lg font-bold text-amber-400">
                    {formatPrice(
                      card.latestPrice.priceEur,
                      "EUR",
                      typedLocale
                    )}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase text-zinc-600">
                    EUR
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-center">
                  <div className="text-lg font-bold text-zinc-200">
                    {formatPrice(
                      card.latestPrice.priceUsd,
                      "USD",
                      typedLocale
                    )}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase text-zinc-600">
                    USD
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-center">
                  <div className="text-lg font-bold text-zinc-200">
                    {formatPrice(
                      card.latestPrice.priceGbp,
                      "GBP",
                      typedLocale
                    )}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase text-zinc-600">
                    GBP
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-zinc-700">
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
