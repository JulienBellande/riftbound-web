import { create } from "zustand";
import { isLegalInDomains } from "@/lib/domains";
import type { DeckBuilderCard, CardWithPrice } from "@/types";

interface DeckBuilderStore {
  /** Chosen Legend — defines the deck's two domains and its runes. */
  legend: CardWithPrice | null;
  name: string;
  format: string;
  cards: DeckBuilderCard[];
  /** Rune deck as a domain → count map (totals RUNE_DECK_SIZE). */
  runes: Record<string, number>;

  setLegend: (legend: CardWithPrice) => void;
  clearLegend: () => void;
  setName: (name: string) => void;
  setFormat: (format: string) => void;
  addCard: (card: CardWithPrice) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  setRuneCount: (domain: string, count: number) => void;
  clearDeck: () => void;
  totalCards: () => number;
  totalRunes: () => number;
}

// Riftbound constructed rules: at most 3 copies of a card, a main deck of
// exactly 40 cards (Units/Spells/Gear in the Legend's domains), and a rune
// deck of 12 runes drawn from those same domains.
const MAX_COPIES = 3;
const MAX_DECK_SIZE = 40;
export const RUNE_DECK_SIZE = 12;

/** Even split of the rune deck across the Legend's two domains. */
function defaultRunes(domains: string[]): Record<string, number> {
  const real = domains.filter((d) => d !== "Colorless");
  if (real.length === 0) return {};
  const base = Math.floor(RUNE_DECK_SIZE / real.length);
  const runes: Record<string, number> = {};
  real.forEach((d, i) => {
    runes[d] = base + (i < RUNE_DECK_SIZE - base * real.length ? 1 : 0);
  });
  return runes;
}

export const useDeckBuilderStore = create<DeckBuilderStore>()((set, get) => ({
  legend: null,
  name: "",
  format: "standard",
  cards: [],
  runes: {},

  setLegend: (legend) =>
    set((state) => ({
      legend,
      // Drop any card that is no longer legal in the new Legend's domains.
      cards: state.cards.filter((c) =>
        isLegalInDomains(c.card.domain, legend.domain)
      ),
      runes: defaultRunes(legend.domain),
    })),

  clearLegend: () => set({ legend: null, cards: [], runes: {} }),

  setName: (name) => set({ name }),
  setFormat: (format) => set({ format }),

  addCard: (card) =>
    set((state) => {
      if (!state.legend) return state;
      if (!isLegalInDomains(card.domain, state.legend.domain)) return state;
      if (get().totalCards() >= MAX_DECK_SIZE) return state;

      const existing = state.cards.find((c) => c.cardId === card.id);
      if (existing) {
        if (existing.quantity >= MAX_COPIES) return state;
        return {
          cards: state.cards.map((c) =>
            c.cardId === card.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return {
        cards: [...state.cards, { cardId: card.id, card, quantity: 1 }],
      };
    }),

  removeCard: (cardId) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.cardId !== cardId),
    })),

  updateQuantity: (cardId, quantity) =>
    set((state) => ({
      cards:
        quantity <= 0
          ? state.cards.filter((c) => c.cardId !== cardId)
          : state.cards.map((c) =>
              c.cardId === cardId
                ? { ...c, quantity: Math.min(quantity, MAX_COPIES) }
                : c
            ),
    })),

  setRuneCount: (domain, count) =>
    set((state) => ({
      runes: {
        ...state.runes,
        [domain]: Math.max(0, Math.min(count, RUNE_DECK_SIZE)),
      },
    })),

  clearDeck: () =>
    set({ legend: null, name: "", format: "standard", cards: [], runes: {} }),

  totalCards: () => get().cards.reduce((sum, c) => sum + c.quantity, 0),
  totalRunes: () =>
    Object.values(get().runes).reduce((sum, n) => sum + n, 0),
}));
