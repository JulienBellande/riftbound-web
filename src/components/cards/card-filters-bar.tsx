"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { ExtensionSummary } from "@/lib/data/cards";

const CARD_TYPES = ["UNIT", "CHAMPION", "SPELL", "GEAR", "RUNE", "BATTLEFIELD"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
const COST_RANGES = [
  { value: "0-2", label: "0 – 2" },
  { value: "3-5", label: "3 – 5" },
  { value: "6+", label: "6+" },
];
const SORT_OPTIONS = ["name", "cost", "rarity", "date"] as const;

export function CardFiltersBar({
  extensions,
}: {
  extensions: ExtensionSummary[];
}) {
  const t = useTranslations("cards");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const isFirstRender = useRef(true);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
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
    },
    [router, pathname, searchParams]
  );

  // Debounced text search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      updateParams({ q: search || null });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectClass =
    "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none";

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("search")}
        className="min-w-48 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />

      <select
        value={searchParams.get("ext") ?? ""}
        onChange={(e) => updateParams({ ext: e.target.value || null })}
        className={selectClass}
      >
        <option value="">{t("filters.allExtensions")}</option>
        {extensions.map((ext) => (
          <option key={ext.code} value={ext.code}>
            {locale === "fr" ? ext.nameFr : ext.nameEn} ({ext.code})
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("type") ?? ""}
        onChange={(e) => updateParams({ type: e.target.value || null })}
        className={selectClass}
      >
        <option value="">{t("filters.allTypes")}</option>
        {CARD_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`types.${type}`)}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("rarity") ?? ""}
        onChange={(e) => updateParams({ rarity: e.target.value || null })}
        className={selectClass}
      >
        <option value="">{t("filters.allRarities")}</option>
        {RARITIES.map((rarity) => (
          <option key={rarity} value={rarity}>
            {t(`rarities.${rarity}`)}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("cost") ?? ""}
        onChange={(e) => updateParams({ cost: e.target.value || null })}
        className={selectClass}
      >
        <option value="">{t("filters.anyCost")}</option>
        {COST_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {t("filters.cost")} {range.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("sort") ?? "name"}
        onChange={(e) => updateParams({ sort: e.target.value })}
        className={selectClass}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`sort.${option}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
