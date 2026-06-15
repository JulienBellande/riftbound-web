import { cn } from "@/lib/utils/cn";
import { localizedName, formatPrice } from "@/lib/utils/format";
import type { CardWithPrice, SupportedLocale } from "@/types";

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-amber-400",
  PROMO: "bg-fuchsia-500",
};

export function DeckCardList({
  cards,
  locale,
}: {
  cards: { quantity: number; card: CardWithPrice }[];
  locale: SupportedLocale;
}) {
  const sorted = [...cards].sort((a, b) => a.card.cost - b.card.cost);
  const total = sorted.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div>
      <ul className="divide-y divide-zinc-800/50">
        {sorted.map((entry) => (
          <li
            key={entry.card.id}
            className="flex items-center gap-3 px-2 py-2 text-sm"
          >
            <span className="w-5 text-center font-bold text-amber-400">
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
            <span className="text-zinc-500">x{entry.quantity}</span>
            {entry.card.latestPrice && (
              <span className="w-16 text-right text-xs text-zinc-500">
                {formatPrice(entry.card.latestPrice.priceEur, "EUR", locale)}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-zinc-800 px-2 pt-2 text-xs text-zinc-500">
        {total} cartes
      </div>
    </div>
  );
}
