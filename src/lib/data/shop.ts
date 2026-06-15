import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import type { SupportedLocale, PaginatedResponse } from "@/types";

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceEur: number;
  priceUsd: number;
  priceGbp: number;
  imageUrl: string | null;
  stock: number;
  category: string;
}

const DEMO_PRODUCTS: (Omit<ShopProduct, "name" | "description"> & {
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
})[] = [
  {
    id: "prod-1",
    slug: "playmat-rift-origins",
    nameFr: "Tapis de jeu — Origines",
    nameEn: "Playmat — Origins",
    descFr: "Tapis de jeu officiel illustré avec l'artwork de l'extension Origines. 60x35 cm, surface en tissu premium.",
    descEn: "Official playmat featuring Origins expansion artwork. 60x35 cm, premium cloth surface.",
    priceEur: 29.99,
    priceUsd: 32.39,
    priceGbp: 25.49,
    imageUrl: null,
    stock: 45,
    category: "PLAYMAT",
  },
  {
    id: "prod-2",
    slug: "sleeves-kaelen",
    nameFr: "Protège-cartes — Kaelen",
    nameEn: "Card Sleeves — Kaelen",
    descFr: "Lot de 100 protège-cartes avec l'illustration de Kaelen, Lame du Crépuscule.",
    descEn: "Pack of 100 card sleeves featuring Kaelen, Duskblade artwork.",
    priceEur: 12.99,
    priceUsd: 14.03,
    priceGbp: 11.04,
    imageUrl: null,
    stock: 120,
    category: "SLEEVES",
  },
  {
    id: "prod-3",
    slug: "deckbox-amber",
    nameFr: "Deck Box — Ambre",
    nameEn: "Deck Box — Amber",
    descFr: "Boîte de rangement premium pouvant contenir 80 cartes avec protège-cartes. Finition ambre métallisé.",
    descEn: "Premium deck box holding 80 sleeved cards. Metallic amber finish.",
    priceEur: 19.99,
    priceUsd: 21.59,
    priceGbp: 16.99,
    imageUrl: null,
    stock: 67,
    category: "DECKBOX",
  },
  {
    id: "prod-4",
    slug: "figurine-ignis",
    nameFr: "Figurine — Ignis, Cœur de Braise",
    nameEn: "Figurine — Ignis, Emberheart",
    descFr: "Figurine collector en résine peinte à la main. Hauteur 15 cm. Édition limitée à 500 exemplaires.",
    descEn: "Hand-painted resin collector figurine. Height 15 cm. Limited edition of 500.",
    priceEur: 89.99,
    priceUsd: 97.19,
    priceGbp: 76.49,
    imageUrl: null,
    stock: 12,
    category: "FIGURINE",
  },
  {
    id: "prod-5",
    slug: "tshirt-riftbound-logo",
    nameFr: "T-shirt — Logo RiftForge",
    nameEn: "T-shirt — RiftForge Logo",
    descFr: "T-shirt 100% coton avec le logo RiftForge doré. Disponible en S, M, L, XL.",
    descEn: "100% cotton t-shirt with golden RiftForge logo. Available in S, M, L, XL.",
    priceEur: 24.99,
    priceUsd: 26.99,
    priceGbp: 21.24,
    imageUrl: null,
    stock: 200,
    category: "CLOTHING",
  },
  {
    id: "prod-6",
    slug: "sleeves-vyra",
    nameFr: "Protège-cartes — Vyra",
    nameEn: "Card Sleeves — Vyra",
    descFr: "Lot de 100 protège-cartes avec l'illustration de Vyra, Oracle des Marées.",
    descEn: "Pack of 100 card sleeves featuring Vyra, Tide Oracle artwork.",
    priceEur: 12.99,
    priceUsd: 14.03,
    priceGbp: 11.04,
    imageUrl: null,
    stock: 85,
    category: "SLEEVES",
  },
  {
    id: "prod-7",
    slug: "dice-set-riftbound",
    nameFr: "Set de dés — Riftbound",
    nameEn: "Dice Set — Riftbound",
    descFr: "Set de 6 dés gravés aux couleurs de Riftbound pour le suivi des compteurs.",
    descEn: "Set of 6 engraved Riftbound-themed dice for counter tracking.",
    priceEur: 14.99,
    priceUsd: 16.19,
    priceGbp: 12.74,
    imageUrl: null,
    stock: 150,
    category: "ACCESSORY",
  },
  {
    id: "prod-8",
    slug: "playmat-war-embers",
    nameFr: "Tapis de jeu — Braises de Guerre",
    nameEn: "Playmat — War Embers",
    descFr: "Tapis de jeu officiel illustré avec l'artwork d'Ignis. 60x35 cm, surface en tissu premium.",
    descEn: "Official playmat featuring Ignis artwork. 60x35 cm, premium cloth surface.",
    priceEur: 29.99,
    priceUsd: 32.39,
    priceGbp: 25.49,
    imageUrl: null,
    stock: 30,
    category: "PLAYMAT",
  },
];

function localize(
  product: (typeof DEMO_PRODUCTS)[number],
  locale: SupportedLocale
): ShopProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: locale === "fr" ? product.nameFr : product.nameEn,
    description: locale === "fr" ? product.descFr : product.descEn,
    priceEur: product.priceEur,
    priceUsd: product.priceUsd,
    priceGbp: product.priceGbp,
    imageUrl: product.imageUrl,
    stock: product.stock,
    category: product.category,
  };
}

export async function getProducts(
  locale: SupportedLocale,
  filters: { category?: string; page?: number; perPage?: number }
): Promise<PaginatedResponse<ShopProduct>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 20, 1), 50);

  if (!isDatabaseConfigured()) {
    let products = DEMO_PRODUCTS.map((p) => localize(p, locale));
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    const start = (page - 1) * perPage;
    return {
      data: products.slice(start, start + perPage),
      total: products.length,
      page,
      perPage,
      totalPages: Math.ceil(products.length / perPage),
    };
  }

  const nameField = locale === "fr" ? "nameFr" : "nameEn";
  const descField = locale === "fr" ? "descriptionFr" : "descriptionEn";

  const where = {
    isActive: true,
    ...(filters.category && { category: filters.category as never }),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    data: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p[nameField] as string,
      description: (p[descField] as string) ?? null,
      priceEur: Number(p.priceEur),
      priceUsd: Number(p.priceUsd),
      priceGbp: Number(p.priceGbp),
      imageUrl: p.imageUrl,
      stock: p.stock,
      category: p.category,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProductsByIds(
  ids: string[],
  locale: SupportedLocale
): Promise<ShopProduct[]> {
  if (!isDatabaseConfigured()) {
    return DEMO_PRODUCTS.filter((p) => ids.includes(p.id)).map((p) =>
      localize(p, locale)
    );
  }

  const nameField = locale === "fr" ? "nameFr" : "nameEn";
  const descField = locale === "fr" ? "descriptionFr" : "descriptionEn";

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p[nameField] as string,
    description: (p[descField] as string) ?? null,
    priceEur: Number(p.priceEur),
    priceUsd: Number(p.priceUsd),
    priceGbp: Number(p.priceGbp),
    imageUrl: p.imageUrl,
    stock: p.stock,
    category: p.category,
  }));
}

export async function getProductBySlug(
  slug: string,
  locale: SupportedLocale
): Promise<ShopProduct | null> {
  if (!isDatabaseConfigured()) {
    const p = DEMO_PRODUCTS.find((p) => p.slug === slug);
    return p ? localize(p, locale) : null;
  }

  const nameField = locale === "fr" ? "nameFr" : "nameEn";
  const descField = locale === "fr" ? "descriptionFr" : "descriptionEn";

  const p = await prisma.product.findUnique({ where: { slug } });
  if (!p || !p.isActive) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p[nameField] as string,
    description: (p[descField] as string) ?? null,
    priceEur: Number(p.priceEur),
    priceUsd: Number(p.priceUsd),
    priceGbp: Number(p.priceGbp),
    imageUrl: p.imageUrl,
    stock: p.stock,
    category: p.category,
  };
}
