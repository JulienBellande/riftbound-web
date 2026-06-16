"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Search, Loader2, X } from "lucide-react";
import { formatPrice, localizedName } from "@/lib/utils/format";
import type { CardWithPrice, SupportedLocale } from "@/types";

export function QuickSearch() {
  const t = useTranslations("cards");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(
          (e.target as HTMLElement)?.tagName ?? ""
        )
      ) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 20);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced search that syncs UI state to an external system (the cards
  // API) — a legitimate effect; the synchronous resets below are intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setSelected(-1);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/cards?q=${encodeURIComponent(query)}&perPage=8`
        );
        if (res.ok) setResults((await res.json()).data);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push({ pathname: "/cards/[id]", params: { id } });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && selected >= 0 && results[selected]) {
      e.preventDefault();
      go(results[selected].id);
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 20);
        }}
        className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-400"
        aria-label="Search cards"
      >
        <Search size={12} />
        <span className="hidden md:inline">{t("search")}</span>
        <kbd className="hidden rounded border border-zinc-700 px-1 text-[9px] text-zinc-600 lg:inline">
          /
        </kbd>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[88vw] max-w-sm rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("search")}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-8 pr-7 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="mt-1 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-zinc-600" />
              </div>
            )}
            {!loading &&
              results.map((card, i) => (
                <button
                  key={card.id}
                  onClick={() => go(card.id)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                    selected === i ? "bg-zinc-800" : "hover:bg-zinc-900"
                  }`}
                >
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt=""
                      width={24}
                      height={34}
                      quality={50}
                      className="shrink-0 rounded"
                    />
                  ) : (
                    <span className="h-[34px] w-6 shrink-0 rounded bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {localizedName(card, locale)}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      {card.extension.code} · {t(`rarities.${card.rarity}`)}
                    </p>
                  </div>
                  {card.latestPrice && (
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-400">
                      {formatPrice(card.latestPrice.priceEur, "EUR", locale)}
                    </span>
                  )}
                </button>
              ))}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="py-4 text-center text-xs text-zinc-600">
                {t("noResults")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
