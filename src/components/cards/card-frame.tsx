import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { formatPrice, localizedName } from "@/lib/utils/format";
import type { CardWithPrice, SupportedLocale } from "@/types";

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
  UNCOMMON: "group-hover:shadow-emerald-500/15",
  RARE: "group-hover:shadow-sky-500/20",
  EPIC: "group-hover:shadow-violet-500/25",
  SHOWCASE: "group-hover:shadow-amber-400/30",
  PROMO: "group-hover:shadow-fuchsia-500/25",
};

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-gradient-to-br from-amber-300 to-orange-500",
  PROMO: "bg-gradient-to-br from-fuchsia-400 to-pink-600",
};

const HAS_SHIMMER = new Set(["RARE", "EPIC", "SHOWCASE", "PROMO"]);

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
  showPrice = false,
}: {
  card: CardWithPrice;
  locale: SupportedLocale;
  typeLabel?: string;
  showPrice?: boolean;
}) {
  const name = localizedName(card, locale);
  const shimmer = HAS_SHIMMER.has(card.rarity);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-900/60 ring-1 shadow-md transition-all duration-300",
        "group-hover:-translate-y-1.5 group-hover:shadow-2xl",
        RARITY_RING[card.rarity] ?? RARITY_RING.COMMON,
        RARITY_GLOW[card.rarity] ?? "",
        shimmer && "card-shimmer"
      )}
    >
      {/* Card image */}
      <div className="relative aspect-[744/1039] w-full overflow-hidden bg-zinc-800/60">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={name}
            fill
            quality={90}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 230px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-700">
            ✦
          </div>
        )}

        {/* Top gradient for badge legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Energy cost */}
        {card.cost > 0 && (
          <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950/80 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-sm">
            {card.cost}
          </div>
        )}

        {/* Rarity dot */}
        <div
          className={cn(
            "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950/60",
            RARITY_DOT[card.rarity] ?? RARITY_DOT.COMMON
          )}
        />

        {/* Might stat */}
        {card.attack !== null && (
          <div className="absolute bottom-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-zinc-950/80 px-1 text-[10px] font-bold text-orange-300 ring-1 ring-orange-400/30 backdrop-blur-sm">
            {card.attack}
          </div>
        )}

        {/* Bottom gradient for name overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold leading-tight text-zinc-100">
            {name}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            {card.domain?.slice(0, 3).map((d) => (
              <span
                key={d}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  DOMAIN_COLORS[d] ?? "bg-zinc-500"
                )}
              />
            ))}
            <span className="truncate text-[9px] uppercase tracking-wider text-zinc-500">
              {card.extension.code}
            </span>
          </div>
        </div>
        {showPrice && card.latestPrice && (
          <span className="shrink-0 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
            {formatPrice(card.latestPrice.priceEur, "EUR", locale)}
          </span>
        )}
      </div>
    </div>
  );
}
