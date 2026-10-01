# Environnements et variables — staging / production

## Qui parle à quelle base ?

| Application | Environnement | Projet Supabase | Où sont définies les variables |
| --- | --- | --- | --- |
| Caisse + dashboard (Vercel `o-smash`) | Production (branche `main`) | **PRODUCTION** | Vercel → Settings → Environment Variables → *Production* |
| Caisse + dashboard (Vercel) | Preview (autres branches) | ⚠️ à vérifier (voir plus bas) | Vercel → *Preview* |
| Serveur d'impression (`server.js`, au restaurant) | — | **PRODUCTION** | fichier `.env` local du PC caisse |
| Vice Go — development build | development | **STAGING** (démo en phase 1) | EAS → environnement `development` + `.env.local` |
| Vice Go — build interne / TestFlight de test | preview | **STAGING** | EAS → environnement `preview` |
| Vice Go — App Store | production | **PRODUCTION** | EAS → environnement `production` |

Rien de la caisse, du dashboard ou du serveur d'impression ne change pour Vice Go.

## Variables de l'app mobile (toutes PUBLIQUES)

| Variable | development | preview | production |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_DATA_SOURCE` | `mock` (phase 1) puis `supabase` | `supabase` | `supabase` (obligatoire, `mock` refusé au démarrage) |
| `EXPO_PUBLIC_SUPABASE_URL` | URL **staging** | URL **staging** | URL **production** |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | clé publishable **staging** | clé publishable **staging** | clé publishable **production** |
| `EAS_PROJECT_ID` | (inscrit en dur dans `app.config.ts`, non secret) | idem | idem |

Création (exemple pour le staging, en phase 2) :

```bash
cd apps/mobile
npx eas-cli@latest env:create --environment development --name EXPO_PUBLIC_DATA_SOURCE --value supabase --visibility plaintext
npx eas-cli@latest env:create --environment development --name EXPO_PUBLIC_SUPABASE_URL --value https://<staging>.supabase.co --visibility plaintext
npx eas-cli@latest env:create --environment development --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value sb_publishable_... --visibility plaintext
# répéter avec --environment preview ; production uniquement au moment de la publication
```

En local, les mêmes noms vont dans `apps/mobile/.env.local` (ignoré par Git).

## Secrets (jamais dans l'app, jamais dans Git)

| Secret | Où il vit |
| --- | --- |
| Clé secrète / service role Supabase | Vercel (fonctions `/api`), `server.js`, secrets des Edge Functions (`supabase secrets set`) — **un par projet** |
| Clés Stripe secrètes, secret de webhook | Secrets des fonctions serveur (phase 6) |
| Clé privée Apple (Sign in with Apple), secret OAuth Google | Configuration Auth du projet Supabase (phase 4) |
| Certificats Apple Wallet | Vercel (déjà en place pour la fidélité) |

L'app ne contient que des valeurs `EXPO_PUBLIC_*`, qui sont lisibles par quiconque décompile l'application :
leur sécurité repose entièrement sur les règles RLS.

## ⚠️ Point à vérifier côté Vercel (sans rien modifier pour l'instant)

Dans Vercel → projet `o-smash` → Settings → Environment Variables, regarde si `VITE_SUPABASE_URL` et
`VITE_SUPABASE_ANON_KEY` sont cochées pour **Preview**. Si oui, chaque déploiement de branche (y compris celle-ci)
pointe vers la **base de production**. Ce n'est pas dangereux tant que la caisse n'est pas modifiée sur ces
branches, mais je recommande de faire pointer *Preview* vers le staging une fois celui-ci prêt. Je te
demanderai ton accord avant tout changement.
