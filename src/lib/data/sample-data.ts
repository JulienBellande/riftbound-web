/**
 * Bundled sample dataset.
 *
 * Used in two places:
 *  - `prisma/seed.ts` to populate a fresh database
 *  - the data layer's demo mode when no DATABASE_URL is configured
 *
 * Card names are original placeholders — replace with the official
 * card list once the import pipeline is connected.
 */

export type SampleCardType =
  | "UNIT"
  | "CHAMPION"
  | "SPELL"
  | "GEAR"
  | "RUNE"
  | "BATTLEFIELD";

export type SampleRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

export interface SampleExtension {
  code: string;
  nameFr: string;
  nameEn: string;
  releaseDate: string;
}

export interface SampleCard {
  /** Stable id used in demo mode and as seed lookup key */
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
}

export const sampleExtensions: SampleExtension[] = [
  {
    code: "OGN",
    nameFr: "Origines",
    nameEn: "Origins",
    releaseDate: "2025-10-15",
  },
  {
    code: "SFR",
    nameFr: "Failles Brisées",
    nameEn: "Shattered Rifts",
    releaseDate: "2026-02-20",
  },
  {
    code: "EMB",
    nameFr: "Braises de Guerre",
    nameEn: "War Embers",
    releaseDate: "2026-06-05",
  },
];

export const sampleCards: SampleCard[] = [
  // ── OGN — Origines ──────────────────────────────
  {
    slug: "ogn-001",
    extensionCode: "OGN",
    collectorNum: "001",
    nameFr: "Sentinelle de la Faille",
    nameEn: "Rift Sentinel",
    descriptionFr: "Provocation. Gagne +1 PV à chaque fin de tour.",
    descriptionEn: "Taunt. Gains +1 HP at the end of each turn.",
    type: "UNIT",
    rarity: "COMMON",
    cost: 2,
    attack: 1,
    health: 4,
  },
  {
    slug: "ogn-002",
    extensionCode: "OGN",
    collectorNum: "002",
    nameFr: "Éclaireur des Brumes",
    nameEn: "Mist Scout",
    descriptionFr: "Cri de guerre : piochez une carte si vous contrôlez une autre Unité.",
    descriptionEn: "Battlecry: draw a card if you control another Unit.",
    type: "UNIT",
    rarity: "COMMON",
    cost: 1,
    attack: 2,
    health: 1,
  },
  {
    slug: "ogn-003",
    extensionCode: "OGN",
    collectorNum: "003",
    nameFr: "Déchirure du Vide",
    nameEn: "Void Tear",
    descriptionFr: "Infligez 3 dégâts à une cible. Si elle meurt, invoquez un Spectre 1/1.",
    descriptionEn: "Deal 3 damage to a target. If it dies, summon a 1/1 Wraith.",
    type: "SPELL",
    rarity: "UNCOMMON",
    cost: 3,
    attack: null,
    health: null,
  },
  {
    slug: "ogn-004",
    extensionCode: "OGN",
    collectorNum: "004",
    nameFr: "Kaelen, Lame du Crépuscule",
    nameEn: "Kaelen, Duskblade",
    descriptionFr: "Furtivité. Quand Kaelen attaque, infligez 2 dégâts à toutes les autres unités ennemies.",
    descriptionEn: "Stealth. When Kaelen attacks, deal 2 damage to all other enemy units.",
    type: "CHAMPION",
    rarity: "LEGENDARY",
    cost: 6,
    attack: 5,
    health: 5,
  },
  {
    slug: "ogn-005",
    extensionCode: "OGN",
    collectorNum: "005",
    nameFr: "Amulette du Pèlerin",
    nameEn: "Pilgrim's Amulet",
    descriptionFr: "L'unité équipée gagne +1/+2 et Soin de zone (1).",
    descriptionEn: "Equipped unit gains +1/+2 and Area Heal (1).",
    type: "GEAR",
    rarity: "COMMON",
    cost: 2,
    attack: null,
    health: null,
  },
  {
    slug: "ogn-006",
    extensionCode: "OGN",
    collectorNum: "006",
    nameFr: "Rune de Ferveur",
    nameEn: "Rune of Fervor",
    descriptionFr: "Vos sorts coûtent 1 de moins ce tour-ci.",
    descriptionEn: "Your spells cost 1 less this turn.",
    type: "RUNE",
    rarity: "UNCOMMON",
    cost: 1,
    attack: null,
    health: null,
  },
  {
    slug: "ogn-007",
    extensionCode: "OGN",
    collectorNum: "007",
    nameFr: "Bastion d'Émeraude",
    nameEn: "Emerald Bastion",
    descriptionFr: "Champ de bataille : vos unités gagnent +0/+1.",
    descriptionEn: "Battlefield: your units gain +0/+1.",
    type: "BATTLEFIELD",
    rarity: "RARE",
    cost: 0,
    attack: null,
    health: null,
  },
  {
    slug: "ogn-008",
    extensionCode: "OGN",
    collectorNum: "008",
    nameFr: "Colosse de Givre",
    nameEn: "Frost Colossus",
    descriptionFr: "Quand cette unité entre en jeu, gelez une unité ennemie.",
    descriptionEn: "When this unit enters play, freeze an enemy unit.",
    type: "UNIT",
    rarity: "EPIC",
    cost: 7,
    attack: 6,
    health: 8,
  },
  {
    slug: "ogn-009",
    extensionCode: "OGN",
    collectorNum: "009",
    nameFr: "Chant de Renouveau",
    nameEn: "Song of Renewal",
    descriptionFr: "Restaurez 4 PV à toutes vos unités.",
    descriptionEn: "Restore 4 HP to all your units.",
    type: "SPELL",
    rarity: "COMMON",
    cost: 2,
    attack: null,
    health: null,
  },
  {
    slug: "ogn-010",
    extensionCode: "OGN",
    collectorNum: "010",
    nameFr: "Maître des Arcanes",
    nameEn: "Arcane Master",
    descriptionFr: "Vos sorts infligent +1 dégât.",
    descriptionEn: "Your spells deal +1 damage.",
    type: "UNIT",
    rarity: "RARE",
    cost: 4,
    attack: 3,
    health: 4,
  },
  {
    slug: "ogn-011",
    extensionCode: "OGN",
    collectorNum: "011",
    nameFr: "Sceptre des Profondeurs",
    nameEn: "Scepter of the Depths",
    descriptionFr: "À la fin de votre tour, invoquez une Méduse 2/1.",
    descriptionEn: "At the end of your turn, summon a 2/1 Jellyfish.",
    type: "GEAR",
    rarity: "EPIC",
    cost: 5,
    attack: null,
    health: null,
  },
  {
    slug: "ogn-012",
    extensionCode: "OGN",
    collectorNum: "012",
    nameFr: "Vyra, Oracle des Marées",
    nameEn: "Vyra, Tide Oracle",
    descriptionFr: "Au début de votre tour, regardez les 3 premières cartes de votre deck et choisissez-en une.",
    descriptionEn: "At the start of your turn, look at the top 3 cards of your deck and pick one.",
    type: "CHAMPION",
    rarity: "LEGENDARY",
    cost: 5,
    attack: 3,
    health: 6,
  },

  // ── SFR — Failles Brisées ───────────────────────
  {
    slug: "sfr-001",
    extensionCode: "SFR",
    collectorNum: "001",
    nameFr: "Pillard des Failles",
    nameEn: "Rift Raider",
    descriptionFr: "Charge. Ne peut pas bloquer.",
    descriptionEn: "Charge. Cannot block.",
    type: "UNIT",
    rarity: "COMMON",
    cost: 3,
    attack: 4,
    health: 2,
  },
  {
    slug: "sfr-002",
    extensionCode: "SFR",
    collectorNum: "002",
    nameFr: "Tisseuse d'Échos",
    nameEn: "Echo Weaver",
    descriptionFr: "Quand vous lancez un sort, copiez-le sur une cible aléatoire.",
    descriptionEn: "When you cast a spell, copy it onto a random target.",
    type: "UNIT",
    rarity: "EPIC",
    cost: 5,
    attack: 3,
    health: 5,
  },
  {
    slug: "sfr-003",
    extensionCode: "SFR",
    collectorNum: "003",
    nameFr: "Fracture Temporelle",
    nameEn: "Time Fracture",
    descriptionFr: "Jouez un tour supplémentaire après celui-ci. Détruisez cette carte.",
    descriptionEn: "Take an extra turn after this one. Destroy this card.",
    type: "SPELL",
    rarity: "LEGENDARY",
    cost: 9,
    attack: null,
    health: null,
  },
  {
    slug: "sfr-004",
    extensionCode: "SFR",
    collectorNum: "004",
    nameFr: "Garde-Brume",
    nameEn: "Mistwarden",
    descriptionFr: "Provocation. Cri de guerre : gagnez 4 PV.",
    descriptionEn: "Taunt. Battlecry: gain 4 HP.",
    type: "UNIT",
    rarity: "UNCOMMON",
    cost: 4,
    attack: 2,
    health: 6,
  },
  {
    slug: "sfr-005",
    extensionCode: "SFR",
    collectorNum: "005",
    nameFr: "Orbe de Réplication",
    nameEn: "Replication Orb",
    descriptionFr: "Votre prochaine unité jouée est copiée.",
    descriptionEn: "The next unit you play is copied.",
    type: "GEAR",
    rarity: "RARE",
    cost: 3,
    attack: null,
    health: null,
  },
  {
    slug: "sfr-006",
    extensionCode: "SFR",
    collectorNum: "006",
    nameFr: "Rune d'Entropie",
    nameEn: "Rune of Entropy",
    descriptionFr: "Détruisez un Équipement ou une Rune.",
    descriptionEn: "Destroy a Gear or a Rune.",
    type: "RUNE",
    rarity: "COMMON",
    cost: 1,
    attack: null,
    health: null,
  },
  {
    slug: "sfr-007",
    extensionCode: "SFR",
    collectorNum: "007",
    nameFr: "Plaines Dévastées",
    nameEn: "Ravaged Plains",
    descriptionFr: "Champ de bataille : les unités à 1 PV ne peuvent pas être soignées.",
    descriptionEn: "Battlefield: units at 1 HP cannot be healed.",
    type: "BATTLEFIELD",
    rarity: "UNCOMMON",
    cost: 0,
    attack: null,
    health: null,
  },
  {
    slug: "sfr-008",
    extensionCode: "SFR",
    collectorNum: "008",
    nameFr: "Theron, Briseur de Chaînes",
    nameEn: "Theron, Chainbreaker",
    descriptionFr: "Cri de guerre : détruisez tous les Équipements ennemis. Gagne +1/+1 pour chacun.",
    descriptionEn: "Battlecry: destroy all enemy Gear. Gains +1/+1 for each.",
    type: "CHAMPION",
    rarity: "LEGENDARY",
    cost: 7,
    attack: 6,
    health: 6,
  },
  {
    slug: "sfr-009",
    extensionCode: "SFR",
    collectorNum: "009",
    nameFr: "Imprécation Sinistre",
    nameEn: "Grim Imprecation",
    descriptionFr: "Une unité ennemie obtient -3/-3 jusqu'à la fin du tour.",
    descriptionEn: "An enemy unit gets -3/-3 until end of turn.",
    type: "SPELL",
    rarity: "COMMON",
    cost: 2,
    attack: null,
    health: null,
  },
  {
    slug: "sfr-010",
    extensionCode: "SFR",
    collectorNum: "010",
    nameFr: "Prophétesse du Néant",
    nameEn: "Void Prophetess",
    descriptionFr: "Râle d'agonie : votre adversaire défausse une carte.",
    descriptionEn: "Deathrattle: your opponent discards a card.",
    type: "UNIT",
    rarity: "RARE",
    cost: 3,
    attack: 3,
    health: 3,
  },
  {
    slug: "sfr-011",
    extensionCode: "SFR",
    collectorNum: "011",
    nameFr: "Heaume du Juggernaut",
    nameEn: "Juggernaut Helm",
    descriptionFr: "L'unité équipée gagne +2/+2 et Immunité aux sorts.",
    descriptionEn: "Equipped unit gains +2/+2 and Spell Immunity.",
    type: "GEAR",
    rarity: "EPIC",
    cost: 4,
    attack: null,
    health: null,
  },
  {
    slug: "sfr-012",
    extensionCode: "SFR",
    collectorNum: "012",
    nameFr: "Salve de Représailles",
    nameEn: "Retaliation Volley",
    descriptionFr: "Infligez 1 dégât à chaque unité ennemie pour chaque unité alliée morte ce tour-ci.",
    descriptionEn: "Deal 1 damage to each enemy unit for each friendly unit that died this turn.",
    type: "SPELL",
    rarity: "UNCOMMON",
    cost: 3,
    attack: null,
    health: null,
  },

  // ── EMB — Braises de Guerre ─────────────────────
  {
    slug: "emb-001",
    extensionCode: "EMB",
    collectorNum: "001",
    nameFr: "Recrue Enflammée",
    nameEn: "Kindled Recruit",
    descriptionFr: "Râle d'agonie : infligez 1 dégât à l'unité qui l'a tuée.",
    descriptionEn: "Deathrattle: deal 1 damage to the unit that killed it.",
    type: "UNIT",
    rarity: "COMMON",
    cost: 1,
    attack: 1,
    health: 2,
  },
  {
    slug: "emb-002",
    extensionCode: "EMB",
    collectorNum: "002",
    nameFr: "Pyromancienne Aguerrie",
    nameEn: "Seasoned Pyromancer",
    descriptionFr: "Quand vous lancez un sort de feu, infligez 2 dégâts aléatoires.",
    descriptionEn: "When you cast a fire spell, deal 2 damage randomly.",
    type: "UNIT",
    rarity: "RARE",
    cost: 4,
    attack: 4,
    health: 3,
  },
  {
    slug: "emb-003",
    extensionCode: "EMB",
    collectorNum: "003",
    nameFr: "Tempête de Cendres",
    nameEn: "Ashstorm",
    descriptionFr: "Infligez 2 dégâts à toutes les unités.",
    descriptionEn: "Deal 2 damage to all units.",
    type: "SPELL",
    rarity: "UNCOMMON",
    cost: 4,
    attack: null,
    health: null,
  },
  {
    slug: "emb-004",
    extensionCode: "EMB",
    collectorNum: "004",
    nameFr: "Ignis, Cœur de Braise",
    nameEn: "Ignis, Emberheart",
    descriptionFr: "Vos sorts de feu coûtent 1 de moins. À votre fin de tour, infligez 1 dégât au héros ennemi.",
    descriptionEn: "Your fire spells cost 1 less. At your end of turn, deal 1 damage to the enemy hero.",
    type: "CHAMPION",
    rarity: "LEGENDARY",
    cost: 8,
    attack: 7,
    health: 7,
  },
  {
    slug: "emb-005",
    extensionCode: "EMB",
    collectorNum: "005",
    nameFr: "Forge de Guerre",
    nameEn: "War Forge",
    descriptionFr: "Champ de bataille : vos Équipements coûtent 1 de moins.",
    descriptionEn: "Battlefield: your Gear costs 1 less.",
    type: "BATTLEFIELD",
    rarity: "RARE",
    cost: 0,
    attack: null,
    health: null,
  },
  {
    slug: "emb-006",
    extensionCode: "EMB",
    collectorNum: "006",
    nameFr: "Lame Fumante",
    nameEn: "Smoldering Blade",
    descriptionFr: "L'unité équipée gagne +3/+0 et Initiative.",
    descriptionEn: "Equipped unit gains +3/+0 and First Strike.",
    type: "GEAR",
    rarity: "UNCOMMON",
    cost: 2,
    attack: null,
    health: null,
  },
  {
    slug: "emb-007",
    extensionCode: "EMB",
    collectorNum: "007",
    nameFr: "Rune d'Embrasement",
    nameEn: "Rune of Conflagration",
    descriptionFr: "Votre prochain sort de feu inflige des dégâts doublés.",
    descriptionEn: "Your next fire spell deals double damage.",
    type: "RUNE",
    rarity: "RARE",
    cost: 2,
    attack: null,
    health: null,
  },
  {
    slug: "emb-008",
    extensionCode: "EMB",
    collectorNum: "008",
    nameFr: "Béhémoth Magmatique",
    nameEn: "Magma Behemoth",
    descriptionFr: "Provocation. Quand cette unité subit des dégâts, infligez 2 dégâts à l'attaquant.",
    descriptionEn: "Taunt. When this unit takes damage, deal 2 damage to the attacker.",
    type: "UNIT",
    rarity: "EPIC",
    cost: 6,
    attack: 5,
    health: 7,
  },
  {
    slug: "emb-009",
    extensionCode: "EMB",
    collectorNum: "009",
    nameFr: "Étincelle Vitale",
    nameEn: "Vital Spark",
    descriptionFr: "Restaurez 3 PV. Piochez une carte.",
    descriptionEn: "Restore 3 HP. Draw a card.",
    type: "SPELL",
    rarity: "COMMON",
    cost: 1,
    attack: null,
    health: null,
  },
  {
    slug: "emb-010",
    extensionCode: "EMB",
    collectorNum: "010",
    nameFr: "Vétéran des Braises",
    nameEn: "Ember Veteran",
    descriptionFr: "Cri de guerre : gagne +1/+1 pour chaque sort lancé ce tour-ci.",
    descriptionEn: "Battlecry: gains +1/+1 for each spell cast this turn.",
    type: "UNIT",
    rarity: "UNCOMMON",
    cost: 3,
    attack: 2,
    health: 3,
  },
  {
    slug: "emb-011",
    extensionCode: "EMB",
    collectorNum: "011",
    nameFr: "Couronne du Conquérant",
    nameEn: "Conqueror's Crown",
    descriptionFr: "L'unité équipée gagne +2/+2. Quand elle détruit une unité, piochez une carte.",
    descriptionEn: "Equipped unit gains +2/+2. When it destroys a unit, draw a card.",
    type: "GEAR",
    rarity: "EPIC",
    cost: 5,
    attack: null,
    health: null,
  },
  {
    slug: "emb-012",
    extensionCode: "EMB",
    collectorNum: "012",
    nameFr: "Embrasement Final",
    nameEn: "Final Conflagration",
    descriptionFr: "Détruisez toutes les unités. Infligez 3 dégâts aux deux héros.",
    descriptionEn: "Destroy all units. Deal 3 damage to both heroes.",
    type: "SPELL",
    rarity: "EPIC",
    cost: 8,
    attack: null,
    health: null,
  },
];

/** Base EUR price per rarity, in euros */
const RARITY_BASE_PRICE: Record<SampleRarity, number> = {
  COMMON: 0.15,
  UNCOMMON: 0.45,
  RARE: 2.4,
  EPIC: 7.9,
  LEGENDARY: 24.5,
};

const EUR_TO_USD = 1.08;
const EUR_TO_GBP = 0.85;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Deterministic pseudo-variation in [-0.25, +0.25] derived from the slug */
function variation(slug: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) % 1000;
  }
  return (h / 1000 - 0.5) * 0.5;
}

export interface SamplePricePoint {
  priceEur: number;
  priceUsd: number;
  priceGbp: number;
  /** days before "now" */
  ageDays: number;
}

/**
 * Two price points per card: one current, one ~7 days old.
 * Enables trend display (7-day delta) without a price history pipeline.
 */
export function samplePricePoints(card: SampleCard): SamplePricePoint[] {
  const base = RARITY_BASE_PRICE[card.rarity];
  const current = Math.max(0.05, base * (1 + variation(card.slug, 7)));
  const previous = Math.max(0.05, current * (1 + variation(card.slug, 131)));

  return [
    {
      priceEur: round2(previous),
      priceUsd: round2(previous * EUR_TO_USD),
      priceGbp: round2(previous * EUR_TO_GBP),
      ageDays: 7,
    },
    {
      priceEur: round2(current),
      priceUsd: round2(current * EUR_TO_USD),
      priceGbp: round2(current * EUR_TO_GBP),
      ageDays: 0,
    },
  ];
}
