# Vice — Environnement TEST / PRODUCTION et Fiscal Engine (branche `feature/fiscal-engine`)

> **Statut : base technique, NON certifiée, NON mergée, NON appliquée en production.**
> Les règles de TVA, clôtures et archivage doivent être validées réglementairement
> (NF525 / attestation éditeur) avant toute communication « conforme ».

## Architecture

```
Commande → Checkout → Paiement → Environment Router (src/utils/environment.js)
                                   │
        restaurants.environment ──┬┴──────────────────────────┐
                              'test'                    'production'
                                │                             │
                          orders_test                      orders
                       (pas de ledger)        fiscal_profile 'NONE' → comportement actuel
                                              fiscal_profile 'FR'   → trigger orders_fiscal_guard
                                                                      → fiscal_ledger (SHA-256 chaîné)
                                                                      → verrou des ventes
                                                                      → clôtures D/M/A → archives
```

Une seule application, un seul code métier : `ordersApi.js` ne change que la **table cible**
(`configureOrdersEnvironment`, appelé par `AuthGate` après lecture du restaurant).

## Où sont les protections (backend uniquement)

| Garantie | Mécanisme (migration 008) |
|---|---|
| Un client ne choisit pas son environnement / profil | trigger `restaurants_safe_insert` (création = TEST/NONE) + `restaurants_fiscal_protect` (UPDATE réservé aux RPC) |
| Profil FR irréversible | `restaurants_fiscal_protect` : FR → NONE ou production → test refusé (SQLSTATE `FS001`), même en SQL direct |
| Pas de contournement du ledger via la table TEST | RLS `orders_test` : écriture seulement si `environment='test'` ; RLS `orders` : insert seulement si `environment='production'` |
| Ventes immuables | trigger `orders_fiscal_guard` : après encaissement, montants/articles/paiement/date/suppression refusés ; seuls `print_*`, `points_*` et le statut de workflow restent modifiables |
| Annulation traçable | RPC `fiscal_cancel_order` (gérant, motif obligatoire) → contre-écriture négative ; la commande n'est jamais supprimée |
| Ledger append-only | triggers `UPDATE/DELETE/TRUNCATE` interdits sur `fiscal_ledger`, `fiscal_closings`, `fiscal_archives`, pas d'INSERT client, lecture réservée au gérant |
| Détection d'altération | hash SHA-256 chaîné ; RPC `fiscal_verify_chain` |

Limite : un administrateur de la base (rôle propriétaire / `service_role` avec DDL) peut
désactiver les triggers. La chaîne de hash permet alors de **détecter** l'altération, pas de l'empêcher.

## Fonctions / RPC

`set_restaurant_environment(env)`, `activate_fiscal_fr('ACTIVER')`, `fiscal_cancel_order(id, motif)`,
`fiscal_close_day(date)`, `fiscal_close_period('monthly'|'annual', année, mois)`,
`fiscal_verify_chain()`, `fiscal_archive_period(début, fin)`, `fiscal_status()`.
Internes (non exposées) : `fiscal_append`, `fiscal_store_closing`, `fiscal_entry_hash`, `fiscal_closing_hash`.

## Tester

```bash
npm ci
npm run test:environment                       # routeur (JS pur)
npm run test:management                        # non-régression UI existante (Playwright)
PGHOST=... PGPORT=... PGUSER=... npm run test:fiscal-sql   # migrations + 63 assertions sur un PostgreSQL JETABLE
```
`tests/sql/run.sh` crée une base temporaire avec un faux schéma `auth` : **jamais de Supabase réel**.

## Appliquer la migration (APRÈS validation, sur STAGING d'abord)

1. Créer un projet Supabase de staging (copie du schéma de prod).
2. Exécuter `supabase/migration_008_fiscal_engine.sql` (transaction unique, uniquement des ajouts).
3. Les restaurants existants passent en `production` + `NONE` : aucun changement de comportement.
4. Nouveau restaurant = `test`. Passage en production / activation FR : onglet **Fiscalité** du Management (gérant).

## Non fait / à valider

- Pas de reprise de l'historique antérieur à l'activation dans le ledger.
- TVA : taux par défaut 10 % (`restaurants.fiscal_default_vat_rate`) ou `vat_rate` par ligne ; règles réelles (5,5 / 10 / 20 %, sur place / emporter, alcool) à définir avec l'expert.
- Clôtures : séquence-based, fuseau Europe/Paris, pas de signature électronique / certificat.
- Archivage : export JSON + empreinte immuable en base ; pas de stockage externe signé, pas de politique de conservation 6 ans.
- Pas de ticket Z imprimé, pas d'édition « duplicata » tracée, pas de journal d'accès/événements techniques.
- Mode dégradé hors-ligne : une vente créée hors-ligne entre au ledger à la synchronisation (`occurred_at` = date de saisie) ; à valider.
- Tickets caisse : mentions légales (TVA, n° de ticket fiscal) non ajoutées.
