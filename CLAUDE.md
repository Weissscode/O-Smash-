# O'Smash — instructions pour Claude Code

App caisse/POS + borne de commande (Vite + React, `src/`) et serveur local
d'impression ESC/POS (`server.js`), backend Supabase (voir `supabase/`).

## Protocole de travail — à respecter systématiquement

1. **Avant de dire "c'est fait" : teste réellement le changement.**
   - Lance l'appli en local (`npm run dev`, serveur de dev Vite).
   - Si c'est visuel : ouvre-la dans un navigateur (headless via Playwright
     si pas d'affichage direct), clique dans le flux concerné comme le
     ferait un utilisateur, prends une capture d'écran.
   - L'app réelle passe par `AuthGate` (login Supabase requis). Pour
     screenshoter un flux sans compte réel, bypasser temporairement dans
     `src/main.jsx` (ex: un flag `?demo=1` qui rend `<App restaurantId="demo" />`
     direct au lieu de `<AuthGate>`), avec un `.env` bidon syntaxiquement
     valide (`VITE_SUPABASE_URL=https://demo.supabase.co` etc. — les appels
     réseau échoueront mais les écrans se rendent, la plupart des appels
     Supabase du code ont déjà un `.catch()` de repli). **Annuler ce bypass
     avant de commit** (`git checkout -- src/main.jsx`, supprimer le `.env`
     bidon) — jamais commité.
   - Montre la capture avant/après pour prouver que ça marche, pas juste
     "j'ai modifié le fichier X".
2. **Vérifie que ça compile/build sans erreur avant de committer** :
   `npm run build`. Pour `server.js` (CommonJS, pas de bundler) :
   `node --check server.js`.
3. **Ne laisse jamais de travail non sauvegardé :**
   - `git add` + `git commit` avec un message clair qui explique quoi et
     pourquoi (pas juste "fix").
   - `git push` sur la branche dédiée.
   - Si une Pull Request est demandée : résumé clair + ce qui reste à faire
     manuellement (IP imprimante à changer dans `server.js`, migration
     Supabase à appliquer via `supabase/migration_*.sql`, redémarrage de
     `node server.js`, etc.).
4. **Nettoie avant de commit** : supprime tout fichier de test/preview
   temporaire créé pour vérifier le changement (scripts Playwright, `.env`
   bidon, bypass de `main.jsx`...) — ne pollue pas le repo avec des fichiers
   scratch.
5. **Ne demande pas la permission pour tester** — teste et pousse le travail
   directement. Demande confirmation seulement avant une action difficile à
   annuler (merger une PR, supprimer des données, changer l'IP de
   production d'une imprimante déjà en service...).
6. **Si une étape est impossible** (pas d'accès push, pas de navigateur
   disponible, pas d'accès aux vraies clés Supabase pour tester en
   conditions réelles...), le dire clairement plutôt que de sauter l'étape
   en silence.

## Repères utiles

- `server.js` : imprimantes `CAISSE` / `CUISINE` / `KIOSK` — IP en dur à
  adapter par restaurant, pas dans `.env`.
- `.env` (jamais commité, voir `.env.example`) : clés Supabase front
  (`VITE_...`) + clés serveur (`SUPABASE_SECRET_KEY`, `RESTAURANT_ID`) pour
  `server.js` uniquement.
- Mode borne de commande : voir `KIOSK.md`.
