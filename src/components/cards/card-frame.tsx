import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { CardWithPrice, SupportedLocale } from "@/types";
import { localizedName } from "@/lib/utils/format";

const RARITY_STYLES: Record<
  string,
  { ring: string; glow: string; badge: string; text: string }
> = {
  COMMON: {
    ring: "ring-zinc-600/40",
    glow: "",
    badge: "bg-zinc-600",
    text: "text-zinc-400",
  },
  UNCOMMON: {
    ring: "ring-emerald-500/40",
    glow: "group-hover:shadow-emerald-500/15",
    badge: "bg-emerald-500",
    text: "text-emerald-400",
  },
  RARE: {
    ring: "ring-sky-500/40",
    glow: "group-hover:shadow-sky-500/20",
    badge: "bg-sky-500",
    text: "text-sky-400",
  },
  EPIC: {
    ring: "ring-violet-500/50",
    glow: "group-hover:shadow-violet-500/25",
    badge: "bg-violet-500",
    text: "text-violet-400",
  },
};

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "bg-red-500",
  Calm: "bg-cyan-500",
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
  const rarity = RARITY_STYLES[card.rarity] ?? RARITY_STYLES.COMMON;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-900 ring-1 shadow-lg transition-all duration-200",
        rarity.ring,
        rarity.glow,
        "group-hover:shadow-xl group-hover:scale-[1.02]"
      )}
    >
      {/* Card image */}
      <div className="relative aspect-[744/1039] w-full overflow-hidden bg-zinc-800">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={localizedName(card, locale)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-700">
            ✦
          </div>
        )}

        {/* Energy cost badge */}
        {card.cost > 0 && (
          <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/80 text-xs font-bold text-amber-400 ring-1 ring-amber-500/50 backdrop-blur-sm">
            {card.cost}
          </div>
        )}

        {/* Rarity indicator */}
        <div
          className={cn(
            "absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-1 ring-zinc-950/50",
            rarity.badge
          )}
        />
      </div>

      {/* Card info overlay */}
      <div className="px-2.5 py-2">
        <p className="truncate text-xs font-semibold leading-tight text-zinc-100">
          {localizedName(card, locale)}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {card.domain?.slice(0, 2).map((d) => (
            <span
              key={d}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                DOMAIN_COLORS[d] ?? "bg-zinc-500"
              )}
            />
          ))}
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            {card.type} · {card.extension.code}
          </span>
        </div>
      </div>

      {/* Might stat */}
      {card.attack !== null && (
        <div className="absolute bottom-11 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/80 text-[10px] font-bold text-orange-400 ring-1 ring-orange-500/40 backdrop-blur-sm">
          {card.attack}
        </div>
      )}
    </div>
  );
}
