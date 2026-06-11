# Riftbound Web

Plateforme de référence pour le jeu de cartes **Riftbound** : base de données de cartes, cotes multi-devises, construction de decks communautaire, blog, forum et boutique.

> The reference platform for the Riftbound card game: card database, multi-currency prices, community deck building, blog, forum and shop. Bilingual FR/EN.

## Stack

- **Next.js 16** (App Router, React Server Components) + TypeScript
- **Tailwind CSS 4**
- **Supabase** — PostgreSQL, Auth, Storage
- **Prisma 7** — ORM (driver adapter `@prisma/adapter-pg`)
- **next-intl** — i18n FR/EN avec pathnames localisés (`/fr/cartes` ↔ `/en/cards`)
- **Stripe** — paiements boutique
- **Zustand** — état client (panier, deck builder)
- **@dnd-kit** — drag-and-drop du deck builder

## Démarrage rapide

```bash
npm install
npm run dev
```

Sans configuration, le site tourne en **mode démo** : un dataset d'exemple embarqué (36 cartes, 3 extensions, prix avec historique) alimente toutes les pages. Aucune base de données requise.

## Connexion à une vraie base (Supabase)

1. Copier `.env.example` vers `.env` et renseigner :
   - `DATABASE_URL` — chaîne de connexion PostgreSQL Supabase
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Clés Stripe pour la boutique
2. Appliquer le schéma et peupler :

```bash
npm run db:migrate   # applique prisma/migrations
npm run db:seed      # importe le dataset d'exemple
```

La couche de données (`src/lib/data/cards.ts`) bascule automatiquement de la démo vers PostgreSQL dès que `DATABASE_URL` pointe vers une instance `postgres://`.

## Structure

```
src/
├── app/
│   ├── [locale]/(main)/      # Pages publiques (cartes, decks, prix, shop, blog, forum)
│   │   └── cards/[id]/       # Fiche carte détaillée
│   └── api/                  # Route handlers (cards, decks, votes, prices, stripe)
├── components/               # UI par domaine (cards/, layout/, ui/)
├── i18n/                     # Config next-intl + pathnames localisés
├── lib/
│   ├── data/                 # Couche d'accès aux données (Prisma ⇄ démo)
│   ├── supabase/             # Clients browser/server/middleware
│   └── stripe/
├── stores/                   # Zustand (cart, deck-builder)
└── types/

prisma/
├── schema.prisma             # Schéma complet (12 modèles)
├── migrations/0001_init/     # SQL initial (utilisable tel quel sur Supabase)
└── seed.ts
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run db:migrate` | Migrations Prisma |
| `npm run db:seed` | Seed du dataset d'exemple |
| `npm run db:studio` | Interface d'exploration de la base |
