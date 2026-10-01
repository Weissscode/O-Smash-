# Vice Go — application mobile

Application client multi-restaurants (iOS en priorité, Android compatible) de l'écosystème Vice Code.
O'SMASH est le premier restaurant ; rien dans le code n'est spécifique à O'SMASH.

> **Phase 1 — Fondation mobile.** L'app tourne sur un **catalogue de démonstration embarqué** (aucun réseau,
> aucune donnée de production). Supabase (staging) sera branché en phase 2, après validation des migrations.

## Démarrage rapide

```bash
cd apps/mobile
npm ci
cp .env.example .env.local     # EXPO_PUBLIC_DATA_SOURCE=mock par défaut
npm start                      # puis ouvrir la development build "Vice Go Dev" sur l'iPhone
```

L'app utilise des modules natifs (SecureStore, géolocalisation, haptique, onglets natifs) : elle se lance dans
une **development build**, pas dans Expo Go. Installation sur iPhone : [`docs/vice-go/ios-dev-build.md`](../../docs/vice-go/ios-dev-build.md).

| Commande | Rôle |
| --- | --- |
| `npm start` | Serveur de développement (Metro) |
| `npm run typecheck` | TypeScript strict |
| `npm run lint` | ESLint (config Expo + règles React Compiler) |
| `npm test` | Tests unitaires et composants (Jest + Testing Library) |
| `npm run check` | Les trois à la suite (à lancer avant chaque commit) |
| `npx expo export --platform ios` | Vérifie que le bundle iOS compile |

## Pile technique

- **Expo SDK 57** · React Native 0.86 · React 19.2 · TypeScript 6 (strict) · React Compiler activé
- **Expo Router** (routes typées, onglets natifs `NativeTabs`, feuilles `formSheet`, modales natives)
- **TanStack Query** (données serveur, cache, nouvel essai, état réseau via NetInfo)
- **Zustand** + AsyncStorage (panier, position, recherches récentes — données non sensibles)
- **Supabase JS** avec session dans le **Keychain/Keystore** (expo-secure-store, découpage en morceaux)
- **Reanimated 4** (micro-interactions), **expo-haptics**, **expo-image**, **react-native-svg** (damier)
- **Zod** (validation des variables d'environnement)

## Architecture

```
apps/mobile/
├── app.config.ts          Config Expo dynamique (variantes dev / preview / production)
├── eas.json               Profils de build EAS
├── assets/
│   ├── images/            Icône, splash, icônes Android (Vice Go)
│   └── fixtures/osmash/   Visuels de DÉMO (compressés) — remplacés par Supabase Storage en phase 2
├── src/
│   ├── app/               ROUTES uniquement (Expo Router) — chaque fichier = un écran
│   │   ├── _layout.tsx        Providers, polices, splash, pile de navigation, ErrorBoundary global
│   │   ├── (tabs)/            Accueil · Recherche · Commandes · Profil (barre d'onglets native)
│   │   ├── onboarding.tsx     Présentation + géolocalisation expliquée (sans compte)
│   │   ├── location.tsx       Feuille : position actuelle / ville / code postal / rayon
│   │   ├── restaurant/[slug]  Fiche restaurant (parallaxe, catégories collantes)
│   │   ├── product/[id]       Personnalisation produit (modale)
│   │   ├── cart.tsx           Panier (modale)
│   │   └── auth.tsx           Connexion (prototype, branchée en phase 4)
│   ├── features/          Logique et composants par domaine (discovery, restaurant, product, cart, location)
│   ├── components/        UI réutilisable (ui/) et navigation
│   ├── services/          Accès aux données : catalog (interface + démo), supabase, query-client
│   ├── hooks/             Hooks transverses (catalogue, réseau, heure, hydratation…)
│   ├── store/             État local persistant (Zustand)
│   ├── theme/             Design tokens, typographie, thème clair/sombre
│   ├── lib/               Fonctions pures : prix, distance, horaires, délai, créneaux, erreurs…
│   ├── types/domain.ts    Modèle de domaine (catalogue relationnel multi-restaurants)
│   └── validation/        Schémas Zod (variables d'environnement)
└── tests/                 unit/ (logique métier) · components/ (rendu, accessibilité)
```

Principes :

1. **Les écrans ne connaissent pas Supabase.** Ils passent par `services/catalog` (interface `CatalogRepository`).
   Phase 2 = fournir l'implémentation Supabase, sans toucher à l'UI.
2. **Le client n'est jamais la source de vérité du prix.** Les calculs côté app (`features/product/selection.ts`)
   guident l'utilisateur ; le serveur recalculera tout (phase 5).
3. **Montants en centimes** (entiers) partout.
4. **Aucune valeur métier en dur** : délais, capacités, modes de retrait, paiements, horaires viennent des réglages
   du restaurant. Le moteur de délai (`lib/eta.ts`) est explicable et remplaçable.
5. **Aucun secret dans l'app** : uniquement des `EXPO_PUBLIC_*` publiques (voir `.env.example`).
6. **Jamais d'échec silencieux** : chaque écran a ses états chargement (skeleton), vide, erreur (avec « Réessayer »)
   et un bandeau global hors ligne.

## Identité visuelle

- **Anton** pour les titres (toujours en capitales), **Inter** pour l'interface.
- Encre profonde `#0E0D12` + crème chaude `#F7F4EF`, accent **rose Vice** (néon du logo Vice Code), violet en
  second accent (lilas de la borne O'SMASH).
- **Damier** en signature : bandeaux fins, bas de visuels, états vides — jamais en fond plein.
- Cartes très arrondies, gros visuels détourés, boutons de 56 pt, cibles tactiles ≥ 44 pt.
- Micro-interactions : enfoncement au toucher, ressorts courts, haptique (sélection / succès / avertissement).
- Mode sombre complet ; l'onboarding est toujours sombre (vitrine de la marque).

## Variantes d'installation

| Variante | Nom sur l'iPhone | Bundle ID | Données |
| --- | --- | --- | --- |
| development | Vice Go Dev | `com.vicecode.vicego.dev` | démo puis Supabase **staging** |
| preview | Vice Go Staging | `com.vicecode.vicego.preview` | Supabase **staging** |
| production | Vice Go | `com.vicecode.vicego` | Supabase production (démo interdite) |

Les trois peuvent cohabiter sur le même téléphone. Seul `com.vicecode.vicego` est publié sur l'App Store.
