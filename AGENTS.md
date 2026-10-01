# Règles communes aux IA qui travaillent sur ce dépôt (Claude Code, Codex…)

Plusieurs assistants IA travaillent sur ce projet **à tour de rôle**, à la demande du propriétaire.
Ce fichier est la source de vérité pour éviter les conflits. Lis-le en entier avant toute action.

## 1. Avant CHAQUE session (obligatoire)

```bash
git fetch --all --prune
git status                                   # ne jamais écraser des modifications non commitées
git branch --show-current
git log --oneline -15 --all --graph          # voir ce que l'autre IA a fait
```

Puis :

1. Lis **`docs/vice-go/JOURNAL.md`** (dernière entrée en premier) : qui a fait quoi, ce qui est en cours,
   ce qui est bloqué, ce qui a été validé par le propriétaire.
2. Si tu travailles sur une branche qui existe déjà sur le dépôt distant, **récupère d'abord son état distant**
   (`git pull --ff-only`). Si ça ne passe pas en avance rapide, **arrête-toi et demande** : ne fais ni rebase,
   ni force-push sur un travail qui n'est pas le tien.
3. Vérifie qu'aucune autre branche ne modifie les mêmes fichiers que toi :
   `git diff --name-only origin/main...origin/<autre-branche>`.

## 2. Pendant la session

- **Une branche par chantier.** Ne jamais pousser sur `main` ni fusionner dans `main` sans accord explicite
  du propriétaire.
- Petits commits clairs, en français, chacun compilable.
- Ne jamais modifier un fichier dont un autre chantier est propriétaire sans le signaler dans le journal.
- Ne jamais supprimer de données, ne jamais toucher la **base Supabase de production** sans accord explicite
  (le propriétaire valide le script exact avant exécution).
- Aucun secret dans le code ni dans Git.

## 3. À la fin de CHAQUE session (obligatoire)

1. Lance les vérifications du périmètre touché (voir §5).
2. Commit + push de la branche.
3. Ajoute une entrée **en haut** de `docs/vice-go/JOURNAL.md` (modèle dans le fichier) : IA, date, branche,
   commits, ce qui est fait, ce qui reste, blocages, décisions du propriétaire.

## 4. Carte du dépôt

| Chemin | Contenu | Propriétaire / règle |
| --- | --- | --- |
| `/` (`src/`, `index.html`, `gestion.html`, `api/`, `vercel.json`) | Caisse + dashboard O'SMASH (Vite/React JS), déployés sur Vercel depuis `main` | **Ne pas casser.** Toute modif = chantier séparé validé |
| `server.js` | Serveur d'impression local du restaurant | Ne pas toucher sans demande |
| `supabase/` | Schéma et migrations SQL (appliquées à la main jusqu'ici) | Numéros réservés : voir §6 |
| `apps/mobile/` | **Vice Go**, app client iOS/Android (Expo SDK 57, TypeScript) | Lire `apps/mobile/README.md` et `apps/mobile/AGENTS.md` |
| `docs/vice-go/` | Audit, guides staging/env/iPhone, journal | Le journal est partagé par toutes les IA |
| `.github/workflows/mobile-ci.yml` | CI de Vice Go uniquement | — |

## 5. Vérifications

- Vice Go : `cd apps/mobile && npm ci && npm run check` (TypeScript + lint + 70 tests). Pour vérifier le bundle :
  `npx expo export --platform ios`.
- Caisse/dashboard : `npm run build` à la racine (et `npm run test:management` si le dashboard est touché).

## 6. Réservations (pour éviter les collisions)

- Les fichiers `supabase/migration_008_*.sql` sont **déjà utilisés** par la branche `feature/fiscal-engine`.
  Vice Go passera par `supabase/migrations/<horodatage>_*.sql` (CLI Supabase), pas par la numérotation 00X.
- La branche Vice Go actuelle est `claude/ecstatic-hopper-qvexwj`.
