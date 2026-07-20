-- ============================================================
-- Migration 003 : statut de stock des produits (rupture)
-- A executer dans Supabase > SQL Editor (en plus de schema.sql
-- et migration_002)
--
-- Le catalogue produits (noms/prix/description) reste en dur dans
-- l'app pour l'instant - cette table stocke juste, par restaurant,
-- quels produits sont actuellement en rupture, pour que ce soit
-- partage entre tous les appareils du restaurant.
-- ============================================================

create table public.product_stock (
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  product_id text not null,
  en_rupture boolean not null default true,
  maj_le timestamptz not null default now(),
  primary key (restaurant_id, product_id)
);

alter table public.product_stock enable row level security;

create policy "voir_stock_restaurant" on public.product_stock
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_stock_restaurant" on public.product_stock
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "modifier_stock_restaurant" on public.product_stock
  for update using (restaurant_id = public.current_restaurant_id());
create policy "supprimer_stock_restaurant" on public.product_stock
  for delete using (restaurant_id = public.current_restaurant_id());
