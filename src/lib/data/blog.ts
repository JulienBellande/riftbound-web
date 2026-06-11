import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import type { SupportedLocale, PaginatedResponse } from "@/types";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  publishedAt: string;
  author: { username: string; avatarUrl: string | null };
}

const DEMO_POSTS: (Omit<BlogPost, "title" | "excerpt" | "content"> & {
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
})[] = [
  {
    id: "post-1",
    slug: "patch-2-1-equilibrage",
    titleFr: "Patch 2.1 : Rééquilibrage majeur",
    titleEn: "Patch 2.1: Major Rebalancing",
    excerptFr: "Les Champions Kaelen et Vyra reçoivent des ajustements importants, et trois nouvelles cartes rejoignent l'extension Braises de Guerre.",
    excerptEn: "Champions Kaelen and Vyra receive major adjustments, and three new cards join the War Embers expansion.",
    contentFr: "Le patch 2.1 apporte des changements significatifs à la méta actuelle. Kaelen passe de 5/5 à 4/5, tandis que Vyra voit son coût augmenter de 5 à 6 cristaux. Ces ajustements visent à diversifier les stratégies viables en tournoi.\n\nTrois nouvelles cartes sont également introduites dans l'extension Braises de Guerre, offrant de nouvelles options pour les decks de contrôle.",
    contentEn: "Patch 2.1 brings significant changes to the current meta. Kaelen drops from 5/5 to 4/5, while Vyra sees her cost increase from 5 to 6 crystals. These adjustments aim to diversify viable tournament strategies.\n\nThree new cards are also introduced in the War Embers expansion, offering new options for control decks.",
    coverImage: null,
    category: "PATCH_NOTES",
    publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    author: { username: "RiftboundTeam", avatarUrl: null },
  },
  {
    id: "post-2",
    slug: "guide-deck-aggro-debutant",
    titleFr: "Guide : Construire son premier deck aggro",
    titleEn: "Guide: Building Your First Aggro Deck",
    excerptFr: "Apprenez les bases de la construction de deck agressif avec un budget limité. Idéal pour les débutants.",
    excerptEn: "Learn the basics of aggressive deck building on a budget. Perfect for beginners.",
    contentFr: "Un deck aggro vise à terminer la partie le plus rapidement possible. La clé est de maximiser les unités à faible coût avec un bon ratio attaque/coût.\n\n## Les fondamentaux\n\n1. **Courbe de mana basse** : La majorité de vos cartes doivent coûter entre 1 et 3 cristaux.\n2. **Pression constante** : Chaque tour doit apporter une menace supplémentaire.\n3. **Finisseurs** : 2-3 cartes à coût moyen pour achever l'adversaire.\n\n## Exemple de deck budget\n\n- 4x Éclaireur des Brumes (1 cristal)\n- 4x Recrue Enflammée (1 cristal)\n- 4x Pillard des Failles (3 cristaux)\n- 2x Amulette du Pèlerin (2 cristaux)\n- Et plus...",
    contentEn: "An aggro deck aims to end the game as quickly as possible. The key is to maximize low-cost units with a good attack/cost ratio.\n\n## The Fundamentals\n\n1. **Low mana curve**: Most of your cards should cost between 1 and 3 crystals.\n2. **Constant pressure**: Each turn should bring an additional threat.\n3. **Finishers**: 2-3 medium-cost cards to finish the opponent.\n\n## Budget Deck Example\n\n- 4x Mist Scout (1 crystal)\n- 4x Kindled Recruit (1 crystal)\n- 4x Rift Raider (3 crystals)\n- 2x Pilgrim's Amulet (2 crystals)\n- And more...",
    coverImage: null,
    category: "GUIDE",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    author: { username: "ShadowMage", avatarUrl: null },
  },
  {
    id: "post-3",
    slug: "meta-report-semaine-23",
    titleFr: "Rapport Méta — Semaine 23",
    titleEn: "Meta Report — Week 23",
    excerptFr: "Emberheart Control domine le classement cette semaine avec un taux de victoire de 58%. Analyse complète des top decks.",
    excerptEn: "Emberheart Control dominates the rankings this week with a 58% win rate. Full analysis of top decks.",
    contentFr: "Cette semaine, la méta est dominée par les decks de contrôle basés sur Ignis. Le deck Emberheart Control affiche un impressionnant taux de victoire de 58% sur l'échelle du classement.\n\n## Top 3 de la semaine\n\n1. **Emberheart Control** (58% WR)\n2. **Duskblade Aggro** (54% WR)\n3. **Tide Oracle Combo** (51% WR)\n\nLe deck Chainbreaker Midrange reste une option viable contre le méta actuel grâce à sa capacité à détruire les équipements ennemis.",
    contentEn: "This week, the meta is dominated by control decks based on Ignis. The Emberheart Control deck shows an impressive 58% win rate across the ranking ladder.\n\n## Top 3 This Week\n\n1. **Emberheart Control** (58% WR)\n2. **Duskblade Aggro** (54% WR)\n3. **Tide Oracle Combo** (51% WR)\n\nThe Chainbreaker Midrange deck remains a viable option against the current meta due to its ability to destroy enemy gear.",
    coverImage: null,
    category: "META",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    author: { username: "RiftboundTeam", avatarUrl: null },
  },
  {
    id: "post-4",
    slug: "tournoi-rift-masters-saison-2",
    titleFr: "Rift Masters Saison 2 — Inscriptions ouvertes",
    titleEn: "Rift Masters Season 2 — Registrations Open",
    excerptFr: "Le plus grand tournoi Riftbound revient ! 256 joueurs, 10 000€ de cashprize. Inscriptions jusqu'au 30 juin.",
    excerptEn: "The biggest Riftbound tournament is back! 256 players, €10,000 prize pool. Register until June 30th.",
    contentFr: "Les Rift Masters reviennent pour une deuxième saison encore plus ambitieuse.\n\n## Informations clés\n\n- **Date** : 15-17 juillet 2026\n- **Format** : Standard, Bo3\n- **Places** : 256 joueurs\n- **Cashprize** : 10 000€\n- **Inscriptions** : Ouvertes jusqu'au 30 juin\n\nLes phases de qualification en ligne commencent le 1er juillet. Les 32 meilleurs joueurs s'affronteront lors des finales en présentiel à Paris.",
    contentEn: "The Rift Masters are back for an even more ambitious second season.\n\n## Key Information\n\n- **Date**: July 15-17, 2026\n- **Format**: Standard, Bo3\n- **Slots**: 256 players\n- **Prize Pool**: €10,000\n- **Registration**: Open until June 30th\n\nOnline qualification phases begin July 1st. The top 32 players will compete in the in-person finals in Paris.",
    coverImage: null,
    category: "TOURNAMENT",
    publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    author: { username: "RiftboundTeam", avatarUrl: null },
  },
  {
    id: "post-5",
    slug: "extension-braises-de-guerre-reveal",
    titleFr: "Braises de Guerre — Toutes les cartes révélées",
    titleEn: "War Embers — All Cards Revealed",
    excerptFr: "Découvrez l'intégralité des 12 cartes de la nouvelle extension, incluant le champion légendaire Ignis.",
    excerptEn: "Discover all 12 cards from the new expansion, including the legendary champion Ignis.",
    contentFr: "L'extension Braises de Guerre est la troisième extension de Riftbound et introduit 12 nouvelles cartes centrées sur le thème du feu et de la forge.\n\nLe champion phare de cette extension est **Ignis, Cœur de Braise**, un champion légendaire à 8 cristaux qui réduit le coût de vos sorts de feu et inflige des dégâts constants au héros ennemi.\n\nParmi les autres cartes notables : la Pyromancienne Aguerrie, le Béhémoth Magmatique, et le dévastateur Embrasement Final.",
    contentEn: "The War Embers expansion is Riftbound's third set and introduces 12 new cards centered around the themes of fire and forging.\n\nThe flagship champion is **Ignis, Emberheart**, a legendary 8-crystal champion that reduces the cost of your fire spells and deals constant damage to the enemy hero.\n\nOther notable cards include the Seasoned Pyromancer, the Magma Behemoth, and the devastating Final Conflagration.",
    coverImage: null,
    category: "NEWS",
    publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    author: { username: "RiftboundTeam", avatarUrl: null },
  },
];

function localize(
  post: (typeof DEMO_POSTS)[number],
  locale: SupportedLocale
): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: locale === "fr" ? post.titleFr : post.titleEn,
    excerpt: locale === "fr" ? post.excerptFr : post.excerptEn,
    content: locale === "fr" ? post.contentFr : post.contentEn,
    coverImage: post.coverImage,
    category: post.category,
    publishedAt: post.publishedAt,
    author: post.author,
  };
}

export async function getPosts(
  locale: SupportedLocale,
  filters: { category?: string; page?: number; perPage?: number }
): Promise<PaginatedResponse<BlogPost>> {
  const page = Math.max(filters.page ?? 1, 1);
  const perPage = Math.min(Math.max(filters.perPage ?? 12, 1), 50);

  if (!isDatabaseConfigured()) {
    let posts = DEMO_POSTS.map((p) => localize(p, locale));
    if (filters.category) {
      posts = posts.filter((p) => p.category === filters.category);
    }
    posts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const start = (page - 1) * perPage;
    return {
      data: posts.slice(start, start + perPage),
      total: posts.length,
      page,
      perPage,
      totalPages: Math.ceil(posts.length / perPage),
    };
  }

  const titleField = locale === "fr" ? "titleFr" : "titleEn";
  const excerptField = locale === "fr" ? "excerptFr" : "excerptEn";
  const contentField = locale === "fr" ? "contentFr" : "contentEn";

  const where = {
    isPublished: true,
    ...(filters.category && { category: filters.category as never }),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { author: { select: { username: true, avatarUrl: true } } },
    }),
  ]);

  return {
    data: posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p[titleField] as string,
      excerpt: (p[excerptField] as string) ?? null,
      content: p[contentField] as string,
      coverImage: p.coverImage,
      category: p.category,
      publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
      author: { username: p.author.username, avatarUrl: p.author.avatarUrl },
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getPostBySlug(
  slug: string,
  locale: SupportedLocale
): Promise<BlogPost | null> {
  if (!isDatabaseConfigured()) {
    const post = DEMO_POSTS.find((p) => p.slug === slug);
    return post ? localize(post, locale) : null;
  }

  const p = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { username: true, avatarUrl: true } } },
  });
  if (!p || !p.isPublished) return null;

  const titleField = locale === "fr" ? "titleFr" : "titleEn";
  const contentField = locale === "fr" ? "contentFr" : "contentEn";
  const excerptField = locale === "fr" ? "excerptFr" : "excerptEn";

  return {
    id: p.id,
    slug: p.slug,
    title: p[titleField] as string,
    excerpt: (p[excerptField] as string) ?? null,
    content: p[contentField] as string,
    coverImage: p.coverImage,
    category: p.category,
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
    author: { username: p.author.username, avatarUrl: p.author.avatarUrl },
  };
}
