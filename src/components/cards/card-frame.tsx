import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { CardWithPrice, SupportedLocale } from "@/types";
import { localizedName } from "@/lib/utils/format";

const RARITY_RING: Record<string, string> = {
  COMMON: "ring-zinc-700/50",
  UNCOMMON: "ring-emerald-500/40",
  RARE: "ring-sky-500/40",
  EPIC: "ring-violet-500/50",
  SHOWCASE: "ring-amber-400/60",
  PROMO: "ring-fuchsia-500/50",
};

const RARITY_GLOW: Record<string, string> = {
  COMMON: "",
  UNCOMMON: "group-hover:shadow-emerald-500/20",
  RARE: "group-hover:shadow-sky-500/25",
  EPIC: "group-hover:shadow-violet-500/30",
  SHOWCASE: "group-hover:shadow-amber-400/40",
  PROMO: "group-hover:shadow-fuchsia-500/30",
};

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-gradient-to-br from-amber-300 to-orange-500",
  PROMO: "bg-gradient-to-br from-fuchsia-400 to-pink-600",
};

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "bg-red-500",
  Calm: "bg-cyan-400",
  Mind: "bg-purple-500",
  Body: "bg-amber-500",
  Chaos: "bg-rose-600",
  Order: "bg-sky-400",
  Colorless: "bg-zinc-500",
};

export function CardFrame({
  card,
  locale,
}: {
  card: CardWithPrice;
  locale: SupportedLocale;
  typeLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-zinc-900/60 ring-1 shadow-md transition-all duration-300",
        "group-hover:-translate-y-1 group-hover:shadow-2xl",
        RARITY_RING[card.rarity] ?? RARITY_RING.COMMON,
        RARITY_GLOW[card.rarity] ?? ""
      )}
    >
      {/* Card image */}
      <div className="relative aspect-[744/1039] w-full overflow-hidden bg-zinc-800/60">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={localizedName(card, locale)}
            fill
            quality={90}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 230px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-700">
            ✦
          </div>
        )}

        {/* top gradient for badge legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Energy cost */}
        {card.cost > 0 && (
          <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950/85 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40 backdrop-blur-sm">
            {card.cost}
          </div>
        )}

        {/* Rarity dot */}
        <div
          className={cn(
            "absolute right-2 top-2 h-3 w-3 rounded-full ring-2 ring-zinc-950/60",
            RARITY_DOT[card.rarity] ?? RARITY_DOT.COMMON
          )}
        />

        {/* Might stat */}
        {card.attack !== null && (
          <div className="absolute bottom-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-lg bg-zinc-950/85 px-1.5 text-[11px] font-bold text-orange-300 ring-1 ring-orange-400/40 backdrop-blur-sm">
            {card.attack}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 py-2">
        <p className="truncate text-xs font-semibold leading-tight text-zinc-100">
          {localizedName(card, locale)}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {card.domain?.slice(0, 3).map((d) => (
            <span
              key={d}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                DOMAIN_COLORS[d] ?? "bg-zinc-500"
              )}
            />
          ))}
          <span className="truncate text-[10px] uppercase tracking-wider text-zinc-500">
            {card.extension.code}
          </span>
        </div>
      </div>
    </div>
  );
}
