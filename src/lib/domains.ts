/**
 * Riftbound domains (card "colours"). A Legend has exactly two domains, and a
 * deck may only contain cards whose domains all fall within the Legend's two
 * (Colorless cards are always allowed). The rune deck is built from the same
 * two domains. This module is the single source of truth for that wiring.
 */

export const DOMAINS = ["Fury", "Body", "Mind", "Calm", "Order", "Chaos"] as const;
export type Domain = (typeof DOMAINS)[number];

/** Dot/swatch background colour per domain (Tailwind classes). */
export const DOMAIN_DOT: Record<string, string> = {
  Fury: "bg-red-500",
  Body: "bg-orange-500",
  Mind: "bg-sky-500",
  Calm: "bg-emerald-500",
  Order: "bg-amber-400",
  Chaos: "bg-fuchsia-500",
  Colorless: "bg-zinc-500",
};

/** Soft chip styling (text + background) per domain. */
export const DOMAIN_CHIP: Record<string, string> = {
  Fury: "bg-red-500/15 text-red-300",
  Body: "bg-orange-500/15 text-orange-300",
  Mind: "bg-sky-500/15 text-sky-300",
  Calm: "bg-emerald-500/15 text-emerald-300",
  Order: "bg-amber-400/15 text-amber-200",
  Chaos: "bg-fuchsia-500/15 text-fuchsia-300",
  Colorless: "bg-zinc-500/15 text-zinc-300",
};

/**
 * A card is legal in a deck when every one of its domains is one of the
 * Legend's domains. Colorless / domain-less cards are always legal.
 */
export function isLegalInDomains(
  cardDomains: string[],
  legendDomains: string[]
): boolean {
  return cardDomains.every(
    (d) => d === "Colorless" || legendDomains.includes(d)
  );
}
