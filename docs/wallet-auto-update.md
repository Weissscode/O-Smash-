# Mise à jour automatique de la carte Apple Wallet

## Problème corrigé

La carte Wallet était **statique** : points et prénom figés au moment du
téléchargement. Rien ne permettait à l'iPhone de savoir qu'une version plus
récente existait (pas de PassKit Web Service, pas de notification Apple).

## Fonctionnement

```
Caisse / scan : points crédités ou récompense utilisée
   │  (écriture Supabase : loyalty_transactions + customers)
   ├─► trigger SQL : loyalty_cards.wallet_updated_at = now()
   └─► POST /api/wallet-notify  (jeton de session du personnel)
          └─► notification APNs vide vers chaque iPhone qui détient la carte
                 └─► l'iPhone appelle  GET /api/wallet/v1/devices/…/registrations/…?passesUpdatedSince=…
                        └─► GET /api/wallet/v1/passes/…/<carte>  → carte régénérée
                               (points, visites, palier, prochaine récompense)
```

- **Enregistrement** : à l'ajout de la carte, l'iPhone appelle
  `POST /api/wallet/v1/devices/:appareil/registrations/:type/:carte` avec le
  jeton de la carte. Table `wallet_registrations` (aucun accès navigateur).
- **Jeton par carte** : `HMAC-SHA256(WALLET_AUTH_SECRET, numéro de série)`.
  Rien à stocker ; sans posséder la carte, impossible à deviner.
- **Si la notification est ratée** (réseau, navigateur fermé) : le client peut
  forcer la mise à jour en tirant vers le bas sur le verso de sa carte
  (Apple ne garantit pas d'autre rafraîchissement). La donnée est de toute
  façon prête : `wallet_updated_at` est tenu par trigger SQL, indépendamment
  du code appelant.
- **Notification de verrouillage** : « Vous avez maintenant N points ».

## Contenu de la carte

Points (principal), prénom et visites, palier (si le client en a un), puis
« DISPONIBLE » (meilleure récompense atteignable) et « PROCHAINE RÉCOMPENSE »
(`Menu dans 30 pts`), calculées depuis le catalogue `rewards`.

## Mise en ligne (dans cet ordre)

1. **Supabase → SQL Editor** : exécuter `supabase/migration_008_scan_events.sql`
   (relais scan → caisse persistant), puis `supabase/migration_009_wallet_updates.sql`.
2. **Vercel → Environment Variables** (Production), puis redéployer :
   - `WALLET_AUTH_SECRET` : une longue chaîne aléatoire (≥ 32 caractères),
     par exemple `openssl rand -hex 32`. **Active le service.**
   - `WALLET_WEB_SERVICE_URL` : `https://o-smash.vercel.app/api/wallet`
     (domaine de **production**). Les déploiements de prévisualisation Vercel
     sont protégés : l'iPhone n'y a pas accès, une carte ajoutée depuis une
     prévisualisation ne se mettrait jamais à jour.
   - Déjà en place : `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `WALLET_WWDR_PEM`,
     `WALLET_SIGNER_CERT_PEM`, `WALLET_SIGNER_KEY_PEM`.
3. **Fusionner la branche dans `main`** (déploiement de production).
4. **Re-télécharger la carte** sur l'iPhone (supprimer l'ancienne, ajouter
   la nouvelle depuis la page de fidélité) : les cartes déjà installées ont
   été créées sans adresse de service et ne pourront jamais se mettre à jour.

Sans `WALLET_AUTH_SECRET`, tout continue à fonctionner comme avant (carte
statique, aucune erreur) : on peut déployer le code avant d'activer le service.

## Vérification sur iPhone

1. Ajouter une carte neuve (étape 4). Dans les journaux Vercel, on doit voir
   un appel `POST /api/wallet/v1/devices/…/registrations/…` répondu **201**.
2. Faire une commande avec ce client scanné, la valider.
3. En quelques secondes la carte passe au nouveau solde (notification de
   verrouillage « Vous avez maintenant N points »).
4. Si rien ne bouge : journaux Vercel de `/api/wallet-notify` (`sent`,
   `failed`, motif Apple) et de `/api/wallet/v1/log` (erreurs remontées par
   l'iPhone lui-même).

## Limites connues

- Non testé de bout en bout contre les serveurs d'Apple depuis l'environnement
  de développement (pas d'iPhone ni d'accès APNs) : la logique est couverte par
  `npm run test:wallet` (serveur APNs HTTP/2 simulé), mais la première
  validation réelle se fait sur appareil (section ci-dessus).
- Palier : affiché s'il existe sur le client, mais **jamais recalculé** — aucune
  règle de palier n'est encore définie (seuils, base de calcul).
- Le crédit des points reste en trois écritures côté navigateur (non atomique) ;
  une fonction SQL atomique est la suite logique.
- Android : pas de carte Wallet, aucune page « ma carte » en direct pour l'instant.
