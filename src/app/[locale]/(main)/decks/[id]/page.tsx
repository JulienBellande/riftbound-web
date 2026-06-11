import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft, User } from "lucide-react";
import { getDeckById } from "@/lib/data/decks";
import { VoteButton } from "@/components/decks/vote-button";
import { DeckCardList } from "@/components/decks/deck-card-list";
import { ManaCurve } from "@/components/decks/mana-curve";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deck = await getDeckById(id);
  if (!deck) return {};
  return {
    title: `${deck.name} | Riftbound`,
    description: deck.description ?? undefined,
  };
}

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const deck = await getDeckById(id);
  if (!deck) notFound();

  const t = await getTranslations({ locale, namespace: "decks" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const typedLocale = locale as SupportedLocale;
  const totalCards = deck.cards.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = deck.cards.reduce(
    (s, c) => s + (c.card.latestPrice?.priceEur ?? 0) * c.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/decks"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft size={16} />
        {tCommon("back")}
      </Link>

      <div className="mt-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">{deck.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {deck.user.username}
              </span>
              <span className="capitalize">{deck.format}</span>
              <span>
                {new Date(deck.createdAt).toLocaleDateString(
                  typedLocale === "fr" ? "fr-FR" : "en-GB"
                )}
              </span>
            </div>
            {deck.description && (
              <p className="mt-3 max-w-2xl text-zinc-300">{deck.description}</p>
            )}
          </div>
          <VoteButton deckId={deck.id} initialScore={deck.score} />
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <div className="text-2xl font-bold text-zinc-100">{totalCards}</div>
            <div className="mt-1 text-xs text-zinc-500">{t("cards")}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {new Intl.NumberFormat(typedLocale === "fr" ? "fr-FR" : "en-GB", {
                style: "currency",
                currency: "EUR",
              }).format(totalPrice)}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {typedLocale === "fr" ? "Valeur estimée" : "Estimated value"}
            </div>
          </div>
          <div className="col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {typedLocale === "fr" ? "Courbe de mana" : "Mana curve"}
            </div>
            <ManaCurve cards={deck.cards} />
          </div>
        </div>

        {/* Card list */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {t("deckList")}
          </h2>
          <DeckCardList cards={deck.cards} locale={typedLocale} />
        </div>
      </div>
    </div>
  );
}
