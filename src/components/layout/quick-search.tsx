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
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // "/" focuses search
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

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // debounced fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/cards?q=${encodeURIComponent(query)}&perPage=8`
        );
        if (res.ok) setResults((await res.json()).data);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timeout);
  }, [query]);

  function go(id: string) {
    setOpen(false);
    setQuery("");
    router.push({ pathname: "/cards/[id]", params: { id } });
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 20);
        }}
        className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 py-1.5 pl-2.5 pr-3 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
        aria-label="Search cards"
      >
        <Search size={15} />
        <span className="hidden md:inline">{t("search")}</span>
        <kbd className="hidden rounded border border-zinc-700 px-1.5 text-[10px] text-zinc-500 lg:inline">
          /
        </kbd>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[88vw] max-w-md rounded-xl border border-zinc-700/60 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 py-2 pl-9 pr-9 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 size={20} className="animate-spin text-zinc-500" />
              </div>
            )}
            {!loading &&
              results.map((card) => (
                <button
                  key={card.id}
                  onClick={() => go(card.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-800/60"
                >
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt=""
                      width={32}
                      height={45}
                      quality={60}
                      className="shrink-0 rounded ring-1 ring-zinc-800"
                    />
                  ) : (
                    <span className="h-[45px] w-8 shrink-0 rounded bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {localizedName(card, locale)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {card.extension.code} · {t(`rarities.${card.rarity}`)}
                    </p>
                  </div>
                  {card.latestPrice && (
                    <span className="shrink-0 text-xs font-bold text-emerald-400">
                      {formatPrice(card.latestPrice.priceEur, "EUR", locale)}
                    </span>
                  )}
                </button>
              ))}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-500">
                {t("noResults")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
