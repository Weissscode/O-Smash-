-- ============================================================
-- O'SMASH SaaS — schema multi-restaurants + Row Level Security
-- A executer dans Supabase > SQL Editor
-- ============================================================

-- ── TABLE: restaurants ──────────────────────────────────────
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email_contact text,
  plan text not null default 'essai',
  cree_le timestamptz not null default now()
);

-- ── TABLE: profiles (compte d'un gerant/staff, lie a l'auth Supabase) ──
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  restaurant_id uuid references public.restaurants (id) on delete cascade,
  email text not null,
  role text not null default 'staff' check (role in ('gerant', 'staff')),
  cree_le timestamptz not null default now()
);

-- ── TABLE: products ──────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,
  prix numeric(10, 2) not null,
  categorie text,
  en_rupture boolean not null default false,
  cree_le timestamptz not null default now()
);

-- ── TABLE: orders ────────────────────────────────────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  total numeric(10, 2) not null default 0,
  payment text,
  service text,
  phone text,
  client text,
  status text not null default 'en cours',
  cree_le timestamptz not null default now()
);

create index orders_restaurant_id_idx on public.orders (restaurant_id);
create index products_restaurant_id_idx on public.products (restaurant_id);
create index profiles_restaurant_id_idx on public.profiles (restaurant_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Fonction utilitaire : donne le restaurant_id de l'utilisateur connecte
create or replace function public.current_restaurant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select restaurant_id from public.profiles where id = auth.uid()
$$;

alter table public.restaurants enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- restaurants : chacun voit uniquement SON restaurant
create policy "voir_son_restaurant" on public.restaurants
  for select using (id = public.current_restaurant_id());

-- restaurants : un nouvel utilisateur authentifie peut creer un restaurant (inscription)
create policy "creer_restaurant_inscription" on public.restaurants
  for insert with check (auth.uid() is not null);

-- profiles : chacun voit les profils de SON restaurant (collegues)
create policy "voir_profils_meme_restaurant" on public.profiles
  for select using (restaurant_id = public.current_restaurant_id());

-- profiles : chacun peut creer uniquement SON propre profil
create policy "creer_son_profil" on public.profiles
  for insert with check (id = auth.uid());

-- profiles : chacun peut modifier uniquement SON propre profil
create policy "modifier_son_profil" on public.profiles
  for update using (id = auth.uid());

-- products : lecture/ecriture limitees a SON restaurant
create policy "voir_produits_restaurant" on public.products
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_produits_restaurant" on public.products
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_produits_restaurant" on public.products
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_produits_restaurant" on public.products
  for delete using (restaurant_id = public.current_restaurant_id());

-- orders : lecture/ecriture limitees a SON restaurant
create policy "voir_commandes_restaurant" on public.orders
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_commandes_restaurant" on public.orders
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_commandes_restaurant" on public.orders
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_commandes_restaurant" on public.orders
  for delete using (restaurant_id = public.current_restaurant_id());
