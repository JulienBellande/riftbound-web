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
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 py-1 pl-2 pr-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
        aria-label="Search cards"
      >
        <Search size={13} />
        <span className="hidden text-xs md:inline">{t("search")}</span>
        <kbd className="hidden rounded border border-zinc-700 px-1 text-[9px] text-zinc-600 lg:inline">
          /
        </kbd>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[88vw] max-w-md rounded-xl border border-zinc-700/50 bg-zinc-950/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("search")}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 pl-8 pr-8 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="mt-1 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-5">
                <Loader2 size={18} className="animate-spin text-zinc-500" />
              </div>
            )}
            {!loading &&
              results.map((card, i) => (
                <button
                  key={card.id}
                  onClick={() => go(card.id)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                    selected === i ? "bg-indigo-500/10" : "hover:bg-zinc-800/50"
                  }`}
                >
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt=""
                      width={28}
                      height={39}
                      quality={50}
                      className="shrink-0 rounded ring-1 ring-zinc-800"
                    />
                  ) : (
                    <span className="h-[39px] w-7 shrink-0 rounded bg-zinc-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {localizedName(card, locale)}
                    </p>
                    <p className="text-[10px] text-zinc-500">
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
              <p className="py-5 text-center text-xs text-zinc-500">
                {t("noResults")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
