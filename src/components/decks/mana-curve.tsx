import { cn } from "@/lib/utils/cn";
import type { CardWithPrice } from "@/types";

export function ManaCurve({
  cards,
}: {
  cards: { quantity: number; card: CardWithPrice }[];
}) {
  const buckets: number[] = Array(8).fill(0);
  for (const entry of cards) {
    const idx = Math.min(entry.card.cost, 7);
    buckets[idx] += entry.quantity;
  }
  const max = Math.max(...buckets, 1);

  return (
    <div className="flex items-end gap-1">
      {buckets.map((count, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={cn(
              "w-full rounded-t-sm transition-all",
              count > 0 ? "bg-amber-600/60" : "bg-zinc-800/30"
            )}
            style={{ height: `${Math.max((count / max) * 48, 2)}px` }}
          />
          <span className="text-[10px] text-zinc-500">
            {i === 7 ? "7+" : i}
          </span>
          {count > 0 && (
            <span className="text-[10px] font-medium text-zinc-400">
              {count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
