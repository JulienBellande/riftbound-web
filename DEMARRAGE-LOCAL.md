# Démarrage en local — Riftbound Web

Note pour récupérer ce projet et le lancer sur ta machine.

> Cette archive contient **tout le code source** du projet. Elle **n'inclut pas**
> `node_modules/` (régénéré par `npm install`), ni `.next/` (build), ni `.git/`.

## Prérequis

- **Node.js ≥ 20** et **npm** ([nodejs.org](https://nodejs.org/)).
- Rien d'autre : par défaut le site tourne en **mode démo** (dataset embarqué),
  sans base de données ni clés API.

## 1. Décompresser l'archive

```bash
unzip riftbound-web.zip       # ou clic droit → Extraire
cd riftbound-web
```

## 2. Installer les dépendances

```bash
npm install
```

> `postinstall` lance automatiquement `prisma generate` (génération du client) —
> c'est normal, aucune base de données n'est requise à cette étape.

## 3. Lancer le serveur de développement

```bash
npm run dev
```

Puis ouvrir **http://localhost:3000**. Le site est bilingue : `/fr` et `/en`.

Sans configuration, tout fonctionne en **mode démo** : 36 cartes d'exemple,
3 extensions, prix avec historique. Aucune base de données requise.

## (Optionnel) Brancher une vraie base Supabase

```bash
cp .env.example .env     # puis renseigner DATABASE_URL, clés Supabase / Stripe
npm run db:migrate       # applique prisma/migrations
npm run db:seed          # importe le dataset d'exemple
```

La couche de données (`src/lib/data/cards.ts`) bascule automatiquement de la
démo vers PostgreSQL dès que `DATABASE_URL` pointe vers une instance `postgres://`.

## (Optionnel) Rafraîchir les prix réels des cartes

```bash
npm run refresh-prices
```

Récupère les vrais prix TCGplayer (via TCGCSV) et met à jour
`src/lib/data/riftbound-cards.json`. Détails, prérequis réseau et dépannage :
voir **[docs/refresh-prices.md](docs/refresh-prices.md)**.

## Scripts utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (http://localhost:3000) |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migrations Prisma |
| `npm run db:seed` | Seed du dataset d'exemple |
| `npm run db:studio` | Explorateur de base Prisma |
| `npm run refresh-prices` | Rafraîchit les prix (TCGplayer via TCGCSV) |

Pour plus de détails sur l'architecture, voir le **[README.md](README.md)**.
