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
    id: "post-guide-jouer-riftbound",
    slug: "guide-complet-jouer-a-riftbound",
    titleFr: "Guide complet : comprendre et jouer à Riftbound",
    titleEn: "Complete Guide: Understanding and Playing Riftbound",
    excerptFr:
      "Le but du jeu, les domaines, l'énergie, le déroulement d'un tour, le combat et la victoire : tout ce qu'il faut pour lancer votre première partie en confiance.",
    excerptEn:
      "The goal, the domains, energy, how a turn flows, combat and winning: everything you need to start your first game with confidence.",
    contentFr: `Bienvenue dans Riftbound, le jeu de cartes à collectionner de Riot Games situé dans l'univers de League of Legends. Ce guide vous explique pas à pas tout ce qu'il faut savoir pour comprendre les règles et jouer votre première partie en confiance.

## Le but du jeu

Riftbound est un jeu d'affrontement territorial. Vous ne cherchez pas seulement à détruire les unités adverses : vous luttez pour le contrôle de zones appelées champs de bataille. Tenir un champ de bataille vous rapporte des points, et le premier joueur à atteindre 8 points remporte la partie.

Tout le reste — vos unités, vos sorts, votre énergie — sert ce seul objectif : conquérir et tenir le terrain plus longtemps que l'adversaire.

## Ce qu'il vous faut pour jouer

Avant la partie, chaque joueur prépare quatre éléments :

- Une Légende : la carte qui représente votre champion et donne son identité à votre deck.
- Un deck principal : vos unités, sorts et équipements (autour de 40 cartes).
- Un deck de runes : les runes qui produisent votre énergie tout au long de la partie.
- Des champs de bataille : les lieux que vous allez disputer.

En construction libre, on limite en général chaque carte à 3 exemplaires pour garder des decks équilibrés.

## Les six domaines

Chaque carte appartient à un ou plusieurs des six domaines. Ils définissent l'ambiance et les forces de votre deck :

- Fury : l'agression, les dégâts directs et la vitesse.
- Body : la force brute, les grosses unités et la résistance.
- Mind : la réflexion, la pioche et la manipulation des cartes.
- Calm : la patience, le contrôle et la temporisation.
- Order : la structure, la coopération et les effets durables.
- Chaos : l'imprévu, le sacrifice et les effets explosifs.

La plupart des decks se concentrent sur un ou deux domaines pour rester cohérents et fiables.

## Les types de cartes

- Unité : se déploie sur les champs de bataille pour les conquérir et combattre.
- Sort : un effet ponctuel que vous jouez puis défaussez.
- Équipement : s'attache à une unité pour la renforcer durablement.
- Rune : votre ressource ; elle génère l'énergie nécessaire pour jouer vos cartes.
- Légende : votre champion, présent dès le début de la partie.
- Champ de bataille : la zone que les unités se disputent pour marquer des points.

## L'énergie et les runes

Pour jouer une carte, vous payez son coût avec de l'énergie. Cette énergie provient de vos runes : à chaque tour, vous canalisez des runes depuis votre deck de runes pour produire de l'énergie générique et de la puissance de domaine.

Deux notions à retenir :

- L'énergie générique paie le coût total d'une carte.
- La puissance de domaine (Fury, Calm, etc.) débloque les cartes qui exigent un domaine précis.

Gérer ses runes, c'est gérer son tempo : trop peu d'énergie et vous subissez le jeu adverse, trop de runes et vous manquez de cartes utiles.

## Le déroulement d'un tour

Riftbound se joue par actions alternées plutôt qu'en longs tours séparés. Chacun votre tour, vous réalisez une action puis rendez la main :

1. Canalisez une rune pour disposer d'énergie.
2. Jouez des cartes : déployez des unités, lancez des sorts, équipez vos unités.
3. Déplacez vos unités vers les champs de bataille pour les conquérir.
4. Réagissez : certaines cartes se jouent pendant le tour adverse, en réaction.

Quand les deux joueurs passent l'un après l'autre, on résout les affrontements puis le score.

## Combat et affrontements

Lorsque des unités des deux camps se retrouvent sur le même champ de bataille, un affrontement a lieu. Les unités comparent leur puissance ; celle qui ne survit pas est vaincue, et le camp qui reste prend le contrôle de la zone.

Bien choisir le moment d'un affrontement — avec le soutien d'un sort, ou en supériorité numérique — fait souvent toute la différence.

## Marquer des points et gagner

À la résolution, chaque champ de bataille que vous contrôlez sans opposition vous rapporte des points. Le premier joueur à 8 points gagne.

Cela crée une tension permanente : faut-il tout engager pour conquérir maintenant, ou défendre et préparer un meilleur tour ? Lire le terrain est aussi important que jouer de bonnes cartes.

## Construire son premier deck

Quelques principes simples pour un deck solide :

- Choisissez une Légende et un ou deux domaines, puis des cartes qui vont dans le même sens.
- Soignez votre courbe : assez de cartes bon marché pour agir tôt, quelques cartes fortes pour finir.
- Visez la cohérence : plusieurs exemplaires de vos meilleures cartes pour les piocher régulièrement.
- Équilibrez unités, sorts et équipements ; un deck sans unités ne tient aucun terrain.

Notre constructeur de deck affiche en direct la courbe d'énergie et le total de cartes : utilisez-le pour tester vos idées, puis publiez votre deck ou exportez-le pour le garder.

## Conseils pour débuter

- Tenez le terrain : marquer un point régulièrement vaut mieux qu'un grand coup risqué.
- Ne videz pas votre main trop vite ; gardez une réaction pour surprendre l'adversaire.
- Surveillez l'énergie disponible en face pour anticiper ses sorts.
- Rejouez vos parties : comprendre pourquoi on perd fait progresser plus vite que gagner par hasard.

## Lexique express

- Légende : votre champion, l'identité de votre deck.
- Domaine : la couleur d'une carte (Fury, Body, Mind, Calm, Order, Chaos).
- Énergie : la ressource qui paie vos cartes, produite par les runes.
- Champ de bataille : zone à conquérir pour marquer des points.
- Affrontement : combat entre unités sur un champ de bataille.
- Tempo : l'avance prise en jouant plus efficacement que l'adversaire.

Vous en savez maintenant assez pour lancer votre première partie. Parcourez la base de cartes, montez un deck dans le constructeur, et lancez-vous : c'est en jouant que tout devient limpide. Bon jeu sur la Faille !`,
    contentEn: `Welcome to Riftbound, Riot Games' trading card game set in the world of League of Legends. This guide walks you through everything you need to understand the rules and play your first game with confidence.

## The goal of the game

Riftbound is a game about controlling territory. You are not simply trying to destroy your opponent's units: you fight for control of zones called battlefields. Holding a battlefield scores you points, and the first player to reach 8 points wins the game.

Everything else — your units, your spells, your energy — serves that single goal: conquer and hold ground longer than your opponent.

## What you need to play

Before the game, each player prepares four things:

- A Legend: the card that represents your champion and defines your deck's identity.
- A main deck: your units, spells and gear (around 40 cards).
- A rune deck: the runes that produce your energy throughout the game.
- Battlefields: the locations you will fight over.

In constructed play, cards are usually limited to 3 copies each to keep decks balanced.

## The six domains

Every card belongs to one or more of the six domains. They define the mood and strengths of your deck:

- Fury: aggression, direct damage and speed.
- Body: raw strength, big units and resilience.
- Mind: thinking ahead, card draw and manipulation.
- Calm: patience, control and stalling.
- Order: structure, cooperation and lasting effects.
- Chaos: the unexpected, sacrifice and explosive effects.

Most decks focus on one or two domains to stay consistent and reliable.

## Card types

- Unit: deploys onto battlefields to conquer them and fight.
- Spell: a one-off effect you play and then discard.
- Gear: attaches to a unit to strengthen it for the long run.
- Rune: your resource; it generates the energy needed to play cards.
- Legend: your champion, present from the start of the game.
- Battlefield: the zone units fight over to score points.

## Energy and runes

To play a card, you pay its cost with energy. That energy comes from your runes: each turn you channel runes from your rune deck to produce generic energy and domain power.

Two ideas to remember:

- Generic energy pays a card's total cost.
- Domain power (Fury, Calm, and so on) unlocks cards that require a specific domain.

Managing your runes means managing your tempo: too little energy and you fall behind, too many runes and you run short on useful cards.

## How a turn flows

Riftbound is played with alternating actions rather than long separate turns. On your turn, you take one action and then pass back:

1. Channel a rune to gain energy.
2. Play cards: deploy units, cast spells, equip your units.
3. Move your units toward battlefields to conquer them.
4. React: some cards are played during the opponent's turn, as a response.

When both players pass one after the other, combats resolve and then scoring happens.

## Combat and showdowns

When units from both sides meet on the same battlefield, a showdown takes place. Units compare their power; the one that does not survive is defeated, and the side that remains takes control of the zone.

Choosing when to start a showdown — backed by a spell, or with a numbers advantage — often makes all the difference.

## Scoring points and winning

At resolution, every battlefield you control unopposed scores you points. The first player to 8 points wins.

This creates constant tension: do you commit everything to conquer now, or defend and set up a better turn? Reading the board is as important as playing good cards.

## Building your first deck

A few simple principles for a solid deck:

- Pick a Legend and one or two domains, then cards that pull in the same direction.
- Mind your curve: enough cheap cards to act early, a few strong cards to close.
- Aim for consistency: several copies of your best cards so you draw them often.
- Balance units, spells and gear; a deck with no units holds no ground.

Our deck builder shows the energy curve and total card count live: use it to test ideas, then publish your deck or export it to keep.

## Beginner tips

- Hold the ground: scoring steadily beats one risky swing.
- Don't empty your hand too fast; keep a reaction to surprise your opponent.
- Watch the energy available across the table to anticipate their spells.
- Replay your games: understanding why you lost improves you faster than winning by luck.

## Quick glossary

- Legend: your champion, your deck's identity.
- Domain: a card's colour (Fury, Body, Mind, Calm, Order, Chaos).
- Energy: the resource that pays for your cards, produced by runes.
- Battlefield: a zone to conquer in order to score points.
- Showdown: combat between units on a battlefield.
- Tempo: the lead you gain by playing more efficiently than your opponent.

You now know enough to start your first game. Browse the card database, build a deck in the builder, and dive in: it all clicks once you start playing. Have fun on the Rift!`,
    coverImage: null,
    category: "GUIDE",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    author: { username: "RiftForge", avatarUrl: null },
  },
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
    author: { username: "RiftForge", avatarUrl: null },
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
    author: { username: "RiftForge", avatarUrl: null },
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
    author: { username: "RiftForge", avatarUrl: null },
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
