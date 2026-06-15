/**
 * Real Riftbound TCG card dataset from the community RiftCardex catalogue.
 *
 * 883 cards with official Riot CDN artwork, attributes, and set info.
 * Used as the demo-mode dataset when no DATABASE_URL is configured,
 * and also fed to prisma/seed.ts for initial database population.
 */

import rawData from "./riftbound-cards.json";

export type SampleCardType =
  | "UNIT"
  | "SPELL"
  | "RUNE"
  | "GEAR"
  | "LEGEND"
  | "BATTLEFIELD";

export type SampleRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC";

export type SampleDomain =
  | "Fury"
  | "Calm"
  | "Mind"
  | "Body"
  | "Chaos"
  | "Order"
  | "Colorless";

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
}));

const RARITY_BASE_PRICES: Record<string, number> = {
  COMMON: 0.1,
  UNCOMMON: 0.35,
  RARE: 1.8,
  EPIC: 8.5,
};

export interface SamplePricePoint {
  priceEur: number;
  priceUsd: number;
  priceGbp: number;
  ageDays: number;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function samplePricePoints(card: SampleCard): SamplePricePoint[] {
  const base = RARITY_BASE_PRICES[card.rarity] ?? 0.5;
  const variation = ((hash(card.slug) % 50) - 25) / 100;
  const current = +(base * (1 + variation)).toFixed(2);
  const prev = +(current * (1 + ((hash(card.slug + "7d") % 30) - 15) / 100)).toFixed(2);

  return [
    { priceEur: prev, priceUsd: +(prev * 1.08).toFixed(2), priceGbp: +(prev * 0.85).toFixed(2), ageDays: 7 },
    { priceEur: current, priceUsd: +(current * 1.08).toFixed(2), priceGbp: +(current * 0.85).toFixed(2), ageDays: 0 },
  ];
}
