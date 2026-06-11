import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  sampleCards,
  sampleExtensions,
  samplePricePoints,
} from "../src/lib/data/sample-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;

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
        type: card.type,
        rarity: card.rarity,
        cost: card.cost,
        attack: card.attack,
        health: card.health,
      },
      create: {
        extensionId,
        collectorNum: card.collectorNum,
        nameFr: card.nameFr,
        nameEn: card.nameEn,
        descriptionFr: card.descriptionFr,
        descriptionEn: card.descriptionEn,
        type: card.type,
        rarity: card.rarity,
        cost: card.cost,
        attack: card.attack,
        health: card.health,
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
      slug: "strategy",
      nameFr: "Stratégie",
      nameEn: "Strategy",
      descriptionFr: "Discussions autour des stratégies et du métagame",
      descriptionEn: "Discussions about strategies and the metagame",
      sortOrder: 1,
    },
    {
      slug: "trades",
      nameFr: "Échanges",
      nameEn: "Trades",
      descriptionFr: "Proposez vos échanges de cartes",
      descriptionEn: "Post your card trade offers",
      sortOrder: 2,
    },
    {
      slug: "tournaments",
      nameFr: "Tournois",
      nameEn: "Tournaments",
      descriptionFr: "Annonces et résultats de tournois",
      descriptionEn: "Tournament announcements and results",
      sortOrder: 3,
    },
    {
      slug: "general",
      nameFr: "Général",
      nameEn: "General",
      descriptionFr: "Discussion libre autour de Riftbound",
      descriptionEn: "Open discussion about Riftbound",
      sortOrder: 4,
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
