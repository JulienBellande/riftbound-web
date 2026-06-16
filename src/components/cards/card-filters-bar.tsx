"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, X } from "lucide-react";
import type { ExtensionSummary } from "@/lib/data/cards";

const CARD_TYPES = ["UNIT", "SPELL", "RUNE", "GEAR", "LEGEND", "BATTLEFIELD"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "SHOWCASE", "PROMO"];
const DOMAINS = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order", "Colorless"];
const COST_RANGES = [
  { value: "0-2", label: "0 – 2" },
  { value: "3-5", label: "3 – 5" },
  { value: "6+", label: "6+" },
];
const SORT_OPTIONS = ["name", "cost", "rarity", "price", "date"] as const;

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

  const activeFilters = [
    searchParams.get("ext") && { key: "ext", label: extensions.find((e) => e.code === searchParams.get("ext"))?.[locale === "fr" ? "nameFr" : "nameEn"] ?? searchParams.get("ext") },
    searchParams.get("domain") && { key: "domain", label: searchParams.get("domain") },
    searchParams.get("type") && { key: "type", label: t(`types.${searchParams.get("type")}`) },
    searchParams.get("rarity") && { key: "rarity", label: t(`rarities.${searchParams.get("rarity")}`) },
    searchParams.get("cost") && { key: "cost", label: `${t("filters.cost")} ${searchParams.get("cost")}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const sel =
    "h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-400 transition-colors focus:border-zinc-600 focus:outline-none hover:border-zinc-700";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="h-8 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-8 pr-7 text-xs text-zinc-200 placeholder-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none hover:border-zinc-700"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <select value={searchParams.get("ext") ?? ""} onChange={(e) => updateParams({ ext: e.target.value || null })} className={sel}>
          <option value="">{t("filters.allExtensions")}</option>
          {extensions.map((ext) => (
            <option key={ext.code} value={ext.code}>{locale === "fr" ? ext.nameFr : ext.nameEn}</option>
          ))}
        </select>

        <select value={searchParams.get("domain") ?? ""} onChange={(e) => updateParams({ domain: e.target.value || null })} className={sel}>
          <option value="">{t("filters.allDomains")}</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={searchParams.get("type") ?? ""} onChange={(e) => updateParams({ type: e.target.value || null })} className={sel}>
          <option value="">{t("filters.allTypes")}</option>
          {CARD_TYPES.map((type) => (
            <option key={type} value={type}>{t(`types.${type}`)}</option>
          ))}
        </select>

        <select value={searchParams.get("rarity") ?? ""} onChange={(e) => updateParams({ rarity: e.target.value || null })} className={sel}>
          <option value="">{t("filters.allRarities")}</option>
          {RARITIES.map((rarity) => (
            <option key={rarity} value={rarity}>{t(`rarities.${rarity}`)}</option>
          ))}
        </select>

        <select value={searchParams.get("cost") ?? ""} onChange={(e) => updateParams({ cost: e.target.value || null })} className={sel}>
          <option value="">{t("filters.anyCost")}</option>
          {COST_RANGES.map((range) => (
            <option key={range.value} value={range.value}>{t("filters.cost")} {range.label}</option>
          ))}
        </select>

        <select value={searchParams.get("sort") ?? "name"} onChange={(e) => updateParams({ sort: e.target.value })} className={sel}>
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>{t(`sort.${option}`)}</option>
          ))}
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => updateParams({ [f.key]: null })}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 transition-colors hover:border-zinc-600"
            >
              {f.label}
              <X size={10} className="text-zinc-500" />
            </button>
          ))}
          <button
            onClick={() => updateParams({ ext: null, domain: null, type: null, rarity: null, cost: null })}
            className="text-[10px] text-zinc-600 hover:text-zinc-400"
          >
            {t("filters.clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}
