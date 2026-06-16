"use client";

import { useState, useCallback, useEffect, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDeckBuilderStore } from "@/stores/deck-builder-store";
import { CardPool } from "./card-pool";
import { DeckPanel } from "./deck-panel";
import { CardFrame } from "@/components/cards/card-frame";
import { localizedName } from "@/lib/utils/format";
import { DOMAIN_DOT, DOMAIN_CHIP, isLegalInDomains } from "@/lib/domains";
import { RefreshCw } from "lucide-react";
import type { CardWithPrice, SupportedLocale } from "@/types";
import type { ExtensionSummary } from "@/lib/data/cards";

const DECK_TYPES = new Set(["UNIT", "SPELL", "GEAR"]);

function DomainChips({ domains }: { domains: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {domains.map((d) => (
        <span
          key={d}
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            DOMAIN_CHIP[d] ?? "bg-zinc-700 text-zinc-300"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${DOMAIN_DOT[d] ?? "bg-zinc-500"}`} />
          {d}
        </span>
      ))}
    </div>
  );
}

function LegendPicker({
  legends,
  locale,
  onPick,
}: {
  legends: CardWithPrice[];
  locale: SupportedLocale;
  onPick: (legend: CardWithPrice) => void;
}) {
  const t = useTranslations("deckBuilder");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return legends;
    return legends.filter(
      (l) =>
        l.nameEn.toLowerCase().includes(q) ||
        l.nameFr.toLowerCase().includes(q) ||
        l.domain.some((d) => d.toLowerCase().includes(q))
    );
  }, [legends, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">{t("chooseLegendIntro")}</p>

      <div className="mt-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchLegend")}
          className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((legend) => (
          <button
            key={legend.id}
            onClick={() => onPick(legend)}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-left transition-colors hover:border-amber-500/60 hover:bg-zinc-900"
          >
            <CardFrame card={legend} locale={locale} />
            <div className="mt-2 px-0.5">
              <p className="truncate text-xs font-semibold text-zinc-100">
                {localizedName(legend, locale)}
              </p>
              <div className="mt-1">
                <DomainChips domains={legend.domain} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-zinc-500">
          {t("noLegend")}
        </p>
      )}
    </div>
  );
}

export function DeckBuilderClient({
  locale,
  initialCards,
  extensions,
  legends,
}: {
  locale: SupportedLocale;
  initialCards: CardWithPrice[];
  extensions: ExtensionSummary[];
  legends: CardWithPrice[];
}) {
  const t = useTranslations("deckBuilder");
  const tCards = useTranslations("cards");
  const store = useDeckBuilderStore();
  const legend = store.legend;

  const [pool, setPool] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [extFilter, setExtFilter] = useState("");
  const [activeCard, setActiveCard] = useState<CardWithPrice | null>(null);
  const [isPending, startTransition] = useTransition();

  const domainsKey = legend ? legend.domain.join(",") : "";

  // Belt-and-suspenders: only ever show deck-eligible cards that are legal in
  // the Legend's domains, regardless of fetch timing.
  const visiblePool = useMemo(() => {
    if (!legend) return [];
    return pool.filter(
      (c) => DECK_TYPES.has(c.type) && isLegalInDomains(c.domain, legend.domain)
    );
  }, [pool, legend]);

  // The champion "label" that links a Legend to its Champion Units (e.g.
  // "Teemo"): the tag that matches the Legend's name. A champion can have
  // several Champion Units (Teemo - Strategist, Teemo - Scout), so we list
  // them all and let the player choose.
  const championTag = useMemo(() => {
    if (!legend) return null;
    return (
      legend.tags.find((t) => legend.nameEn.startsWith(t)) ??
      legend.tags[0] ??
      null
    );
  }, [legend]);

  const [championUnits, setChampionUnits] = useState<CardWithPrice[]>([]);
  useEffect(() => {
    if (!championTag || !domainsKey) return;
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      params.set("tag", championTag);
      params.set("type", "UNIT");
      params.set("domains", domainsKey);
      params.set("perPage", "40");
      const res = await fetch(`/api/cards?${params}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const seen = new Set<string>();
      const out: CardWithPrice[] = [];
      for (const c of data.data as CardWithPrice[]) {
        const base = c.nameEn.replace(/\s*\([^)]*\)\s*$/g, "").trim();
        if (seen.has(base)) continue;
        seen.add(base);
        out.push(c);
      }
      setChampionUnits(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [championTag, domainsKey]);

  // Guard against stale results from a previously selected Legend.
  const champUnits = championTag
    ? championUnits.filter((u) => u.tags.includes(championTag))
    : [];

  const fetchCards = useCallback(
    (q: string, type: string, ext: string, domains: string) => {
      if (!domains) return;
      startTransition(async () => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (type) params.set("type", type);
        if (ext) params.set("ext", ext);
        params.set("domains", domains);
        params.set("perPage", "120");
        const res = await fetch(`/api/cards?${params}`);
        if (res.ok) {
          const data = await res.json();
          // Only Units / Spells / Gear belong in the main deck.
          setPool(
            (data.data as CardWithPrice[]).filter((c) => DECK_TYPES.has(c.type))
          );
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!domainsKey) return;
    const timeout = setTimeout(() => {
      fetchCards(search, typeFilter, extFilter, domainsKey);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, typeFilter, extFilter, domainsKey, fetchCards]);

  function handleDragStart(event: DragStartEvent) {
    setActiveCard(pool.find((c) => c.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    if (!event.over || event.over.id !== "deck-drop-zone") return;
    const card = pool.find((c) => c.id === event.active.id);
    if (card) store.addCard(card);
  }

  // Step 1 — choose a Legend before anything else.
  if (!legend) {
    return (
      <LegendPicker legends={legends} locale={locale} onPick={store.setLegend} />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Chosen Legend header */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="h-14 w-10 shrink-0 overflow-hidden rounded">
          <CardFrame card={legend} locale={locale} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            {t("legend")}
          </p>
          <p className="truncate text-sm font-bold text-zinc-100">
            {localizedName(legend, locale)}
          </p>
          <div className="mt-1">
            <DomainChips domains={legend.domain} />
          </div>
        </div>
        <button
          onClick={() => store.clearLegend()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          <RefreshCw size={13} />
          {t("changeLegend")}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">{t("legalNote")}</p>

      {/* Champion units matched to the Legend by champion tag */}
      {champUnits.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <h3 className="text-sm font-semibold text-amber-300">
            {t("championUnits")}
          </h3>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            {t("championUnitsHint")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {champUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => store.addCard(unit)}
                className="group rounded-lg border border-zinc-800 bg-zinc-900/60 p-1.5 text-left transition-colors hover:border-amber-500/60"
              >
                <CardFrame card={unit} locale={locale} />
                <p className="mt-1 truncate text-[11px] font-medium text-zinc-200">
                  {localizedName(unit, locale)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
          <CardPool
            cards={visiblePool}
            locale={locale}
            extensions={extensions}
            search={search}
            typeFilter={typeFilter}
            extFilter={extFilter}
            onSearchChange={setSearch}
            onTypeChange={setTypeFilter}
            onExtChange={setExtFilter}
            onClickAdd={(card) => store.addCard(card)}
            isPending={isPending}
            tCards={tCards}
          />
          <div className="lg:sticky lg:top-20 lg:self-start">
            <DeckPanel locale={locale} />
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div className="w-32 opacity-80">
              <CardFrame card={activeCard} locale={locale} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
