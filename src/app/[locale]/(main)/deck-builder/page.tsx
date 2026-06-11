import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCards, getExtensions } from "@/lib/data/cards";
import { DeckBuilderClient } from "@/components/deck-builder/deck-builder-client";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deckBuilder" });
  return { title: `${t("title")} | Riftbound` };
}

export default async function DeckBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [initialCards, extensions] = await Promise.all([
    getCards({ perPage: 100 }),
    getExtensions(),
  ]);

  return (
    <DeckBuilderClient
      locale={locale as SupportedLocale}
      initialCards={initialCards.data}
      extensions={extensions}
    />
  );
}
