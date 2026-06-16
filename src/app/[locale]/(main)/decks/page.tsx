import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getDecks } from "@/lib/data/decks";
import { VoteButton } from "@/components/decks/vote-button";
import { ManaCurve } from "@/components/decks/mana-curve";
import { Pagination } from "@/components/ui/pagination";
import { DecksToolbar } from "@/components/decks/decks-toolbar";
import { MessageSquare } from "lucide-react";
import type { DeckFilters, SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "decks" });
  return { title: `${t("title")} | RiftForge` };
}

export default async function DecksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "decks" });
  const typedLocale = locale as SupportedLocale;

  const filters: DeckFilters = {
    search: typeof sp.q === "string" ? sp.q : undefined,
    format: typeof sp.format === "string" ? sp.format : undefined,
    period:
      typeof sp.period === "string"
        ? (sp.period as DeckFilters["period"])
        : "week",
    sortBy:
      typeof sp.sort === "string"
        ? (sp.sort as DeckFilters["sortBy"])
        : "score",
    page: typeof sp.page === "string" ? Number(sp.page) : 1,
    perPage: 20,
  };

  const result = await getDecks(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">
          {t("title")}
        </h1>
        <Link
          href="/deck-builder"
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white"
        >
          {t("create")}
        </Link>
      </div>

      <div className="mt-5">
        <DecksToolbar currentPeriod={filters.period ?? "week"} />
      </div>

      {result.data.length === 0 ? (
        <p className="mt-16 text-center text-sm text-zinc-500">
          {t("noResults")}
        </p>
      ) : (
        <div className="mt-6 space-y-2.5">
          {result.data.map((deck) => (
            <div
              key={deck.id}
              className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700 sm:gap-4 sm:p-4"
            >
              <div className="flex shrink-0 flex-col items-center justify-center">
                <VoteButton deckId={deck.id} initialScore={deck.score} />
              </div>

              <div className="hidden w-24 shrink-0 self-center sm:block">
                <ManaCurve cards={deck.cards} />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={{
                      pathname: "/decks/[id]",
                      params: { id: deck.id },
                    }}
                    className="text-sm font-bold text-zinc-100 transition-colors hover:text-zinc-50 sm:text-base"
                  >
                    {deck.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {t("by")} {deck.user.username} ·{" "}
                    <span className="capitalize">{deck.format}</span>
                  </p>
                  {deck.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                      {deck.description}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex gap-3 text-[11px] text-zinc-500">
                  <span>
                    {deck.cards.reduce((s, c) => s + c.quantity, 0)}{" "}
                    {t("cards")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={11} />
                    {deck._count.comments}
                  </span>
                  <span>
                    {new Date(deck.createdAt).toLocaleDateString(
                      typedLocale === "fr" ? "fr-FR" : "en-GB"
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
