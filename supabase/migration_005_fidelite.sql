-- ============================================================
-- Migration 005 : systeme de fidelite (cartes NFC / QR)
-- A executer dans Supabase > SQL Editor (en plus de schema.sql
-- et des migrations precedentes)
--
-- Voir docs/fidelite-nfc.md pour le detail du fonctionnement.
-- Principe cle : les points vivent sur le client (customers),
-- jamais sur le support physique (carte NFC ou QR) - remplacer
-- une carte perdue ne fait donc jamais perdre de points.
-- ============================================================

-- ── TABLE: loyalty_tiers (paliers Standard/Or...) ────────────
create table public.loyalty_tiers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,
  ordre integer not null default 0,
  seuil_depense_12_mois numeric(10, 2) not null default 0,
  multiplicateur_points numeric(4, 2) not null default 1.0,
  avantages jsonb not null default '[]'::jsonb,
  cree_le timestamptz not null default now()
);

create index loyalty_tiers_restaurant_id_idx on public.loyalty_tiers (restaurant_id);

-- ── TABLE: customers (clients du programme fidelite) ─────────
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  prenom text not null,
  nom text,
  telephone text,
  email text,
  date_naissance date,
  tier_id uuid references public.loyalty_tiers (id),
  points_balance integer not null default 0,
  total_depense numeric(10, 2) not null default 0,
  nombre_visites integer not null default 0,
  derniere_visite_le timestamptz,
  consentement_rgpd boolean not null default false,
  anonymise boolean not null default false,
  cree_le timestamptz not null default now()
);

create index customers_restaurant_id_idx on public.customers (restaurant_id);
create unique index customers_telephone_restaurant_idx
  on public.customers (restaurant_id, telephone) where telephone is not null and not anonymise;

-- ── TABLE: loyalty_cards (carte NFC ou QR d'un client) ───────
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

create index loyalty_card_events_card_id_idx on public.loyalty_card_events (card_id);

-- ── TABLE: rewards (catalogue de recompenses) ─────────────────
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

create index rewards_restaurant_id_idx on public.rewards (restaurant_id);

-- ── TABLE: loyalty_transactions (ledger, source de verite) ───
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
  points_delta integer not null,
  solde_apres integer not null,
  description text,
  cree_par uuid references public.profiles (id),
  cree_le timestamptz not null default now()
);

create index loyalty_transactions_customer_id_idx on public.loyalty_transactions (customer_id);
create index loyalty_transactions_restaurant_id_idx on public.loyalty_transactions (restaurant_id);

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

create index customer_rewards_customer_id_idx on public.customer_rewards (customer_id);

-- ── Liens sur la table orders existante ───────────────────────
alter table public.orders
  add column if not exists customer_id uuid references public.customers (id),
  add column if not exists card_id uuid references public.loyalty_cards (id),
  add column if not exists points_gagnes integer,
  add column if not exists points_utilises integer;

create index if not exists orders_customer_id_idx on public.orders (customer_id);

-- ============================================================
-- Row Level Security - meme convention que schema.sql
-- ============================================================

alter table public.loyalty_tiers enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.loyalty_card_events enable row level security;
alter table public.rewards enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.customer_rewards enable row level security;

-- loyalty_tiers
create policy "voir_paliers_restaurant" on public.loyalty_tiers
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_paliers_restaurant" on public.loyalty_tiers
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_paliers_restaurant" on public.loyalty_tiers
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_paliers_restaurant" on public.loyalty_tiers
  for delete using (restaurant_id = public.current_restaurant_id());

-- customers
create policy "voir_clients_restaurant" on public.customers
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_clients_restaurant" on public.customers
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_clients_restaurant" on public.customers
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_clients_restaurant" on public.customers
  for delete using (restaurant_id = public.current_restaurant_id());

-- loyalty_cards
create policy "voir_cartes_restaurant" on public.loyalty_cards
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_cartes_restaurant" on public.loyalty_cards
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_cartes_restaurant" on public.loyalty_cards
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_cartes_restaurant" on public.loyalty_cards
  for delete using (restaurant_id = public.current_restaurant_id());

-- loyalty_card_events
create policy "voir_evenements_cartes_restaurant" on public.loyalty_card_events
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_evenements_cartes_restaurant" on public.loyalty_card_events
  for insert with check (restaurant_id = public.current_restaurant_id());

-- rewards
create policy "voir_recompenses_restaurant" on public.rewards
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_recompenses_restaurant" on public.rewards
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_recompenses_restaurant" on public.rewards
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_recompenses_restaurant" on public.rewards
  for delete using (restaurant_id = public.current_restaurant_id());

-- loyalty_transactions (pas de update/delete : ledger immuable)
create policy "voir_transactions_restaurant" on public.loyalty_transactions
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_transactions_restaurant" on public.loyalty_transactions
  for insert with check (restaurant_id = public.current_restaurant_id());

-- customer_rewards
create policy "voir_recompenses_client_restaurant" on public.customer_rewards
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_recompenses_client_restaurant" on public.customer_rewards
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_recompenses_client_restaurant" on public.customer_rewards
  for update using (restaurant_id = public.current_restaurant_id());
