/**
 * Rewrites the bundled demo dataset (src/lib/data/riftbound-cards.json) with
 * real TCGplayer prices pulled from TCGCSV (https://tcgcsv.com/).
 *
 * Run where tcgcsv.com is reachable (locally, CI, or any environment whose
 * network egress allows it):
 *
 *     npm run refresh-prices
 *
 * Every card is matched to its individual printing by (set, name) — including
 * the "(Overnumbered)" / "(Signature)" / "(Alternate Art)" variants — so each
 * gets its own real price. No fabricated premiums.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchRiftboundPriceIndex } from "../src/lib/prices/tcgcsv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, "../src/lib/data/riftbound-cards.json");

interface RawCard {
  name: string;
  set: string;
  priceUsd: number | null;
  marketUsd: number | null;
}
interface RawData {
  sets: unknown[];
  cards: RawCard[];
}

async function main() {
  console.log("Fetching real TCGplayer prices from TCGCSV …");
  const index = await fetchRiftboundPriceIndex();
  console.log(`Indexed ${index.size} priced products.\n`);

  const data = JSON.parse(readFileSync(FILE, "utf8")) as RawData;

  let matched = 0;
  let missed = 0;
  const misses: string[] = [];

  for (const card of data.cards) {
    const price = index.lookup(card.set, card.name);
    if (price && (price.marketUsd !== null || price.lowUsd !== null)) {
      if (price.marketUsd !== null) card.marketUsd = price.marketUsd;
      if (price.lowUsd !== null) card.priceUsd = price.lowUsd;
      matched++;
    } else {
      missed++;
      if (misses.length < 40) misses.push(`${card.set}  ${card.name}`);
    }
  }

  writeFileSync(FILE, JSON.stringify(data));

  console.log(`✓ Updated prices for ${matched} cards (${missed} unmatched).`);
  if (misses.length) {
    console.log("\nUnmatched (first 40 — left at their previous value):");
    for (const m of misses) console.log("  · " + m);
  }
}

main().catch((err) => {
  console.error("\n✗ Price refresh failed:", err.message ?? err);
  process.exit(1);
});
