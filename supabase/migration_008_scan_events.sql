-- ============================================================
-- Migration 008 : evenements de scan fidelite persistants
-- A executer dans Supabase > SQL Editor (en plus des migrations
-- precedentes)
--
-- Remplace le relais "broadcast" ephemere entre /scan et la caisse
-- par une vraie table : un scan envoye AVANT que la caisse ne soit
-- ouverte/connectee n'est plus perdu (la caisse peut le relire au
-- demarrage), contrairement a un message "broadcast" qui disparait
-- s'il n'y a personne pour l'ecouter au moment exact ou il est
-- envoye. Corrige le preremplissage manquant du client fidelite
-- quand le scan (/gestion/scan) et la caisse (/) sont deux pages
-- separees, ouvertes l'une apres l'autre.
-- ============================================================

create table public.loyalty_scan_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_id uuid not null references public.customers (id),
  card_id uuid not null references public.loyalty_cards (id),
  cree_le timestamptz not null default now()
);

create index loyalty_scan_events_restaurant_idx
  on public.loyalty_scan_events (restaurant_id, cree_le desc);

alter table public.loyalty_scan_events enable row level security;

create policy "voir_scans_restaurant" on public.loyalty_scan_events
  for select using (restaurant_id = public.current_restaurant_id());
create policy "creer_scans_restaurant" on public.loyalty_scan_events
  for insert with check (restaurant_id = public.current_restaurant_id());
create policy "supprimer_scans_restaurant" on public.loyalty_scan_events
  for delete using (restaurant_id = public.current_restaurant_id());

-- Necessaire pour que la caisse recoive les nouveaux scans en direct
-- (en plus de pouvoir rattraper les recents au demarrage).
alter publication supabase_realtime add table public.loyalty_scan_events;
