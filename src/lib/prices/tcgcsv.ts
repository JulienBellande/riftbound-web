/**
 * TCGCSV price source — a free, no-auth bulk mirror of TCGplayer's API.
 * Docs: https://tcgcsv.com/
 *
 * Exposes the real TCGplayer **market** and **low** prices (USD) for every
 * Riftbound card, indexed so we can match them to our dataset. Our English
 * card names already carry the same "(Overnumbered)" / "(Signature)" /
 * "(Alternate Art)" suffixes TCGplayer uses, so a (set, name) lookup resolves
 * each individual printing to its own real price — no fabricated premiums.
 *
 * Used by:
 *   • scripts/refresh-prices.ts  → rewrites the bundled demo dataset
 *   • app/api/cron/update-prices  → appends daily price snapshots in prod
 */

const BASE = "https://tcgcsv.com/tcgplayer";

export const USD_TO_EUR = 0.92;
export const USD_TO_GBP = 0.79;

export interface TcgPrice {
  marketUsd: number | null;
  lowUsd: number | null;
}

interface Category {
  categoryId: number;
  name: string;
}
interface Group {
  groupId: number;
  name: string;
  abbreviation: string | null;
}
interface Product {
  productId: number;
  name: string;
}
interface PriceRow {
  productId: number;
  lowPrice: number | null;
  midPrice: number | null;
  marketPrice: number | null;
  subTypeName: string;
}
interface Envelope<T> {
  success: boolean;
  results: T[];
}

/** Lowercase, straighten apostrophes, collapse whitespace — for name matching. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`TCGCSV ${res.status} ${res.statusText} — ${url}`);
  return (await res.json()) as T;
}

/** Collapse a product's per-subtype rows into one best price. */
function bestPrice(rows: PriceRow[]): TcgPrice {
  let marketUsd: number | null = null;
  let lowUsd: number | null = null;
  for (const r of rows) {
    if (r.marketPrice && r.marketPrice > 0) {
      marketUsd = marketUsd === null ? r.marketPrice : Math.max(marketUsd, r.marketPrice);
    }
    if (r.lowPrice && r.lowPrice > 0) {
      lowUsd = lowUsd === null ? r.lowPrice : Math.min(lowUsd, r.lowPrice);
    }
  }
  // Fall back to mid price when no market price is published yet.
  if (marketUsd === null) {
    for (const r of rows) {
      if (r.midPrice && r.midPrice > 0) {
        marketUsd = r.midPrice;
        break;
      }
    }
  }
  return { marketUsd, lowUsd };
}

/**
 * In-memory index of every Riftbound price, with a tolerant lookup that
 * tries (set, name) first and falls back to name-only.
 */
export class PriceIndex {
  private bySetAndName = new Map<string, TcgPrice>();
  private byName = new Map<string, TcgPrice>();
  /** Maps a card's set code (OGN, SFD, …) to the TCGCSV group key it matched. */
  readonly groupKeys: string[] = [];

  add(setKey: string, name: string, price: TcgPrice) {
    const norm = normalizeName(name);
    this.bySetAndName.set(`${setKey.toUpperCase()}::${norm}`, price);
    this.byName.set(norm, price);
  }

  lookup(setCode: string, name: string): TcgPrice | null {
    const norm = normalizeName(name);
    return (
      this.bySetAndName.get(`${setCode.toUpperCase()}::${norm}`) ??
      this.byName.get(norm) ??
      null
    );
  }

  get size() {
    return this.byName.size;
  }
}

export async function findRiftboundCategoryId(): Promise<number> {
  const { results } = await getJson<Envelope<Category>>(`${BASE}/categories`);
  const cat = results.find((c) => /riftbound/i.test(c.name));
  if (!cat) throw new Error("Riftbound category not found on TCGCSV");
  return cat.categoryId;
}

/** Fetches and indexes the real TCGplayer prices for the whole Riftbound game. */
export async function fetchRiftboundPriceIndex(): Promise<PriceIndex> {
  const categoryId = await findRiftboundCategoryId();
  const { results: groups } = await getJson<Envelope<Group>>(
    `${BASE}/${categoryId}/groups`
  );

  const index = new PriceIndex();

  await Promise.all(
    groups.map(async (group) => {
      const [{ results: products }, { results: prices }] = await Promise.all([
        getJson<Envelope<Product>>(`${BASE}/${categoryId}/${group.groupId}/products`),
        getJson<Envelope<PriceRow>>(`${BASE}/${categoryId}/${group.groupId}/prices`),
      ]);

      // productId → best price (across subtypes)
      const priceByProduct = new Map<number, PriceRow[]>();
      for (const row of prices) {
        const arr = priceByProduct.get(row.productId) ?? [];
        arr.push(row);
        priceByProduct.set(row.productId, arr);
      }

      // Index every product under both its abbreviation and its full name, so
      // either of our set codes / names resolves it.
      const setKeys = [group.abbreviation, group.name].filter(Boolean) as string[];
      for (const product of products) {
        const rows = priceByProduct.get(product.productId);
        if (!rows) continue;
        const price = bestPrice(rows);
        if (price.marketUsd === null && price.lowUsd === null) continue;
        for (const key of setKeys) index.add(key, product.name, price);
      }
    })
  );

  return index;
}
