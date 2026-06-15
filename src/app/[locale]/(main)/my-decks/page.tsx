import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { getDecksByUser } from "@/lib/data/decks";
import { VoteButton } from "@/components/decks/vote-button";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: `${t("myDecks")} | RiftForge` };
}

export default async function MyDecksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "account" });
  const tDecks = await getTranslations({ locale, namespace: "decks" });

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const decks = await getDecksByUser(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">{tNav("myDecks")}</h1>
        <Link
          href="/deck-builder"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
        >
          {tDecks("create")}
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">{t("noDecks")}</p>
          <Link
            href="/deck-builder"
            className="mt-4 inline-block rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
          >
            {t("createFirstDeck")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={{ pathname: "/decks/[id]", params: { id: deck.id } }}
              className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-100">{deck.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{deck.format}</p>
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
      )}
    </div>
  );
}
