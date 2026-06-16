import { create } from "zustand";
import type { DeckBuilderCard, CardWithPrice } from "@/types";

interface DeckBuilderStore {
  name: string;
  format: string;
  cards: DeckBuilderCard[];
  setName: (name: string) => void;
  setFormat: (format: string) => void;
  addCard: (card: CardWithPrice) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  clearDeck: () => void;
  totalCards: () => number;
  loadDeck: (name: string, format: string, cards: DeckBuilderCard[]) => void;
}

// Riftbound constructed rules: at most 3 copies of a card, and a main deck of
// exactly 40 cards (Units/Spells/Gear in the Legend's domains). The Legend,
// the 12-rune rune deck and the 3 battlefields are tracked outside this tool.
const MAX_COPIES = 3;
const MAX_DECK_SIZE = 40;

export const useDeckBuilderStore = create<DeckBuilderStore>()((set, get) => ({
  name: "",
  format: "standard",
  cards: [],

  setName: (name) => set({ name }),
  setFormat: (format) => set({ format }),

  addCard: (card) =>
    set((state) => {
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

  clearDeck: () => set({ name: "", format: "standard", cards: [] }),

  totalCards: () => get().cards.reduce((sum, c) => sum + c.quantity, 0),

  loadDeck: (name, format, cards) => set({ name, format, cards }),
}));
