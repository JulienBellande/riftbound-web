"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { CardFrame } from "@/components/cards/card-frame";
import type { CardWithPrice, SupportedLocale } from "@/types";

const PER_PAGE = 30;

export function CardsGrid({
  initialCards,
  total,
  locale,
}: {
  initialCards: CardWithPrice[];
  total: number;
  locale: SupportedLocale;
}) {
  const searchParams = useSearchParams();
  const [cards, setCards] = useState(initialCards);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialCards.length >= total);
  const sentinel = useRef<HTMLDivElement>(null);

  // Reset the list when the active filters/search change. Uses the React
  // "adjust state during render on prop change" pattern instead of an effect.
  const spKey = searchParams.toString();
  const [prevKey, setPrevKey] = useState(spKey);
  if (spKey !== prevKey) {
    setPrevKey(spKey);
    setCards(initialCards);
    setPage(1);
    setDone(initialCards.length >= total);
  }

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page + 1));
      params.set("perPage", String(PER_PAGE));
      const res = await fetch(`/api/cards?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCards((prev) => [...prev, ...data.data]);
        setPage((p) => p + 1);
        if (cards.length + data.data.length >= data.total) setDone(true);
        if (data.data.length === 0) setDone(true);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, done, searchParams, page, cards.length]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cards.map((card, i) => (
          <Link
            key={card.id}
            href={{ pathname: "/cards/[id]", params: { id: card.id } }}
            className="group animate-fade-in"
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
          >
            <CardFrame card={card} locale={locale} showPrice />
          </Link>
        ))}
      </div>

      <div ref={sentinel} className="h-10" />
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="animate-spin text-zinc-500" size={20} />
          <span className="text-sm text-zinc-500">Loading...</span>
        </div>
      )}
      {done && cards.length > 0 && (
        <p className="py-6 text-center text-xs text-zinc-600">
          {cards.length} / {total}
        </p>
      )}
    </>
  );
}
