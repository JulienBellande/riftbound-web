"use client";

import { useDraggable } from "@dnd-kit/core";
import { CardFrame } from "@/components/cards/card-frame";
import { Plus, Loader2 } from "lucide-react";
import type { CardWithPrice, SupportedLocale } from "@/types";
import type { ExtensionSummary } from "@/lib/data/cards";

const CARD_TYPES = ["UNIT", "SPELL", "RUNE", "GEAR", "LEGEND", "BATTLEFIELD"];

function DraggableCard({
  card,
  locale,
  onClickAdd,
}: {
  card: CardWithPrice;
  locale: SupportedLocale;
  onClickAdd: (card: CardWithPrice) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group relative cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      <CardFrame card={card} locale={locale} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClickAdd(card);
        }}
        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Add to deck"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CardPool({
  cards,
  locale,
  extensions,
  search,
  typeFilter,
  extFilter,
  onSearchChange,
  onTypeChange,
  onExtChange,
  onClickAdd,
  isPending,
  tCards,
}: {
  cards: CardWithPrice[];
  locale: SupportedLocale;
  extensions: ExtensionSummary[];
  search: string;
  typeFilter: string;
  extFilter: string;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onExtChange: (v: string) => void;
  onClickAdd: (card: CardWithPrice) => void;
  isPending: boolean;
  tCards: ReturnType<typeof import("next-intl").useTranslations>;
}) {
  const selectClass =
    "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tCards("search")}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {isPending && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-500"
            />
          )}
        </div>
        <select
          value={extFilter}
          onChange={(e) => onExtChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{tCards("filters.allExtensions")}</option>
          {extensions.map((ext) => (
            <option key={ext.code} value={ext.code}>
              {locale === "fr" ? ext.nameFr : ext.nameEn}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{tCards("filters.allTypes")}</option>
          {CARD_TYPES.map((type) => (
            <option key={type} value={type}>
              {tCards(`types.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            locale={locale}
            onClickAdd={onClickAdd}
          />
        ))}
      </div>

      {cards.length === 0 && !isPending && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          {tCards("noResults")}
        </p>
      )}
    </div>
  );
}
