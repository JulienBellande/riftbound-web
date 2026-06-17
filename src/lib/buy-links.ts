import type { CardWithPrice } from "@/types";

/**
 * "Where to buy" — a price-comparison / affiliate layer.
 *
 * For each card we build out-links to the marketplaces where it can be bought.
 * TCGplayer carries a real price (sourced from TCGCSV in our dataset); eBay and
 * Cardmarket are affiliate search links for now (their live prices require
 * their APIs, see docs). Affiliate identifiers are read from env at build time
 * on the server, so they never ship to the client bundle — only the final
 * out-link does (which legitimately contains the public campaign id).
 *
 * Notes from research:
 *  • TCGplayer affiliate runs through Impact; its data API is closed to new
 *    devs, so we link to search rather than a product API.
 *  • eBay uses the Partner Network (campid) tracking-link format.
 *  • Cardmarket affiliate is arranged directly; price data via 3rd-party APIs.
 */

export type BuySource = "cardnexus" | "tcgplayer" | "cardmarket" | "ebay";

export interface BuyOption {
  source: BuySource;
  label: string;
  /** Known unit price in EUR, or null when we only link to a search. */
  priceEur: number | null;
  url: string;
  /** Aggregator entry shown first (compares many sellers). */
  featured?: boolean;
}

function baseName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

/**
 * CardNexus — a multi-game marketplace that already compares Riftbound prices
 * across many sellers/countries. One affiliate out-link covers the whole
 * comparison. We can't deep-link an exact card without CardNexus' card id, so
 * we link to the Riftbound explorer with the name as a search hint.
 */
function cardnexusUrl(query: string): string {
  const target = `https://cardnexus.com/en/explore/riftbound?search=${encodeURIComponent(
    query
  )}`;
  const prefix = process.env.CARDNEXUS_AFFILIATE_URL;
  return prefix ? `${prefix}?u=${encodeURIComponent(target)}` : target;
}

function tcgplayerUrl(query: string): string {
  const target = `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(
    query
  )}&productLineName=riftbound`;
  // Impact deep link: <prefix>?u=<encoded destination>.
  const prefix = process.env.TCGPLAYER_AFFILIATE_URL;
  return prefix ? `${prefix}?u=${encodeURIComponent(target)}` : target;
}

function ebayUrl(query: string): string {
  const base = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;
  const campid = process.env.EBAY_CAMPID;
  if (!campid) return base;
  const params = new URLSearchParams({
    mkevt: "1",
    mkcid: "1",
    mkrid: "711-53200-19255-0",
    campid,
    toolid: "10001",
  });
  return `${base}&${params.toString()}`;
}

function cardmarketUrl(query: string): string {
  const base = `https://www.cardmarket.com/en/Riftbound/Products/Search?searchString=${encodeURIComponent(
    query
  )}`;
  const aff = process.env.CARDMARKET_AFFILIATE;
  return aff ? `${base}&utm_source=${encodeURIComponent(aff)}` : base;
}

/** Buy options for a card, cheapest known price first, search-only links last. */
export function buildBuyOptions(card: CardWithPrice): BuyOption[] {
  const query = baseName(card.nameEn);
  const options: BuyOption[] = [
    {
      source: "cardnexus",
      label: "CardNexus",
      priceEur: null,
      url: cardnexusUrl(query),
      featured: true,
    },
    {
      source: "tcgplayer",
      label: "TCGplayer",
      priceEur: card.latestPrice?.priceEur ?? null,
      url: tcgplayerUrl(query),
    },
    {
      source: "cardmarket",
      label: "Cardmarket",
      priceEur: null,
      url: cardmarketUrl(query),
    },
    {
      source: "ebay",
      label: "eBay",
      priceEur: null,
      url: ebayUrl(query),
    },
  ];

  // Featured aggregator first, then cheapest known price, then search-only.
  return options.sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    if (a.priceEur === null && b.priceEur === null) return 0;
    if (a.priceEur === null) return 1;
    if (b.priceEur === null) return -1;
    return a.priceEur - b.priceEur;
  });
}
