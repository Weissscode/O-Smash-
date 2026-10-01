# Vice Go — Audit de l'existant (phase 0)

Audit réalisé avant toute modification, sur la branche `claude/ecstatic-hopper-qvexwj` (identique à `main` au
moment de l'audit, arbre de travail propre, dépôt `Weissscode/O-Smash-`).

## 1. Ce qui existe

**Un seul dépôt, un seul projet Vercel (`o-smash`), une seule application Vite + React 18 en JavaScript.**
Caisse et dashboard sont le même build, routé par l'URL (`src/main.jsx`) :

| Route | Rôle |
| --- | --- |
| `/` | Caisse (`src/App.jsx`) |
| `/gestion` | Dashboard gérant (`ManagerDash.jsx`) |
| `/scan`, `/gestion/scan` | Scan fidélité (téléphone du staff) |
| `/r/:slug/fidelite` | Inscription fidélité publique |
| `/api/*` | Fonctions Vercel : `register-customer`, `loyalty-restaurant`, `wallet-pass` (Apple Wallet) |

`server.js` : serveur d'impression local (LAN du restaurant), écoute `orders.print_request` en Realtime pour un
seul `RESTAURANT_ID` ; IP des imprimantes et adresse O'SMASH codées en dur.

**Supabase** (`supabase/schema.sql` + migrations 002 → 007) : `restaurants`, `profiles` (staff, rôles
`gerant`/`staff`), `products` (inutilisée), `orders` (articles en JSONB), `product_stock`, `order_counters`,
`loyalty_tiers`, `customers`, `loyalty_cards`, `loyalty_card_events`, `rewards`, `loyalty_transactions`,
`customer_rewards`. RLS par `current_restaurant_id()` (lu dans `profiles`). Numéro de commande atomique
(`next_order_num`, réservé au staff). Realtime sur `orders`.

**Fidélité** : par restaurant, client identifié par téléphone, ledger `loyalty_transactions` + solde en cache,
cartes QR/NFC, Apple Wallet.

**Visuel** : Anton, Roboto, Permanent Marker ; palette caisse neutre ; photos produits détourées dans `public/`.

Absents : Stripe, notifications push, TypeScript, types Supabase générés.

## 2. Bloquants pour Vice Go

1. **Catalogue codé en dur** dans `src/data/products.js`, propre à O'SMASH (formules et personnalisations
   codées dans des composants dédiés). Table `products` inutilisée, produits « divers » en `localStorage`,
   aucun allergène ni label.
2. **La caisse ne reçoit pas les commandes en temps réel** : `App.jsx` charge les commandes une fois ; seul le
   dashboard écoute Realtime. Pas d'écran accepter / refuser / avancer / annulation.
3. **Modèle de commande non prêt pour des clients** : total calculé par le navigateur ; statuts en texte libre
   (`en cours`, `en attente`, `payée`, `annulee`, `terminee`, `test`) sans contrainte ; file hors ligne sans clé
   d'idempotence ; suppression de commandes possible (y compris d'une journée entière).

## 3. Risques de sécurité à traiter avant d'ouvrir l'inscription client

1. Policy `creer_restaurant_inscription` : tout compte authentifié peut créer un restaurant, puis en devenir
   gérant via `can_create_initial_manager`. Vice Go partageant `auth.users`, un client pourrait le faire.
2. Points fidélité calculés côté navigateur (lecture-modification-écriture non atomique).
3. `PIN_CODE = '1234'` en clair dans `src/config.js` ; CORS `*` sur le serveur d'impression (LAN).
4. Migrations appliquées à la main, numéros en double (005 ×2, 006 ×2), pas de retour arrière, pas de
   `config.toml` : l'état réel de la production est inconnu (indice : slug `osmash-2` → restaurants en double).
5. Plusieurs fichiers (`App.jsx`…) ressemblent à du code déjà compilé : à manipuler avec précaution.

## 4. Réutilisable

Projet Supabase, Auth, isolation par `restaurant_id` ; format `orders.items` (`pid, name, unit, qty, total, cust`)
à conserver pour l'impression et les stats ; `next_order_num` (via fonction serveur) ; `restaurants.slug` ;
ledger fidélité ; pattern `/api` avec clé secrète côté serveur ; écoute Realtime de `ManagerDash` ; Anton,
logo, photos.

## 5. Décisions validées (suite à l'audit)

- **Staging Supabase séparé** de la production ; aucune écriture en production sans accord explicite.
- **Supabase devient la source de vérité du catalogue** (caisse, Vice Go, dashboard, futurs restaurants),
  migration progressive, **PID actuels conservés** (`externalRef`).
- **Expo / React Native / TypeScript**, bundle ID `com.vicecode.vicego`.
- **Monorepo progressif** : `apps/mobile` ajouté sans déplacer la caisse ; `packages/types` plus tard.
- Travail sur la branche dédiée, petits commits, rien sur `main` sans accord.
