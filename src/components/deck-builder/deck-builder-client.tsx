"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDeckBuilderStore } from "@/stores/deck-builder-store";
import { CardPool } from "./card-pool";
import { DeckPanel } from "./deck-panel";
import { CardFrame } from "@/components/cards/card-frame";
import type { CardWithPrice, SupportedLocale } from "@/types";
import type { ExtensionSummary } from "@/lib/data/cards";

export function DeckBuilderClient({
  locale,
  initialCards,
  extensions,
}: {
  locale: SupportedLocale;
  initialCards: CardWithPrice[];
  extensions: ExtensionSummary[];
}) {
  const t = useTranslations("deckBuilder");
  const tCards = useTranslations("cards");
  const store = useDeckBuilderStore();

  const [pool, setPool] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [extFilter, setExtFilter] = useState("");
  const [activeCard, setActiveCard] = useState<CardWithPrice | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchCards = useCallback(
    (q: string, type: string, ext: string) => {
      startTransition(async () => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (type) params.set("type", type);
        if (ext) params.set("ext", ext);
        params.set("perPage", "100");
        const res = await fetch(`/api/cards?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPool(data.data);
        }
      });
    },
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCards(search, typeFilter, extFilter);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, typeFilter, extFilter, fetchCards]);

  function handleDragStart(event: DragStartEvent) {
    const card = pool.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    if (!event.over || event.over.id !== "deck-drop-zone") return;
    const card = pool.find((c) => c.id === event.active.id);
    if (card) store.addCard(card);
  }

  function handleClickAdd(card: CardWithPrice) {
    store.addCard(card);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-xs text-zinc-500">{t("subtitle")}</p>

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <CardPool
            cards={pool}
            locale={locale}
            extensions={extensions}
            search={search}
            typeFilter={typeFilter}
            extFilter={extFilter}
            onSearchChange={setSearch}
            onTypeChange={setTypeFilter}
            onExtChange={setExtFilter}
            onClickAdd={handleClickAdd}
            isPending={isPending}
            tCards={tCards}
          />
          <div className="lg:sticky lg:top-20 lg:self-start">
            <DeckPanel locale={locale} />
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div className="w-32 opacity-80">
              <CardFrame card={activeCard} locale={locale} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
