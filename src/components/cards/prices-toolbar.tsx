"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { Currency } from "@/types";

const CURRENCIES: Currency[] = ["EUR", "USD", "GBP"];

export function PricesToolbar({ currency }: { currency: Currency }) {
  const t = useTranslations("cards");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const isFirstRender = useRef(true);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    const qs = params.toString();
    // @ts-expect-error dynamic pathname from usePathname
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => updateParams({ q: search || null }), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("search")}
        className="min-w-48 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />

      <div className="flex gap-1 rounded-lg border border-zinc-800 p-1">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => updateParams({ currency: c === "EUR" ? null : c })}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              c === currency
                ? "bg-amber-600/15 text-amber-500"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
