export type SupportedLocale = "fr" | "en";

export type Currency = "EUR" | "USD" | "GBP";

export interface CardFilters {
  search?: string;
  extensionId?: string;
  type?: string;
  rarity?: string;
  domain?: string;
  costMin?: number;
  costMax?: number;
  sortBy?: "name" | "cost" | "rarity" | "price" | "date";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface DeckFilters {
  search?: string;
  format?: string;
  period?: "week" | "month" | "all";
  sortBy?: "score" | "date" | "name";
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CardWithPrice {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  type: string;
  rarity: string;
  cost: number;
  attack: number | null;
  health: number | null;
  imageUrl: string | null;
  domain: string[];
  artist: string;
  tags: string[];
  extension: {
    code: string;
    nameFr: string;
    nameEn: string;
  };
  latestPrice: {
    priceEur: number;
    priceUsd: number;
    priceGbp: number;
    fetchedAt: string;
  } | null;
}

export interface DeckWithDetails {
  id: string;
  name: string;
  description: string | null;
  format: string;
  score: number;
  createdAt: string;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  cards: {
    quantity: number;
    card: CardWithPrice;
  }[];
  _count: {
    comments: number;
  };
}

export interface DeckBuilderCard {
  cardId: string;
  card: CardWithPrice;
  quantity: number;
}
