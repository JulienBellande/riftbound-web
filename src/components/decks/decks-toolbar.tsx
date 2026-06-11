"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const PERIODS = ["week", "month", "all"] as const;

export function DecksToolbar({ currentPeriod }: { currentPeriod: string }) {
  const t = useTranslations("decks");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    params.delete("page");
    const qs = params.toString();
    // @ts-expect-error dynamic pathname
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  const labelMap: Record<string, string> = {
    week: t("topWeek"),
    month: t("topMonth"),
    all: t("all"),
  };

  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            p === currentPeriod
              ? "border-amber-600 bg-amber-600/10 text-amber-500"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          )}
        >
          {labelMap[p]}
        </button>
      ))}
    </div>
  );
}
