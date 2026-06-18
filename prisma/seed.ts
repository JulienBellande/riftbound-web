import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { CardType, CardRarity } from "../src/generated/prisma/enums";
import {
  sampleCards,
  sampleExtensions,
  samplePricePoints,
} from "../src/lib/data/sample-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;

const TYPE_MAP: Record<string, CardType> = {
  UNIT: "UNIT",
  SPELL: "SPELL",
  RUNE: "RUNE",
  GEAR: "GEAR",
  LEGEND: "LEGEND",
  BATTLEFIELD: "BATTLEFIELD",
};

const RARITY_MAP: Record<string, CardRarity> = {
  COMMON: "COMMON",
  UNCOMMON: "UNCOMMON",
  RARE: "RARE",
  EPIC: "EPIC",
  SHOWCASE: "SHOWCASE",
  PROMO: "PROMO",
};

async function main() {
  console.log("Seeding extensions...");
  const extensionIdByCode = new Map<string, string>();

  for (const ext of sampleExtensions) {
    const row = await prisma.extension.upsert({
      where: { code: ext.code },
      update: {
        nameFr: ext.nameFr,
        nameEn: ext.nameEn,
        releaseDate: new Date(ext.releaseDate),
      },
      create: {
        code: ext.code,
        nameFr: ext.nameFr,
        nameEn: ext.nameEn,
        releaseDate: new Date(ext.releaseDate),
      },
    });
    extensionIdByCode.set(ext.code, row.id);
  }

  console.log(`Seeding ${sampleCards.length} cards...`);
  for (const card of sampleCards) {
    const extensionId = extensionIdByCode.get(card.extensionCode)!;

    const dbType = TYPE_MAP[card.type] ?? "UNIT";
    const dbRarity = RARITY_MAP[card.rarity] ?? "COMMON";

    const row = await prisma.card.upsert({
      where: {
        extensionId_collectorNum: {
          extensionId,
          collectorNum: card.collectorNum,
        },
      },
      update: {
        nameFr: card.nameFr,
        nameEn: card.nameEn,
        descriptionFr: card.descriptionFr,
        descriptionEn: card.descriptionEn,
        type: dbType,
        rarity: dbRarity,
        cost: card.cost,
        attack: card.attack,
        health: card.health,
        imageUrl: card.imageUrl,
        domain: card.domain,
        tags: card.tags,
      },
      create: {
        extensionId,
        collectorNum: card.collectorNum,
        nameFr: card.nameFr,
        nameEn: card.nameEn,
        descriptionFr: card.descriptionFr,
        descriptionEn: card.descriptionEn,
        type: dbType,
        rarity: dbRarity,
        cost: card.cost,
        attack: card.attack,
        health: card.health,
        imageUrl: card.imageUrl,
        domain: card.domain,
        tags: card.tags,
      },
    });

    // Reset price history so the seed stays idempotent
    await prisma.cardPrice.deleteMany({ where: { cardId: row.id } });
    for (const point of samplePricePoints(card)) {
      await prisma.cardPrice.create({
        data: {
          cardId: row.id,
          priceEur: point.priceEur,
          priceUsd: point.priceUsd,
          priceGbp: point.priceGbp,
          source: "seed",
          fetchedAt: new Date(Date.now() - point.ageDays * DAY_MS),
        },
      });
    }
  }

  console.log("Seeding forum categories...");
  const forumCategories = [
    {
      slug: "general",
      nameFr: "Général",
      nameEn: "General",
      descriptionFr: "Discussions ouvertes autour de Riftbound et de la communauté.",
      descriptionEn: "Open discussion about Riftbound and the community.",
      sortOrder: 1,
    },
    {
      slug: "strategy",
      nameFr: "Stratégie & Méta",
      nameEn: "Strategy & Meta",
      descriptionFr: "Tactiques, analyses de matchups et évolution du métagame.",
      descriptionEn: "Tactics, matchup analysis and how the metagame is shifting.",
      sortOrder: 2,
    },
    {
      slug: "decks",
      nameFr: "Decks",
      nameEn: "Decks",
      descriptionFr: "Partagez vos listes, demandez des retours et améliorez vos decks.",
      descriptionEn: "Share your lists, ask for feedback and refine your decks.",
      sortOrder: 3,
    },
    {
      slug: "help",
      nameFr: "Entraide",
      nameEn: "Help",
      descriptionFr: "Questions de règles et coups de main pour les nouveaux joueurs.",
      descriptionEn: "Rules questions and a hand for new players.",
      sortOrder: 4,
    },
    {
      slug: "events",
      nameFr: "Événements & Tournois",
      nameEn: "Events & Tournaments",
      descriptionFr: "Organisez, annoncez et débriefez vos tournois et rencontres.",
      descriptionEn: "Organise, announce and recap your tournaments and meetups.",
      sortOrder: 5,
    },
  ];

  for (const cat of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
