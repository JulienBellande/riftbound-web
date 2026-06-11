import { cn } from "@/lib/utils/cn";
import type { CardWithPrice, SupportedLocale } from "@/types";
import { localizedName } from "@/lib/utils/format";

const RARITY_STYLES: Record<string, { frame: string; glow: string; badge: string }> = {
  COMMON: {
    frame: "from-zinc-700/60 to-zinc-800/80 border-zinc-600/50",
    glow: "",
    badge: "bg-zinc-600",
  },
  UNCOMMON: {
    frame: "from-emerald-900/50 to-zinc-900 border-emerald-700/50",
    glow: "",
    badge: "bg-emerald-600",
  },
  RARE: {
    frame: "from-sky-900/50 to-zinc-900 border-sky-700/50",
    glow: "group-hover:shadow-sky-500/20",
    badge: "bg-sky-600",
  },
  EPIC: {
    frame: "from-violet-900/50 to-zinc-900 border-violet-700/50",
    glow: "group-hover:shadow-violet-500/20",
    badge: "bg-violet-600",
  },
  LEGENDARY: {
    frame: "from-amber-900/60 to-zinc-900 border-amber-600/60",
    glow: "group-hover:shadow-amber-500/30",
    badge: "bg-amber-600",
  },
};

const TYPE_ICONS: Record<string, string> = {
  UNIT: "⚔",
  CHAMPION: "★",
  SPELL: "✦",
  GEAR: "⛨",
  RUNE: "◈",
  BATTLEFIELD: "⛰",
};

export function CardFrame({
  card,
  locale,
  typeLabel,
}: {
  card: CardWithPrice;
  locale: SupportedLocale;
  typeLabel: string;
}) {
  const rarity = RARITY_STYLES[card.rarity] ?? RARITY_STYLES.COMMON;
  const isUnit = card.attack !== null && card.health !== null;

  return (
    <div
      className={cn(
        "relative flex aspect-[2.5/3.5] flex-col rounded-xl border bg-gradient-to-b p-3 shadow-lg transition-shadow",
        rarity.frame,
        rarity.glow
      )}
    >
      {/* Cost badge */}
      <div className="absolute -left-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-amber-400 ring-2 ring-amber-600/60">
        {card.cost}
      </div>

      {/* Rarity dot */}
      <div
        className={cn(
          "absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ring-2 ring-zinc-950",
          rarity.badge
        )}
      />

      {/* Art zone */}
      <div className="mt-5 flex flex-1 items-center justify-center rounded-lg bg-zinc-950/40 text-4xl opacity-60">
        {TYPE_ICONS[card.type] ?? "✦"}
      </div>

      {/* Name + type */}
      <div className="mt-2">
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-zinc-100">
          {localizedName(card, locale)}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
          {typeLabel} · {card.extension.code}
        </p>
      </div>

      {/* Stats */}
      {isUnit && (
        <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 rounded-full bg-zinc-950 px-2 py-0.5 text-xs font-bold ring-2 ring-zinc-700">
          <span className="text-orange-400">{card.attack}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-emerald-400">{card.health}</span>
        </div>
      )}
    </div>
  );
}
