"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search } from "lucide-react";
import type { ExtensionSummary } from "@/lib/data/cards";

const CARD_TYPES = ["UNIT", "SPELL", "RUNE", "GEAR", "LEGEND", "BATTLEFIELD"];
const RARITIES = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "SHOWCASE",
  "PROMO",
];
const DOMAINS = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order", "Colorless"];
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
    "rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300 transition-colors focus:border-amber-500 focus:outline-none hover:border-zinc-600";

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-48 flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900/80 py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 hover:border-zinc-600"
        />
      </div>

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
  );
}
