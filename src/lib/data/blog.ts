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
    contentFr: `Bienvenue dans Riftbound, le jeu de cartes à collectionner de Riot Games dans l'univers de League of Legends. Ce guide vous explique pas à pas tout ce qu'il faut savoir pour comprendre les règles et jouer votre première partie en confiance.

## Le but du jeu

Riftbound est un jeu d'affrontement territorial. Vous ne cherchez pas à réduire des points de vie : vous luttez pour le contrôle de zones appelées champs de bataille. Conquérir et tenir un champ de bataille rapporte des points, et le premier joueur à atteindre 8 points de victoire (11 en partie par équipes) gagne.

Subtilité importante : le point qui vous fait gagner doit venir d'un champ de bataille tenu ou conquis ce tour-là — sinon vous piochez simplement une carte au lieu de l'emporter.

## Ce qu'il vous faut pour jouer

Un deck Riftbound complet ne se limite pas à un paquet de cartes. Chaque joueur prépare :

- Une Légende : votre champion. Elle ne fait pas partie de vos 40 cartes : elle reste dans sa propre zone, définit les deux domaines (couleurs) de votre deck et offre une capacité passive ou activée. Elle ne combat pas.
- Une Unité Champion : la version « unité » de votre Légende. Une copie démarre la partie en jeu, à côté de la Légende, et combat comme n'importe quelle unité.
- Un deck principal de 40 cartes exactement : vos unités, sorts et équipements, tous dans les domaines de votre Légende (votre Unité Champion en fait partie).
- Un deck de runes de 12 runes : votre réserve de ressources.
- 3 champs de bataille : en duel, vous n'en présentez qu'un seul, tiré au hasard parmi vos trois.

Règle de construction clé : au maximum 3 exemplaires d'une carte portant le même nom. Deux versions au sous-titre différent comptent comme deux noms distincts.

## Les six domaines

Chaque carte appartient à un ou plusieurs des six domaines, et votre Légende en fixe deux : ce sont les seules couleurs que votre deck peut jouer.

- Fury : l'agression, les dégâts directs et la vitesse.
- Body : la force brute, les grosses unités et la résistance.
- Mind : la réflexion, la pioche et la manipulation des cartes.
- Calm : la patience, le contrôle et la temporisation.
- Order : la structure, la coopération et les effets durables.
- Chaos : l'imprévu, le sacrifice et les effets explosifs.

## Les types de cartes

- Unité : se déploie sur les champs de bataille pour les conquérir et combattre.
- Sort : un effet ponctuel que vous jouez puis défaussez.
- Équipement : s'attache à une unité pour la renforcer durablement.
- Rune : votre ressource ; elle alimente l'énergie et la puissance.
- Légende : votre champion, dans sa propre zone, en dehors du deck de 40 cartes.
- Champ de bataille : la zone que les unités se disputent pour marquer des points.

## L'énergie, la puissance et les runes

Riftbound utilise deux ressources, toutes deux issues de vos runes :

- L'énergie (générique) : épuisez une rune pour ajouter 1 énergie à votre réserve du tour. Elle paie le coût total d'une carte.
- La puissance (de domaine) : recyclez une rune — elle repart sous le deck de runes — pour ajouter 1 puissance de son domaine. Elle paie les exigences de couleur (Fury, Calm, etc.).

À chaque tour, vous canalisez une rune : la carte du dessus de votre deck de runes entre en jeu. Comme les runes recyclées reviennent plus tard, votre deck de runes tourne en continu — maîtriser ce cycle, c'est maîtriser votre tempo.

## Le déroulement d'un tour

Riftbound se joue par actions alternées plutôt qu'en longs tours séparés. Chacun votre tour, vous réalisez une action puis rendez la main :

1. Canalisez une rune, puis épuisez ou recyclez vos runes pour produire énergie et puissance.
2. Jouez des cartes : déployez des unités, lancez des sorts, équipez vos unités.
3. Déplacez vos unités vers les champs de bataille pour les conquérir.
4. Réagissez : certaines cartes se jouent pendant le tour adverse, en réaction.

Quand les deux joueurs passent l'un après l'autre, on résout les affrontements puis le score.

## Combat et affrontements

Lorsque des unités des deux camps se retrouvent sur le même champ de bataille, un affrontement a lieu. Les unités comparent leur puissance ; celle qui ne survit pas est vaincue. S'il ne reste plus d'unité adverse sur la zone après le combat, vous la conquérez et marquez aussitôt un point.

Bien choisir le moment d'un affrontement — avec le soutien d'un sort, ou en supériorité numérique — fait souvent toute la différence.

## Marquer des points et gagner

Conquérir un champ de bataille rapporte un point immédiat ; le tenir tour après tour continue d'en rapporter. Le premier à 8 points de victoire l'emporte (11 par équipes), à condition que le point décisif vienne bien d'un champ de bataille.

Cela crée une tension permanente : faut-il tout engager pour conquérir maintenant, ou défendre et préparer un meilleur tour ? Lire le terrain est aussi important que jouer de bonnes cartes.

## Construire son premier deck

- Choisissez d'abord votre Légende : elle fixe vos deux domaines et votre Unité Champion.
- Remplissez 40 cartes exactement, uniquement dans ces domaines, avec au plus 3 exemplaires par nom.
- Soignez votre courbe : assez de cartes bon marché pour agir tôt, quelques cartes fortes pour finir.
- Équilibrez unités, sorts et équipements ; un deck sans unités ne tient aucun terrain.
- N'oubliez pas vos 12 runes et vos 3 champs de bataille, en dehors du deck principal.

Notre constructeur de deck vous aide à monter le deck principal de 40 cartes : il affiche la courbe d'énergie et le total en direct. Une fois prêt, publiez votre deck ou exportez-le pour le garder.

## Conseils pour débuter

- Tenez le terrain : marquer un point régulièrement vaut mieux qu'un grand coup risqué.
- Ne videz pas votre main trop vite ; gardez une réaction pour surprendre l'adversaire.
- Surveillez les runes et l'énergie disponibles en face pour anticiper ses sorts.
- Rejouez vos parties : comprendre pourquoi on perd fait progresser plus vite que gagner par hasard.

## Lexique express

- Légende : votre champion, hors du deck, qui fixe vos deux domaines.
- Unité Champion : la version unité de votre Légende, en jeu dès le départ.
- Domaine : la couleur d'une carte (Fury, Body, Mind, Calm, Order, Chaos).
- Rune : ressource ; canalisez pour la mettre en jeu, épuisez pour l'énergie, recyclez pour la puissance.
- Énergie / Puissance : ressource générique / de domaine pour payer vos cartes.
- Champ de bataille : zone à conquérir pour marquer des points.
- Affrontement : combat entre unités sur un champ de bataille.

Vous en savez maintenant assez pour lancer votre première partie. Parcourez la base de cartes, montez votre deck principal dans le constructeur, et lancez-vous : c'est en jouant que tout devient limpide. Bon jeu sur la Faille !`,
    contentEn: `Welcome to Riftbound, Riot Games' trading card game set in the world of League of Legends. This guide walks you through everything you need to understand the rules and play your first game with confidence.

## The goal of the game

Riftbound is a game about controlling territory. You are not lowering a life total: you fight for control of zones called battlefields. Conquering and holding a battlefield scores points, and the first player to reach 8 victory points (11 in a team game) wins.

One important nuance: the point that wins you the game must come from a battlefield you hold or conquer that turn — otherwise you simply draw a card instead of winning.

## What you need to play

A complete Riftbound deck is more than a stack of cards. Each player prepares:

- A Legend: your champion. It is not part of your 40 cards: it sits in its own zone, defines your deck's two domains (colours) and grants a passive or activated ability. It does not fight.
- A Champion Unit: the "unit" version of your Legend. One copy starts the game in play next to the Legend and fights like any other unit.
- A 40-card main deck, exactly: your units, spells and gear, all within your Legend's domains (your Champion Unit is part of it).
- A 12-rune rune deck: your resource pool.
- 3 battlefields: in a duel you present only one, drawn at random from your three.

Key building rule: at most 3 copies of a card with the same name. Two versions with different subtitles count as different names.

## The six domains

Every card belongs to one or more of the six domains, and your Legend fixes two of them — those are the only colours your deck may play.

- Fury: aggression, direct damage and speed.
- Body: raw strength, big units and resilience.
- Mind: thinking ahead, card draw and manipulation.
- Calm: patience, control and stalling.
- Order: structure, cooperation and lasting effects.
- Chaos: the unexpected, sacrifice and explosive effects.

## Card types

- Unit: deploys onto battlefields to conquer them and fight.
- Spell: a one-off effect you play and then discard.
- Gear: attaches to a unit to strengthen it for the long run.
- Rune: your resource; it powers both energy and power.
- Legend: your champion, in its own zone, outside the 40-card deck.
- Battlefield: the zone units fight over to score points.

## Energy, power and runes

Riftbound uses two resources, both produced by your runes:

- Energy (generic): exhaust a rune to add 1 energy to your pool for the turn. It pays a card's total cost.
- Power (by domain): recycle a rune — it goes to the bottom of the rune deck — to add 1 power of its domain. It pays colour requirements (Fury, Calm, and so on).

Each turn you channel a rune: the top card of your rune deck enters play. Because recycled runes come back later, your rune deck cycles continuously — mastering that cycle is mastering your tempo.

## How a turn flows

Riftbound is played with alternating actions rather than long separate turns. On your turn, you take one action and then pass back:

1. Channel a rune, then exhaust or recycle runes to produce energy and power.
2. Play cards: deploy units, cast spells, equip your units.
3. Move your units toward battlefields to conquer them.
4. React: some cards are played during the opponent's turn, as a response.

When both players pass one after the other, combats resolve and then scoring happens.

## Combat and showdowns

When units from both sides meet on the same battlefield, a showdown takes place. Units compare their power; the one that does not survive is defeated. If no enemy unit remains on the zone after combat, you conquer it and immediately score a point.

Choosing when to start a showdown — backed by a spell, or with a numbers advantage — often makes all the difference.

## Scoring points and winning

Conquering a battlefield scores an immediate point; holding it turn after turn keeps scoring. The first player to 8 victory points wins (11 in a team game), as long as the deciding point comes from a battlefield.

This creates constant tension: do you commit everything to conquer now, or defend and set up a better turn? Reading the board is as important as playing good cards.

## Building your first deck

- Pick your Legend first: it sets your two domains and your Champion Unit.
- Fill exactly 40 cards, only in those domains, with at most 3 copies per name.
- Mind your curve: enough cheap cards to act early, a few strong cards to close.
- Balance units, spells and gear; a deck with no units holds no ground.
- Don't forget your 12 runes and 3 battlefields, kept outside the main deck.

Our deck builder helps you assemble the 40-card main deck: it shows the energy curve and total live. Once it's ready, publish your deck or export it to keep.

## Beginner tips

- Hold the ground: scoring steadily beats one risky swing.
- Don't empty your hand too fast; keep a reaction to surprise your opponent.
- Watch the runes and energy available across the table to anticipate their spells.
- Replay your games: understanding why you lost improves you faster than winning by luck.

## Quick glossary

- Legend: your champion, outside the deck, who sets your two domains.
- Champion Unit: the unit version of your Legend, in play from the start.
- Domain: a card's colour (Fury, Body, Mind, Calm, Order, Chaos).
- Rune: resource; channel to put it in play, exhaust for energy, recycle for power.
- Energy / Power: generic / domain resource used to pay for cards.
- Battlefield: a zone to conquer in order to score points.
- Showdown: combat between units on a battlefield.

You now know enough to start your first game. Browse the card database, build your main deck in the builder, and dive in: it all clicks once you start playing. Have fun on the Rift!`,
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
