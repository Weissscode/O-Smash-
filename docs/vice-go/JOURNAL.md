# Journal partagé des IA — Vice Go

Entrée la plus récente EN HAUT. Une entrée par session, même courte.

Modèle :

```
## AAAA-MM-JJ — <IA> — branche <nom>
- Commits : <hash court> … <hash court>
- Fait :
- Reste à faire :
- Bloqué par / en attente du propriétaire :
- Décisions du propriétaire :
- Fichiers sensibles touchés (hors apps/mobile) :
```

---

## 2026-10-04 — Claude Code — branche `claude/ecstatic-hopper-qvexwj`
- Fait : l'app tourne sur l'iPhone du propriétaire via **Expo Go** (`npx expo start --go`, connexion par
  access token PERSONNEL `EXPO_TOKEN` — compte créé via GitHub, pas de mot de passe ; un token robot échoue
  car Expo Go est connecté en `vicecode`). Ajout d'une requête d'inventaire unique (lecture seule) dans
  `docs/vice-go/staging-supabase.md` §1.d.
- Décision propriétaire : rester sur Expo Go au quotidien ; build *preview* seulement aux jalons.
- Vu : `feature/fiscal-engine` ajoute sur `restaurants` les colonnes `environment`, `fiscal_profile`,
  `fiscal_activated_at`, `fiscal_default_vat_rate` + table `orders_test` et ledger fiscal. **Vice Go ne doit pas
  réutiliser ces noms** ; les commandes Vice Go (phase 5) devront s'intégrer au ledger fiscal si ce chantier est
  fusionné. Le staging Supabase servira aux deux chantiers.
- En attente du propriétaire : résultat de la requête §1.d (prod, lecture seule) + création du projet staging.
- Fichiers sensibles touchés hors `apps/mobile` : aucun (docs seulement).

## 2026-10-01 (suite) — Claude Code — branche `claude/ecstatic-hopper-qvexwj`
- Fait : projet EAS relié dans `apps/mobile/app.config.ts` (owner `vicecode-team`, slug `weiss`,
  projectId `ddf55865-887b-456c-b05b-1081846d3ebe`) ; guide iPhone mis à jour (plus besoin de `eas init`).
- Propriétaire : a créé le projet Expo « Weiss » et l'a lié au dépôt GitHub ; installe Expo Go sur l'iPhone.
- Reste : *Base directory* = `apps/mobile` dans expo.dev (à vérifier) ; premier build iOS via la CLI
  (`device:create` puis `build --profile development`) ; si le slug en ligne n'est pas `weiss`, EAS le signalera
  → corriger `EAS_SLUG`.
- Fichiers sensibles touchés hors `apps/mobile` : aucun (docs seulement).

## 2026-10-01 — Claude Code — branche `claude/ecstatic-hopper-qvexwj`

- Commits : `f6d4462` … `db35930` (phase 1), puis ce journal + `AGENTS.md` / `CLAUDE.md` racine.
- **Fait — Phase 0 (audit)** : voir `docs/vice-go/audit-phase0.md`.
- **Fait — Phase 1 (fondation mobile)** dans `apps/mobile/` :
  - Expo SDK 57, RN 0.86, React 19.2, TypeScript 6 strict, Expo Router (onglets natifs), TanStack Query,
    Zustand, Reanimated 4, expo-secure-store, expo-location, expo-haptics.
  - Design system Vice Go (`src/theme`, `src/components/ui`) : Anton + Inter, encre/crème, rose « Vice »,
    damier en signature, clair/sombre.
  - Écrans prototypes : onboarding (géoloc expliquée), position manuelle + rayon, accueil multi-restaurants,
    recherche, fiche restaurant, fiche produit (options obligatoires, prix temps réel), panier mono-restaurant
    (sur place / à emporter, dès que possible / créneau), connexion (prototype inactif), commandes (vide), profil.
  - Données : **catalogue de démonstration embarqué** (`src/services/catalog/fixtures`) — O'SMASH avec ses vrais
    PID caisse (`externalRef`) + 3 restaurants fictifs « (démo) ». Interface `CatalogRepository` : l'implémentation
    Supabase viendra en phase 2 sans toucher l'UI.
  - 70 tests Jest, lint et TypeScript au vert ; bundle iOS compilé ; CI `.github/workflows/mobile-ci.yml`.
  - Docs : `apps/mobile/README.md`, `docs/vice-go/{ios-dev-build,staging-supabase,environnements}.md`,
    planche `docs/vice-go/phase1-ecrans.jpg`.
- **Reste à faire / en attente du propriétaire** (rien de commencé) :
  1. Export du schéma Supabase de prod + résultat de la requête « migrations appliquées »
     (`docs/vice-go/staging-supabase.md`, étapes 1–2, lecture seule).
  2. Création du projet Supabase **staging** (URL + clé publishable).
  3. `projectId` EAS après `eas init` (à inscrire dans `apps/mobile/app.config.ts`).
  4. Feu vert pour la **phase 2** (plan détaillé ci-dessous).
- **Plan phase 2 proposé (NON validé, NE PAS commencer sans accord)** — staging uniquement :
  `supabase/config.toml` + `supabase/migrations/` horodatées réversibles ; colonnes Vice Go sur `restaurants`
  (toutes optionnelles) + vue publique des restaurants publiés ; catalogue relationnel `menu_categories`,
  `menu_items` (`external_ref` = PID), `modifier_groups`, `modifier_options`, liaison produit↔groupe ;
  RLS (lecture publique si publié, écriture gérant) ; RPC `nearby_restaurants` ; seed fictif ;
  `SupabaseCatalogRepository` + `packages/types` générés. La caisse ne lit PAS encore ce catalogue.
- **Décisions du propriétaire** : staging séparé ; Supabase = source de vérité du catalogue, migration
  progressive, PID conservés ; Expo/RN/TS ; bundle ID `com.vicecode.vicego` (variantes `.dev` / `.preview`) ;
  monorepo progressif sans déplacer la caisse ; rien sur `main` sans accord ; UX Vice Go premium, multi-restaurants.
- **Points ouverts** : horaires et coordonnées O'SMASH dans les fixtures = valeurs de démo à confirmer ;
  policy `creer_restaurant_inscription` (faille si clients et staff partagent `auth.users`) à fermer — impacte
  l'inscription restaurateur de la caisse, décision du propriétaire requise.
- **Vu sur le dépôt** : branches `feature/fiscal-engine` (crée `supabase/migration_008_fiscal_engine.sql`) et
  `codex/refonte-pos-sobre` (caisse). Aucune ne touche `apps/mobile/`.
- Fichiers sensibles touchés hors `apps/mobile` : aucun fichier de la caisse/du dashboard/de Supabase.
