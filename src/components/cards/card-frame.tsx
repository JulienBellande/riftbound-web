import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { formatPrice, localizedName } from "@/lib/utils/format";
import { DOMAIN_DOT } from "@/lib/domains";
import type { CardWithPrice, SupportedLocale } from "@/types";

const RARITY_BORDER: Record<string, string> = {
  COMMON: "border-zinc-800",
  UNCOMMON: "border-emerald-800/60",
  RARE: "border-sky-800/60",
  EPIC: "border-violet-800/60",
  SHOWCASE: "border-amber-700/60",
  PROMO: "border-fuchsia-800/60",
};

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-amber-400",
  PROMO: "bg-fuchsia-500",
};

const TYPE_LABEL: Record<string, { fr: string; en: string }> = {
  UNIT: { fr: "Unité", en: "Unit" },
  SPELL: { fr: "Sort", en: "Spell" },
  GEAR: { fr: "Équipement", en: "Gear" },
  RUNE: { fr: "Rune", en: "Rune" },
  LEGEND: { fr: "Légende", en: "Legend" },
  BATTLEFIELD: { fr: "Champ de bataille", en: "Battlefield" },
};

export function CardFrame({
  card,
  locale,
  showPrice = false,
}: {
  card: CardWithPrice;
  locale: SupportedLocale;
  showPrice?: boolean;
}) {
  const name = localizedName(card, locale);
  const typeLabel = TYPE_LABEL[card.type]?.[locale] ?? card.type;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-zinc-900 transition-all duration-200",
        "group-hover:-translate-y-0.5 group-hover:border-zinc-600",
        RARITY_BORDER[card.rarity] ?? "border-zinc-800"
      )}
    >
      <div className="relative aspect-[744/1039] w-full overflow-hidden">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={name}
            fill
            quality={85}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-800 text-2xl text-zinc-700">
            ?
          </div>
        )}

        {/* Energy cost */}
        {card.cost > 0 && (
          <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
            {card.cost}
          </div>
        )}

        {/* Rarity dot */}
        <div
          className={cn(
            "absolute right-1.5 top-1.5 h-2 w-2 rounded-full",
            RARITY_DOT[card.rarity] ?? "bg-zinc-500"
          )}
        />

        {/* Might stat */}
        {card.attack !== null && (
          <div className="absolute bottom-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded bg-black/70 px-1 text-[10px] font-bold text-orange-300 backdrop-blur-sm">
            {card.attack}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-1.5">
        <p className="truncate text-[11px] font-medium text-zinc-100">
          {name}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          {card.domain?.slice(0, 3).map((d) => (
            <span
              key={d}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                DOMAIN_DOT[d] ?? "bg-zinc-500"
              )}
            />
          ))}
          <span className="truncate text-[9px] font-medium uppercase tracking-wider text-zinc-500">
            {typeLabel}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <span className="truncate text-[9px] uppercase tracking-wider text-zinc-600">
            {card.extension.code} #{card.collectorNum}
          </span>
          {showPrice && card.latestPrice && (
            <span className="shrink-0 text-[10px] font-semibold text-emerald-400">
              {formatPrice(card.latestPrice.priceEur, "EUR", locale)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
