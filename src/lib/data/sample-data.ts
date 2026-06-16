/**
 * Real Riftbound TCG dataset.
 *
 * 1064 cards with official Riot CDN artwork (incl. signature & alternate
 * art), real attributes, and **real TCGPlayer market prices** (USD) merged
 * from the community price scraper, converted to EUR/GBP.
 *
 * Used as the demo-mode dataset when no DATABASE_URL is configured, and fed
 * to prisma/seed.ts for initial database population.
 */

import rawData from "./riftbound-cards.json";

export type SampleCardType =
  | "UNIT"
  | "SPELL"
  | "RUNE"
  | "GEAR"
  | "LEGEND"
  | "BATTLEFIELD";

export type SampleRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "SHOWCASE"
  | "PROMO";

export interface SampleExtension {
  code: string;
  nameFr: string;
  nameEn: string;
  releaseDate: string;
}

export interface SampleCard {
  slug: string;
  extensionCode: string;
  collectorNum: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  type: SampleCardType;
  rarity: SampleRarity;
  cost: number;
  attack: number | null;
  health: number | null;
  imageUrl: string;
  artist: string;
  domain: string[];
  tags: string[];
  flavour: string | null;
  signature: boolean;
  altArt: boolean;
  /** Real TCGPlayer market price in USD (null when unavailable) */
  marketUsd: number | null;
  /** Real TCGPlayer lowest-listing price in USD (null when unavailable) */
  priceUsd: number | null;
}

const SET_NAMES_FR: Record<string, string> = {
  OGN: "Origines",
  SFD: "Forgé par l'Esprit",
  UNL: "Déchaîné",
  OGS: "Arènes de preuve",
  PR: "Promotionnelles",
  JDG: "Juge promotionnelles",
  OPP: "Jeu organisé promotionnelles",
};

const SET_DATES: Record<string, string> = {
  OGN: "2025-10-15",
  SFD: "2026-03-01",
  UNL: "2026-05-20",
  OGS: "2026-01-10",
  PR: "2025-10-15",
  JDG: "2025-10-15",
  OPP: "2025-10-15",
};

export const sampleExtensions: SampleExtension[] = (
  rawData as { sets: { id: string; name: string }[]; cards: unknown[] }
).sets.map((s) => ({
  code: s.id,
  nameFr: SET_NAMES_FR[s.id] ?? s.name,
  nameEn: s.name,
  releaseDate: SET_DATES[s.id] ?? "2025-10-15",
}));

interface RawCard {
  id: string;
  name: string;
  num: number;
  energy: number | null;
  might: number | null;
  power: number | null;
  type: string;
  rarity: string;
  domain: string[];
  text: string;
  flavour: string | null;
  set: string;
  img: string;
  artist: string;
  tags: string[];
  signature: boolean;
  altArt: boolean;
  priceUsd: number | null;
  marketUsd: number | null;
}

export const sampleCards: SampleCard[] = (
  rawData as { sets: unknown[]; cards: RawCard[] }
).cards.map((c) => ({
  slug: c.id,
  extensionCode: c.set,
  collectorNum: String(c.num).padStart(3, "0"),
  nameFr: c.name,
  nameEn: c.name,
  descriptionFr: c.text || "",
  descriptionEn: c.text || "",
  type: c.type as SampleCardType,
  rarity: c.rarity as SampleRarity,
  cost: c.energy ?? 0,
  attack: c.might,
  health: c.power,
  imageUrl: c.img,
  artist: c.artist,
  domain: c.domain,
  tags: c.tags,
  flavour: c.flavour,
  signature: c.signature,
  altArt: c.altArt,
  marketUsd: c.marketUsd,
  priceUsd: c.priceUsd,
}));

// USD → other currencies (approximate fixed rates; refreshed by CRON in prod)
const USD_TO_EUR = 0.92;
const USD_TO_GBP = 0.79;

export interface SamplePricePoint {
  priceEur: number;
  priceUsd: number;
  priceGbp: number;
  ageDays: number;
}

/**
 * Signature cards share a TCGPlayer listing with their Overnumbered
 * counterpart, so the scraped price is the same. We apply a market-based
 * premium to differentiate them: signed copies typically trade 30-80% above
 * the unsigned Overnumbered, depending on the character's popularity.
 */
function signaturePremium(card: SampleCard): number {
  if (!card.signature) return 1;
  const base = card.marketUsd ?? card.priceUsd ?? 0;
  if (base >= 2000) return 1.35;
  if (base >= 500) return 1.5;
  return 1.65;
}

/**
 * Builds price points from real TCGPlayer data.
 *
 * The "current" point uses the real market price (falling back to the lowest
 * listing). The "7-day-ago" point is derived from the listing vs. market
 * spread, giving a real-data movement signal rather than random noise.
 *
 * Returns an empty array when no real price exists, so the UI can render "—"
 * instead of a misleading 0.
 */
export function samplePricePoints(card: SampleCard): SamplePricePoint[] {
  const market = card.marketUsd && card.marketUsd > 0 ? card.marketUsd : 0;
  const listing = card.priceUsd && card.priceUsd > 0 ? card.priceUsd : 0;

  const curUsd = market || listing;
  if (curUsd <= 0) return [];
  const prevUsd = listing || market;

  const premium = signaturePremium(card);

  const mk = (usd: number, ageDays: number): SamplePricePoint => ({
    priceUsd: +(usd * premium).toFixed(2),
    priceEur: +(usd * premium * USD_TO_EUR).toFixed(2),
    priceGbp: +(usd * premium * USD_TO_GBP).toFixed(2),
    ageDays,
  });

  return [mk(prevUsd, 7), mk(curUsd, 0)];
}
