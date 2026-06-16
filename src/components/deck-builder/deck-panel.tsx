"use client";

import { useState, useTransition } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { Trash2, Minus, Plus } from "lucide-react";
import { useDeckBuilderStore } from "@/stores/deck-builder-store";
import { useRouter } from "@/i18n/routing";
import { ManaCurve } from "@/components/decks/mana-curve";
import { localizedName, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { SupportedLocale } from "@/types";

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-amber-400",
  PROMO: "bg-fuchsia-500",
};

export function DeckPanel({ locale }: { locale: SupportedLocale }) {
  const t = useTranslations("deckBuilder");
  const store = useDeckBuilderStore();
  const totalCards = store.totalCards();
  const router = useRouter();
  const [isSaving, startSave] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const { isOver, setNodeRef } = useDroppable({ id: "deck-drop-zone" });

  function save(isPublic: boolean) {
    setNotice(null);
    startSave(async () => {
      try {
        const res = await fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: store.name,
            format: store.format,
            isPublic,
            cards: store.cards.map((c) => ({
              cardId: c.cardId,
              quantity: c.quantity,
            })),
          }),
        });
        if (res.status === 401) {
          setNotice(t("loginRequired"));
          return;
        }
        if (!res.ok) {
          setNotice(t("saveError"));
          return;
        }
        const { id } = await res.json();
        store.clearDeck();
        router.push({ pathname: "/decks/[id]", params: { id } });
      } catch {
        setNotice(t("saveError"));
      }
    });
  }

  const sorted = [...store.cards].sort((a, b) => a.card.cost - b.card.cost);
  const totalPrice = sorted.reduce(
    (s, c) => s + (c.card.latestPrice?.priceEur ?? 0) * c.quantity,
    0
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="space-y-3">
        <input
          type="text"
          value={store.name}
          onChange={(e) => store.setName(e.target.value)}
          placeholder={t("deckName")}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />
        <select
          value={store.format}
          onChange={(e) => store.setFormat(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none"
        >
          <option value="standard">Standard</option>
          <option value="extended">Extended</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Mana Curve */}
      {sorted.length > 0 && (
        <div className="mt-4 rounded-lg bg-zinc-800/30 p-3">
          <ManaCurve
            cards={sorted.map((c) => ({ quantity: c.quantity, card: c.card }))}
          />
        </div>
      )}

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">
            {t("deckList")}
          </h3>
          <span className="text-xs text-zinc-500">
            {t("totalCards", { count: totalCards })}
          </span>
        </div>

        {/* Drop zone + card list */}
        <div
          ref={setNodeRef}
          className={cn(
            "mt-3 min-h-[200px] rounded-lg border-2 border-dashed transition-colors",
            sorted.length === 0 && !isOver ? "border-zinc-700" : "border-transparent",
            isOver && "border-amber-500 bg-amber-600/5"
          )}
        >
          {sorted.length === 0 ? (
            <p className="flex h-[200px] items-center justify-center text-sm text-zinc-500">
              {t("dragHint")}
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800/50">
              {sorted.map((entry) => (
                <li
                  key={entry.cardId}
                  className="flex items-center gap-2 px-1 py-1.5 text-sm"
                >
                  <span className="w-5 text-center text-xs font-bold text-amber-400">
                    {entry.card.cost}
                  </span>
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      RARITY_DOT[entry.card.rarity] ?? "bg-zinc-500"
                    )}
                  />
                  <span className="flex-1 truncate text-zinc-200">
                    {localizedName(entry.card, locale)}
                  </span>

                  {/* Quantity controls */}
                  <button
                    onClick={() =>
                      store.updateQuantity(entry.cardId, entry.quantity - 1)
                    }
                    className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-4 text-center text-xs font-medium text-zinc-400">
                    {entry.quantity}
                  </span>
                  <button
                    onClick={() =>
                      store.updateQuantity(entry.cardId, entry.quantity + 1)
                    }
                    className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <Plus size={12} />
                  </button>

                  <button
                    onClick={() => store.removeCard(entry.cardId)}
                    className="rounded p-0.5 text-zinc-600 hover:bg-red-900/20 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Price total */}
        {totalPrice > 0 && (
          <div className="mt-2 text-right text-xs text-zinc-500">
            ≈ {formatPrice(totalPrice, "EUR", locale)}
          </div>
        )}
      </div>

      {/* Actions */}
      {notice && (
        <p className="mt-4 rounded-lg border border-amber-900 bg-amber-950/50 px-3 py-2 text-xs text-amber-400">
          {notice}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => save(false)}
          disabled={totalCards === 0 || !store.name || isSaving}
          className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 disabled:opacity-50"
        >
          {t("save")}
        </button>
        <button
          onClick={() => save(true)}
          disabled={totalCards === 0 || !store.name || isSaving}
          className="flex-1 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
        >
          {t("publish")}
        </button>
        <button
          onClick={() => store.clearDeck()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-red-700 hover:text-red-400"
        >
          {t("clear")}
        </button>
      </div>
    </div>
  );
}
