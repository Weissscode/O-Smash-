# Système de fidélité NFC — O'SMASH

> Document de conception (architecture, fonctionnement, écrans, base de données).
> Aucune implémentation à ce stade — c'est la réflexion produit + technique qui précède le développement.

---

## 1. Principes directeurs

1. **La carte n'est qu'une clé.** Le point le plus important du design : les points, l'historique et le statut appartiennent au **client**, jamais à la carte physique. La carte NFC n'est qu'un pointeur rapide vers un compte client. Conséquence directe : perdre sa carte ne fait jamais perdre ses points, changer de carte est instantané et sans risque.
2. **Zéro friction en caisse.** L'employé ne fait qu'une chose : approcher la carte du lecteur. Tout le reste (recherche client, calcul de points, cumul, déblocage de récompense) est automatique.
3. **Le ledger est la vérité, le solde est un cache.** Chaque mouvement de points est un évènement immuable (`loyalty_transactions`). Le solde affiché en caisse est une colonne dénormalisée recalculée à chaque mouvement, pour un affichage instantané sans jamais recalculer une somme sur des milliers de lignes.
4. **Sécurité proportionnée au risque.** Une carte de fidélité n'est pas une carte bancaire : l'enjeu en cas de fraude est "quelqu'un gagne des points qui ne sont pas les siens", pas un vol d'argent. On sécurise en conséquence (voir §6), sans sur-ingénierie inutile (pas de puce cryptographique, pas de PIN à chaque passage).
5. **Reste dans l'esprit de l'existant.** Le projet est déjà multi-restaurants avec Row Level Security par `restaurant_id` (`supabase/schema.sql`). Tout ce qui suit respecte cette convention pour s'intégrer sans réécrire l'existant.

---

## 2. Fonctionnement souhaité — le flux en caisse

```
Client présente sa carte
        │
        ▼
Lecteur NFC lit l'UID (≈100-300 ms)
        │
        ▼
Lookup `loyalty_cards.uid_nfc` → `customers` (requête indexée, <100 ms)
        │
        ├─ Carte inconnue ─────────► Popup "Nouvelle carte" → inscription rapide (prénom + tel, 2 champs)
        ├─ Carte bloquée/perdue ───► Popup rouge, aucune donnée sensible affichée, scan refusé
        └─ Carte active ───────────► Popup fidélité (voir §4.3) : prénom, points, récompenses, historique
                │
                ▼
        Employé finalise la commande normalement
                │
                ▼
        À la validation du paiement (un seul évènement serveur / RPC atomique) :
          • insertion `loyalty_transactions` (type = earn)
          • mise à jour du solde caché sur `customers`
          • vérification passage de palier (Bronze/Argent/Or)
          • vérification déblocage d'une nouvelle récompense
          • si le client a choisi d'utiliser une récompense → transaction "redeem" + statut `customer_rewards` = utilisée
```

Budget de temps (< 2 s en caisse) :
- Lecture NFC + focus champ caché : ~200-400 ms
- Requête Supabase (index sur `uid_nfc`) : ~50-150 ms
- Rendu popup + animation : ~200 ms
- Marge confortable, aucune étape ne dépend d'une saisie manuelle.

---

## 3. Gestion des cartes — cycle de vie

### 3.1 Statuts

| Statut | Sens | Peut scanner en caisse ? |
|---|---|---|
| `disponible` | Carte vierge en stock, pas encore assignée | Non (déclenche "associer à un client") |
| `active` | Assignée à un client, utilisable | Oui |
| `bloquee` | Suspendue temporairement (litige, doute) par le gérant | Non |
| `perdue` | Déclarée perdue par le client | Non |
| `remplacee` | Remplacée par une nouvelle carte (archive) | Non |
| `desactivee` | Fin de vie définitive (rare) | Non |

### 3.2 Opérations

- **Création d'un lot de cartes** : à la réception d'un stock de cartes vierges, le gérant scanne chaque carte une à une → une ligne `disponible` est créée par UID détecté. Évite toute saisie manuelle d'UID (source d'erreur).
- **Association à un client** : depuis la fiche carte ou depuis la fiche client, "Associer une carte" → scan → la carte passe `disponible → active`, liée à `customer_id`.
- **Changement de propriétaire** : on ne "renomme" jamais une carte déjà active sans étape explicite. Le flux correct est : détacher (la carte redevient `disponible`) puis ré-associer à un autre client. Ceci laisse une trace claire dans l'historique (voir `loyalty_card_events`) et évite les erreurs de manipulation.
- **Blocage** : gérant clique "Bloquer" (ex : doute de fraude, litige client) → `active → bloquee`. Réversible.
- **Réactivation** : `bloquee → active` uniquement (pas depuis `perdue`/`remplacee`, qui doivent passer par un remplacement).
- **Remplacement (carte perdue)** : action unique "Carte perdue, en remplacer une" :
  1. l'ancienne carte passe immédiatement à `perdue` (bloque tout usage, y compris par un voleur potentiel) ;
  2. l'employé scanne une carte vierge ;
  3. une nouvelle ligne `active` est créée pour le **même** `customer_id` ;
  4. l'ancienne carte est marquée `remplacee` avec un pointeur `remplacee_par_id` vers la nouvelle, pour garder la chaîne d'historique visible dans la fiche client.
  5. **Aucune migration de points nécessaire** : les points sont sur `customers`, pas sur la carte — c'est tout l'intérêt du modèle du §1.
- **Désactivation définitive** : cas rare (carte défectueuse, client parti). Statut `desactivee`, conservé pour audit, jamais supprimé (soft-delete).

### 3.3 Anti-doublons

- Contrainte `unique` en base sur `loyalty_cards.uid_nfc` : une carte physique = une ligne, point final.
- Un client actif ne peut avoir qu'**une seule carte `active` à la fois** (index unique partiel `customer_id` où `statut = 'active'`). Ses anciennes cartes (`remplacee`, `perdue`) restent en historique mais ne comptent pas.
- *Pourquoi interdire plusieurs cartes actives simultanées ?* Pour la simplicité du modèle mental staff/client ("ma carte" au singulier) et pour éviter des points fragmentés sur deux cartes différentes. Si un besoin de "carte famille" partagée apparaît plus tard, ce sera un statut/table dédié (`carte_partagee`), pas une exception à cette règle.

---

## 4. Écrans

### 4.1 Liste des cartes

Colonnes : UID (masqué partiellement, ex. `•••• 4F2A`), statut (badge coloré), propriétaire (prénom + nom, ou "Non assignée"), solde de points du propriétaire, date de création, dernière utilisation.

Barre du haut : recherche (nom, téléphone, UID), filtre par statut, filtre "jamais utilisée depuis 90 jours" (utile pour relance), bouton "+ Enregistrer un lot de cartes".

### 4.2 Fiche carte

- En-tête : UID complet, badge de statut, boutons d'action contextuels (Bloquer / Réactiver / Déclarer perdue / Détacher du client).
- Bloc client : prénom, nom, téléphone, email, date de naissance, palier actuel (badge Bronze/Argent/Or).
- Bloc stats : solde de points actuel, total dépensé cumulé, nombre de visites, panier moyen, date de dernière visite.
- Onglets d'historique : *Transactions de points* / *Commandes* / *Récompenses utilisées* / *Historique de la carte* (créée, activée, bloquée, remplacée...).

### 4.3 En caisse — la popup au scan (le cœur du système)

Ouverture en <300 ms après le scan, fermeture automatique en fin de commande.

```
┌─────────────────────────────────────────┐
│  (photo, optionnelle)   Salut Karim 👋    │
│                          🥈 Argent        │
│                                           │
│   ⭐ 120 points                          │
│   ▓▓▓▓▓▓▓▓░░░░  120 / 150               │
│   Encore 30 pts avant ton burger offert  │
│                                           │
│   Récompenses disponibles                │
│   [🍔 Menu offert]  [🍟 Frites offertes] │
│        [Utiliser]        [Utiliser]      │
│                                           │
│              [ Voir le profil complet ]  │
└─────────────────────────────────────────┘
```

Cas particuliers :
- **Carte jamais vue** → popup "Nouvelle carte détectée" avec un mini-formulaire (prénom + téléphone, 2 champs, validable en <10 s) qui crée le client et active la carte dans la foulée.
- **Carte bloquée/perdue** → popup rouge sobre : "Carte non valide — merci de contacter la caisse", sans exposer de données personnelles à l'écran (l'employé n'a pas besoin de savoir pourquoi, juste que la carte n'est pas utilisable).
- **Anniversaire du jour** → variante festive du message ("Joyeux anniversaire 🎉 -20% aujourd'hui").

---

## 5. Programme de fidélité — quelle formule pour un snack ?

| Formule | Avantage | Limite pour un snack |
|---|---|---|
| **1 € = 1 point** | Juste, proportionnel au panier, simple à comprendre | Perçu comme "lent" seul, sans catalogue de récompenses attractif |
| **Carte tampon (10 achats = offert)** | Ultra simple, pousse la fréquence de visite | Ignore la valeur du panier (un burger seul compte comme un menu complet) |
| **Cashback %** | Perçu comme généreux, à la mode (type appli fast-food) | Dilue la marge si mal calibré, moins "ludique" |
| **Paliers Bronze/Argent/Or** | Engage sur la durée, effet statut | Inutile seul, doit s'appuyer sur un mécanisme de points sous-jacent |
| **Bonus anniversaire / bienvenue / relance** | Complémentaires, quasi gratuits à mettre en place, très appréciés | Ne suffisent jamais seuls, ce sont des à-côtés |

**Recommandation pour O'SMASH** — une formule hybride, comme les grandes chaînes (Starbucks Rewards, KFC, Burger King) :

1. **Base : 1 € dépensé = 1 point**, sur le montant TTC de la commande. Juste et proportionnel.
2. **Catalogue de récompenses** plutôt qu'une conversion directe points→euros : ex. 80 pts = frites offertes, 150 pts = menu offert. Plus engageant visuellement (§4.3), marge maîtrisée par le gérant (il fixe le coût en points de chaque récompense), évolutif sans toucher au code (table `rewards`).
3. **2 paliers pour démarrer** (pas 3) : *Standard* et *Or* (ex. seuil : 300 € dépensés sur 12 mois glissants). Or donne un petit bonus (+20 % de points, file prioritaire aux heures de pointe, avant-première nouveaux produits). Un palier intermédiaire *Argent* pourra être ajouté plus tard sans changer la structure (`loyalty_tiers` est déjà une table, pas une valeur codée en dur).
4. **Bonus automatiques** : bienvenue (+X pts à la première commande enregistrée), anniversaire (+X pts ou -20 % le jour J), relance (+X pts ou petit cadeau si aucune commande depuis 30-45 jours) — déclenchés par une tâche planifiée côté serveur, invisibles pour l'employé.

Cette combinaison est volontairement simple à opérer en caisse (l'employé ne voit jamais la complexité, juste la popup du §4.3) tout en restant évolutive (ajout d'un palier, d'une récompense, d'un bonus = une ligne en base, jamais une évolution de code).

---

## 6. Aspects techniques

### 6.1 Identifier une carte NFC

Les cartes NFC bas coût (NTAG213/215/216, Mifare Ultralight/Classic — le type "Plycard" en fait partie) exposent un **UID** unique, gravé en usine, lisible par n'importe quel lecteur sans authentification. On l'utilise comme identifiant, stocké en hexadécimal normalisé (majuscules, sans séparateurs).

Options matérielles pour la caisse (Vite + React) :
- **Lecteur USB en mode "clavier" (HID keyboard-wedge)** — recommandé. Le lecteur "tape" l'UID + Entrée dans le champ actif, comme une douchette code-barres. Zéro pilote, compatible tout OS/navigateur, coût très faible (~20-40 €). C'est l'option la plus robuste pour un budget <2 s et le déploiement le plus simple sur du matériel de caisse existant.
- **Web NFC API** (Chrome Android uniquement) — utile si la caisse tourne sur tablette Android, mais non supportée sur iOS/desktop Safari : à garder en option secondaire, pas comme dépendance principale.
- Un petit pont optionnel dans `server.js` (qui gère déjà l'impression via Supabase Realtime) pourrait aussi piloter un lecteur PC/SC (type ACR122U) si le mode clavier ne suffit pas pour un cas précis — mais ce n'est pas nécessaire pour démarrer.

### 6.2 Éviter les doublons

- Contrainte `unique` en base sur `uid_nfc` (source de vérité).
- Flux d'enregistrement "scan pour vérifier" : avant de créer une carte, on vérifie si l'UID existe déjà et on informe l'employé si c'est le cas, plutôt que de laisser Postgres renvoyer une erreur brute.

### 6.3 Gérer les pertes

Voir §3.2 "Remplacement". Le point clé : les points ne sont jamais sur la carte, donc un remplacement est instantané, sans recalcul, sans risque de perte de données. L'ancienne carte est immédiatement invalidée (statut `perdue`), ce qui coupe court à toute utilisation frauduleuse pendant que le client attend sa nouvelle carte.

### 6.4 Sécuriser les données

- **Aucune donnée personnelle écrite sur la puce.** L'UID est un simple pointeur ; nom, téléphone, points restent uniquement en base. Ça simplifie tout (pas de capacité mémoire à gérer, pas de resynchronisation si le profil change) et ça limite la casse en cas de perte/clonage d'UID : au pire, quelqu'un peut se faire passer pour un pointeur vers un client, jamais lire ses données directement depuis la carte.
- **RLS par `restaurant_id`**, dans la continuité exacte de `supabase/schema.sql` : chaque nouvelle table (`customers`, `loyalty_cards`, etc.) suit la fonction `current_restaurant_id()` déjà en place.
- **Lookup uniquement via un endpoint authentifié staff** (jamais un accès public/anonyme à la correspondance UID → client), pour empêcher toute énumération d'UID.
- **Journal d'audit** (`loyalty_card_events`) : qui a bloqué/débloqué/remplacé quelle carte, et quand — utile en cas de litige client.
- **RGPD** : le programme collecte des données personnelles (téléphone, email, date de naissance) → recueillir le consentement à l'inscription, prévoir une anonymisation (plutôt qu'une suppression physique, pour garder la cohérence des commandes historiques) en cas de demande de droit à l'oubli.
- **Résilience réseau** : si Supabase est temporairement injoignable, la caisse continue de fonctionner en mode dégradé ("Fidélité indisponible pour le moment") plutôt que de bloquer la vente — la fidélité ne doit jamais devenir un point de blocage de l'encaissement.

### 6.5 Deux cartes pour le même client ?

Voir §3.3 — non par défaut (index unique partiel sur `customer_id` actif), pour garder un modèle simple. Une "carte famille" partagée serait, si besoin plus tard, une fonctionnalité distincte et explicite plutôt qu'une exception silencieuse à cette règle.

---

## 7. Base de données — proposition de schéma

Respecte la convention déjà en place (`supabase/schema.sql`) : noms de colonnes en français, `restaurant_id` sur chaque table, RLS via `current_restaurant_id()`.

```sql
-- ============================================================
-- Extension fidélité NFC — proposition de schéma
-- À exécuter après supabase/schema.sql existant
-- ============================================================

-- ── TABLE: customers (clients du programme fidélité) ────────
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  prenom text not null,
  nom text,
  telephone text,
  email text,
  date_naissance date,
  tier_id uuid references public.loyalty_tiers (id),
  points_balance integer not null default 0,      -- cache, source de verite = loyalty_transactions
  total_depense numeric(10, 2) not null default 0, -- cache
  nombre_visites integer not null default 0,        -- cache
  derniere_visite_le timestamptz,
  consentement_rgpd boolean not null default false,
  anonymise boolean not null default false,         -- droit a l'oubli : on anonymise, on ne supprime pas
  cree_le timestamptz not null default now()
);

create unique index customers_telephone_restaurant_idx
  on public.customers (restaurant_id, telephone) where telephone is not null and not anonymise;

-- ── TABLE: loyalty_tiers (paliers Bronze/Argent/Or) ─────────
create table public.loyalty_tiers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,                    -- 'Standard', 'Or'...
  ordre integer not null default 0,
  seuil_depense_12_mois numeric(10, 2) not null default 0,
  multiplicateur_points numeric(4, 2) not null default 1.0,
  avantages jsonb not null default '[]'::jsonb,
  cree_le timestamptz not null default now()
);

-- ── TABLE: loyalty_cards ─────────────────────────────────────
create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  uid_nfc text not null,
  customer_id uuid references public.customers (id),
  statut text not null default 'disponible'
    check (statut in ('disponible', 'active', 'bloquee', 'perdue', 'remplacee', 'desactivee')),
  remplacee_par_id uuid references public.loyalty_cards (id),
  activee_le timestamptz,
  desactivee_le timestamptz,
  cree_le timestamptz not null default now()
);

create unique index loyalty_cards_uid_restaurant_idx
  on public.loyalty_cards (restaurant_id, uid_nfc);

-- un seul client ne peut avoir qu'une carte ACTIVE a la fois
create unique index loyalty_cards_customer_active_idx
  on public.loyalty_cards (customer_id) where statut = 'active';

-- ── TABLE: loyalty_card_events (audit du cycle de vie carte) ─
create table public.loyalty_card_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  card_id uuid not null references public.loyalty_cards (id) on delete cascade,
  ancien_statut text,
  nouveau_statut text not null,
  motif text,
  cree_par uuid references public.profiles (id),
  cree_le timestamptz not null default now()
);

-- ── TABLE: loyalty_transactions (ledger, source de verite) ──
create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_id uuid not null references public.customers (id),
  card_id uuid references public.loyalty_cards (id),
  order_id uuid references public.orders (id),
  type text not null check (type in (
    'gain', 'utilisation_recompense', 'ajustement',
    'bonus_bienvenue', 'bonus_anniversaire', 'bonus_relance', 'expiration'
  )),
  points_delta integer not null,          -- positif ou negatif
  solde_apres integer not null,           -- snapshot pour audit facile
  description text,
  cree_par uuid references public.profiles (id),
  cree_le timestamptz not null default now()
);

create index loyalty_transactions_customer_idx on public.loyalty_transactions (customer_id);

-- ── TABLE: rewards (catalogue de recompenses) ────────────────
create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,
  description text,
  cout_points integer not null,
  type text not null check (type in ('produit_offert', 'reduction_pourcent', 'reduction_montant', 'cadeau')),
  valeur numeric(10, 2),
  actif boolean not null default true,
  cree_le timestamptz not null default now()
);

-- ── TABLE: customer_rewards (recompenses obtenues/utilisees) ─
create table public.customer_rewards (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_id uuid not null references public.customers (id),
  reward_id uuid not null references public.rewards (id),
  statut text not null default 'disponible' check (statut in ('disponible', 'utilisee', 'expiree')),
  obtenue_le timestamptz not null default now(),
  utilisee_le timestamptz,
  order_id uuid references public.orders (id),
  expire_le timestamptz
);

-- ── Liens sur la table orders existante ──────────────────────
alter table public.orders
  add column customer_id uuid references public.customers (id),
  add column card_id uuid references public.loyalty_cards (id),
  add column points_gagnes integer,
  add column points_utilises integer;

-- ============================================================
-- Row Level Security — meme convention que le reste du schema
-- ============================================================
alter table public.customers enable row level security;
alter table public.loyalty_tiers enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.loyalty_card_events enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.rewards enable row level security;
alter table public.customer_rewards enable row level security;

-- (repeter le schema de policies select/insert/update/delete
--  "restaurant_id = public.current_restaurant_id()" pour chaque table,
--  a l'identique de celles deja definies pour products/orders)
```

Points de conception à retenir sur ce schéma :
- `customers.points_balance` / `total_depense` / `nombre_visites` sont des **caches** recalculés à chaque `loyalty_transactions`/commande — jamais modifiés à la main, toujours via la fonction serveur qui écrit aussi la ligne de ledger correspondante (garantit qu'ils ne divergent jamais).
- `loyalty_transactions.solde_apres` fige le solde au moment du mouvement : permet d'auditer/reconstituer l'historique sans recalculer, et de détecter instantanément une incohérence.
- `orders.customer_id` / `card_id` / `points_gagnes` / `points_utilises` sont dénormalisés sur la commande pour l'impression du ticket et les exports, sans dépendre d'une jointure supplémentaire.

---

## 8. Expérience "waouh"

- Animation d'entrée de la popup (scale + fade, ~200 ms) + petit son de validation ("ding") au scan réussi.
- Barre de progression visuelle vers la prochaine récompense (`120/150 pts`), plus motivante qu'un simple chiffre.
- Message contextuel personnalisé : anniversaire, palier tout juste atteint, relance après absence ("Ça faisait un moment, -10% pour ton retour 👋").
- Petit récap mensuel affichable en caisse ou envoyé par SMS/email : "Ce mois-ci tu as gagné 340 pts et économisé 12 €".
- Confettis/légère célébration lors d'un passage de palier (Argent → Or) ou du déblocage d'une récompense — moment "à la Starbucks/Apple Wallet".
- QR code sur le ticket de caisse pointant vers un mini compte client en ligne (solde, récompenses, historique) pour ceux qui veulent consulter sans repasser en caisse.

---

## 9. Bonus — au-delà de la carte NFC

- **Numéro de téléphone en repli** : si le client a oublié sa carte, recherche par téléphone en caisse. Complète le NFC plutôt que de le remplacer — la carte reste le chemin rapide par défaut, le téléphone est le filet de sécurité.
- **QR code personnel** (sur reçu ou envoyé par SMS à l'inscription) : utile pour les clients pas encore équipés d'une carte physique, ou en cas d'oubli.
- **Apple Wallet / Google Wallet (carte virtuelle)** — piste à explorer en phase 2 : un pass numérique dans le portefeuille du téléphone, avec QR/code-barres scanné en caisse. Effet "grande chaîne" fort (Starbucks, McDonald's le font), zéro coût matériel côté client, mais nécessite un peu d'intégration (génération de pass .pkpass / Google Wallet API) — à ne pas mélanger avec le NFC "tap" bancaire, qui est un tout autre niveau de complexité/certification et n'apporte pas grand-chose de plus ici.
- **Reconnaissance faciale/table** : volontairement écartée — trop intrusive, coûteuse, et disproportionnée au regard du RGPD pour un gain d'usage marginal par rapport à une carte NFC déjà quasi instantanée.

---

## 10. Résumé — pourquoi ce design est "évolutif"

Chaque axe de complexité future est déjà une **ligne en base**, pas une **évolution de code** :
- Ajouter un palier → une ligne dans `loyalty_tiers`.
- Ajouter une récompense → une ligne dans `rewards`.
- Changer le taux de points → un paramètre de configuration restaurant (à ajouter dans une future table `loyalty_settings` si plusieurs restaurants veulent des taux différents).
- Ajouter un nouveau canal d'identification (QR, wallet) → une nouvelle valeur possible pointant vers le même `customer_id`, sans toucher au modèle de points.

Le seul invariant volontairement rigide : **les points vivent sur le client, jamais sur le support physique.** C'est ce choix qui rend tout le reste (perte de carte, changement de support, extension future) simple.
