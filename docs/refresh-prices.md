# Rafraîchir les prix (refresh-prices)

Comment régénérer les prix réels des cartes en local.

> Récupère les vrais prix **TCGplayer** depuis [TCGCSV](https://tcgcsv.com/)
> (miroir gratuit, sans authentification) et réécrit le dataset embarqué
> `src/lib/data/riftbound-cards.json`.

## Ce que fait le script

`scripts/refresh-prices.ts` (lancé via `npm run refresh-prices`) :

1. Interroge TCGCSV pour indexer **tous** les produits Riftbound et leurs prix
   (`marketUsd` et `lowUsd`).
2. Pour chaque carte du dataset, fait un lookup par couple **(extension, nom)** —
   les suffixes `(Overnumbered)` / `(Signature)` / `(Alternate Art)` sont gérés,
   donc chaque impression reçoit son propre prix réel (aucun premium fabriqué).
3. Réécrit `src/lib/data/riftbound-cards.json` sur place. Les cartes non
   matchées conservent leur valeur précédente et sont listées en fin de run.

> Le même fetch alimente, en prod, le cron quotidien
> `src/app/api/cron/update-prices/route.ts` (Vercel Cron) qui historise les prix
> en base. Ce cron a donc besoin du même accès réseau côté hébergeur.

## Prérequis

- **Node.js ≥ 20** et npm.
- **Accès réseau à `tcgcsv.com`** depuis la machine qui lance le script.
- **Aucune variable d'environnement ni base de données** n'est nécessaire :
  le script lit/écrit seulement le fichier JSON. (Pas besoin de `.env`.)

## Lancer en local

```bash
# 1. Installer les dépendances (fournit tsx + génère le client Prisma)
npm install

# 2. Rafraîchir les prix
npm run refresh-prices
```

Sortie attendue :

```
Fetching real TCGplayer prices from TCGCSV …
Indexed <N> priced products.

✓ Updated prices for <M> cards (<K> unmatched).
```

## Vérifier et committer

```bash
# Voir l'ampleur du changement (le JSON est minifié sur une ligne)
git diff --stat src/lib/data/riftbound-cards.json

git add src/lib/data/riftbound-cards.json
git commit -m "chore: refresh card prices from TCGCSV"
git push
```

## Dépannage

| Symptôme | Cause / solution |
|----------|------------------|
| `sh: 1: tsx: not found` | Dépendances non installées → `npm install`. |
| `TCGCSV 403 Forbidden … Host not in allowlist: tcgcsv.com` | L'accès sortant est bloqué (voir ci-dessous). |
| `Riftbound category not found on TCGCSV` | TCGCSV n'expose pas (encore) la catégorie, ou la réponse a changé. Réessayer plus tard. |
| Beaucoup de cartes `unmatched` | Écarts de nommage entre le dataset et TCGCSV : les cartes concernées gardent leur ancien prix (non bloquant). |

### Cas Claude Code on the web

Dans l'environnement cloud, l'egress réseau est restreint et `tcgcsv.com` n'est
pas autorisé par défaut → le script échoue avec un **403 `host_not_allowed`**.

Pour l'autoriser : éditer l'environnement (icône nuage → engrenage),
**Network access → Custom**, puis ajouter dans **Allowed domains** :

```
tcgcsv.com
```

Cocher **« Also include default list of common package managers »** pour garder
l'accès à npm. Démarrer ensuite une **nouvelle** session (la politique réseau
n'est pas réappliquée à une session déjà ouverte).

Doc réseau : <https://code.claude.com/docs/en/claude-code-on-the-web>

Alternative : lancer le refresh **en local** (où `tcgcsv.com` est joignable),
puis committer/pusher le `riftbound-cards.json` régénéré.
