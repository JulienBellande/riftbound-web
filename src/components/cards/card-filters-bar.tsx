"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, X, SlidersHorizontal } from "lucide-react";
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

const DOMAIN_DOT: Record<string, string> = {
  Fury: "bg-red-500",
  Calm: "bg-cyan-400",
  Mind: "bg-purple-500",
  Body: "bg-amber-500",
  Chaos: "bg-rose-500",
  Order: "bg-sky-400",
  Colorless: "bg-zinc-500",
};

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
  const [showFilters, setShowFilters] = useState(true);
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
    searchParams.get("ext") && {
      key: "ext",
      label:
        extensions.find((e) => e.code === searchParams.get("ext"))?.[
          locale === "fr" ? "nameFr" : "nameEn"
        ] ?? searchParams.get("ext"),
    },
    searchParams.get("domain") && {
      key: "domain",
      label: searchParams.get("domain"),
      dot: DOMAIN_DOT[searchParams.get("domain")!],
    },
    searchParams.get("type") && {
      key: "type",
      label: t(`types.${searchParams.get("type")}`),
    },
    searchParams.get("rarity") && {
      key: "rarity",
      label: t(`rarities.${searchParams.get("rarity")}`),
    },
    searchParams.get("cost") && {
      key: "cost",
      label: `${t("filters.cost")} ${searchParams.get("cost")}`,
    },
  ].filter(Boolean) as { key: string; label: string; dot?: string }[];

  const selectClass =
    "h-9 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 text-sm text-zinc-300 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600";

  return (
    <div className="space-y-2.5">
      {/* Search + toggle */}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-9 pr-8 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all ${
            showFilters
              ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
              : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          }`}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter selects */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <select
            value={searchParams.get("ext") ?? ""}
            onChange={(e) => updateParams({ ext: e.target.value || null })}
            className={selectClass}
          >
            <option value="">{t("filters.allExtensions")}</option>
            {extensions.map((ext) => (
              <option key={ext.code} value={ext.code}>
                {locale === "fr" ? ext.nameFr : ext.nameEn}
              </option>
            ))}
          </select>

          <select
            value={searchParams.get("domain") ?? ""}
            onChange={(e) => updateParams({ domain: e.target.value || null })}
            className={selectClass}
          >
            <option value="">{t("filters.allDomains")}</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
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
      )}

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => updateParams({ [f.key]: null })}
              className="group/chip inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
            >
              {f.dot && <span className={`h-2 w-2 rounded-full ${f.dot}`} />}
              {f.label}
              <X
                size={11}
                className="text-indigo-400 group-hover/chip:text-red-400"
              />
            </button>
          ))}
          <button
            onClick={() => {
              updateParams({
                ext: null,
                domain: null,
                type: null,
                rarity: null,
                cost: null,
              });
            }}
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {t("filters.clearAll")}
          </button>
        </div>
      )}
    </div>
  );
}
