# Installer Vice Go (development build) sur ton iPhone

Durée : ~30 min la première fois (dont ~15 min de build dans le cloud). **Aucun Mac n'est nécessaire** :
le build est fait par EAS (serveurs Expo). Ensuite, chaque modification de code apparaît en direct sur
l'iPhone sans reconstruire, tant qu'aucun module natif n'est ajouté.

## Ce qu'il te faut

- Ton compte **Apple Developer** (payé et actif ✅).
- Un compte **Expo** gratuit : <https://expo.dev/signup>.
- Un ordinateur avec **Node.js 20 ou plus** (`node -v`) et Git.
- L'iPhone (iOS 16 minimum conseillé) et l'ordinateur sur le **même Wi-Fi** (ou utiliser `--tunnel`, étape 8).

## 1. Récupérer le code

```bash
git clone https://github.com/Weissscode/O-Smash-.git
cd O-Smash-
git checkout claude/ecstatic-hopper-qvexwj
cd apps/mobile
npm ci
cp .env.example .env.local
```

## 2. Se connecter à Expo

```bash
npx eas-cli@latest login
```

## 3. Projet EAS — déjà fait ✅

Le projet existe sur expo.dev (compte `vicecode-team`, projet « Weiss », slug `weiss`) et il est relié au
dépôt GitHub. Son identifiant est inscrit dans `apps/mobile/app.config.ts` : **ne lance pas `eas init`**.
Dans expo.dev → Project settings → GitHub, le *Base directory* doit être `apps/mobile`.

## 4. Déclarer les variables d'environnement EAS (une seule fois)

Pour la phase 1, une seule variable suffit :

```bash
npx eas-cli@latest env:create --environment development --name EXPO_PUBLIC_DATA_SOURCE --value mock --visibility plaintext
```

(Les variables Supabase **staging** seront ajoutées en phase 2 — voir `docs/vice-go/environnements.md`.)

## 5. Enregistrer ton iPhone

```bash
npx eas-cli@latest device:create
```

Choisis « Website », ouvre le lien ou le QR code **sur l'iPhone avec Safari**, puis installe le profil :
**Réglages → Général → VPN et gestion de l'appareil → profil téléchargé → Installer**.

## 6. Lancer le build iOS de développement

```bash
npx eas-cli@latest build --profile development --platform ios
```

Réponds **oui** quand EAS propose de se connecter à ton compte Apple et de gérer automatiquement les
certificats et le profil de provisionnement. Il enregistre l'identifiant `com.vicecode.vicego.dev`
(variante dev ; l'App Store utilisera `com.vicecode.vicego`).

À la fin, EAS affiche un QR code et un lien : ouvre-le sur l'iPhone et appuie sur **Installer**.

## 7. Activer le mode développeur (iOS 16+, une seule fois)

**Réglages → Confidentialité et sécurité → Mode développeur → activer**, puis redémarrer l'iPhone et confirmer.
(L'option n'apparaît qu'après l'installation d'une development build.)

## 8. Lancer l'app

Sur l'ordinateur :

```bash
cd apps/mobile
npx expo start --dev-client          # même Wi-Fi
# ou, si le réseau bloque : npx expo start --dev-client --tunnel
```

Sur l'iPhone, ouvre **Vice Go Dev** : le serveur apparaît dans la liste (ou scanne le QR code du terminal
avec l'appareil photo). Les modifications de code se rechargent instantanément.

## Quand faut-il refaire un build ?

Uniquement si on ajoute ou met à jour un **module natif** (ou une permission / un plugin dans `app.config.ts`).
Je te le signalerai explicitement à chaque fois. Le code JS/TS, lui, ne demande jamais de rebuild.

## Problèmes fréquents

| Symptôme | Solution |
| --- | --- |
| « Impossible de vérifier l'app » | Mode développeur non activé (étape 7) ou profil non installé (étape 5). |
| L'app ne trouve pas le serveur | Même Wi-Fi ? Sinon `npx expo start --dev-client --tunnel`. |
| Nouvel iPhone | Refaire l'étape 5 puis `npx eas-cli@latest build --profile development --platform ios`. |
| Écran rouge au lancement | Envoie-moi une capture : c'est une erreur JS, souvent corrigeable sans rebuild. |

## Ce qui n'a PAS encore pu être vérifié

Le build EAS et l'installation sur un vrai iPhone nécessitent ton compte Apple/Expo : je ne les ai pas exécutés.
Ce qui est vérifié de mon côté : TypeScript, lint, 70 tests, compilation du bundle iOS (Hermes) avec Metro,
et le parcours complet dans un navigateur au format iPhone.
