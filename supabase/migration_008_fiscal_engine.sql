-- ============================================================
-- Migration 008 : environnement TEST / PRODUCTION + Fiscal Engine (FR)
--
-- !!! NE PAS EXECUTER SUR LA BASE DE PRODUCTION SANS VALIDATION !!!
-- A tester d'abord sur un projet Supabase de dev/staging.
--
-- Principe :
--  * restaurants.environment : 'test' | 'production'
--  * restaurants.fiscal_profile : 'NONE' | 'FR'
--  * TEST       -> table orders_test (aucun ledger fiscal)
--  * PRODUCTION -> table orders ; si profil FR : ledger fiscal chaine
--                  (SHA-256), commandes verrouillees, clotures, archives.
--  * Le profil FR ne peut plus etre desactive : garanti par des
--    triggers PostgreSQL (pas par React).
--
-- Non destructif : uniquement des ajouts. Les restaurants existants
-- passent en environment='production' + fiscal_profile='NONE', donc
-- leur comportement actuel est inchange tant que le profil FR n'est
-- pas active explicitement (RPC activate_fiscal_fr).
--
-- ATTENTION : les regles de TVA (taux par defaut 10 %), le calcul des
-- clotures et l'archivage ci-dessous sont une base technique. Ils
-- DOIVENT etre valides par un expert (NF525 / attestation editeur /
-- certification) avant d'etre presentes comme conformes.
-- ============================================================

begin;

-- ── 1. restaurants : environnement et profil fiscal ─────────
alter table public.restaurants
  add column if not exists environment text not null default 'production'
    check (environment in ('test', 'production')),
  add column if not exists fiscal_profile text not null default 'NONE'
    check (fiscal_profile in ('NONE', 'FR')),
  add column if not exists fiscal_activated_at timestamptz,
  add column if not exists fiscal_default_vat_rate numeric(5, 2) not null default 10.00;

-- Les lignes existantes viennent de passer en 'production' (comportement
-- actuel conserve). Les NOUVEAUX restaurants demarrent en TEST.
alter table public.restaurants alter column environment set default 'test';

-- Drapeau transactionnel pose uniquement par les fonctions fiscales
-- SECURITY DEFINER ci-dessous. Un client PostgREST ne peut pas le poser.
create or replace function public.fiscal_bypass_on()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(current_setting('vice.fiscal_rpc', true), '') = 'on'
$$;

create or replace function public.restaurant_environment(p_restaurant_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select r.environment from public.restaurants r where r.id = p_restaurant_id
$$;

create or replace function public.restaurant_fiscal_active(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select r.environment = 'production' and r.fiscal_profile = 'FR'
       from public.restaurants r where r.id = p_restaurant_id),
    false)
$$;

revoke all on function public.fiscal_bypass_on() from public;
revoke all on function public.restaurant_environment(uuid) from public;
revoke all on function public.restaurant_fiscal_active(uuid) from public;
grant execute on function public.restaurant_environment(uuid) to authenticated;
grant execute on function public.restaurant_fiscal_active(uuid) to authenticated;

-- A la creation depuis un client : toujours TEST / fiscalite OFF.
create or replace function public.restaurants_safe_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    new.environment := 'test';
    new.fiscal_profile := 'NONE';
    new.fiscal_activated_at := null;
    new.fiscal_default_vat_rate := 10.00;
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_safe_insert on public.restaurants;
create trigger restaurants_safe_insert
  before insert on public.restaurants
  for each row execute function public.restaurants_safe_insert();

-- Verrou : le profil FR est irreversible, et les colonnes fiscales ne
-- changent que via les RPC fiscales.
create or replace function public.restaurants_fiscal_protect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.fiscal_profile = 'FR' then
    if new.fiscal_profile <> 'FR'
       or new.environment <> 'production'
       or new.fiscal_activated_at is distinct from old.fiscal_activated_at then
      raise exception 'FISCAL_LOCKED: le profil fiscal FR est irreversible et ne peut pas etre desactive'
        using errcode = 'FS001';
    end if;
  end if;

  if (new.environment is distinct from old.environment
      or new.fiscal_profile is distinct from old.fiscal_profile
      or new.fiscal_activated_at is distinct from old.fiscal_activated_at
      or new.fiscal_default_vat_rate is distinct from old.fiscal_default_vat_rate)
     and not public.fiscal_bypass_on() then
    raise exception 'FISCAL_FORBIDDEN: parametres fiscaux modifiables uniquement via les fonctions dediees'
      using errcode = 'FS002';
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_fiscal_protect on public.restaurants;
create trigger restaurants_fiscal_protect
  before update on public.restaurants
  for each row execute function public.restaurants_fiscal_protect();

-- ── 2. Tables de commandes TEST ─────────────────────────────
-- Meme structure que orders (copiee AVANT l'ajout des colonnes fiscales).
create table if not exists public.orders_test
  (like public.orders including defaults including constraints including indexes);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders_test'::regclass and contype = 'f'
      and conname = 'orders_test_restaurant_id_fkey'
  ) then
    alter table public.orders_test
      add constraint orders_test_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;
end $$;

create table if not exists public.order_counters_test (
  restaurant_id uuid primary key references public.restaurants (id) on delete cascade,
  last_num integer not null default 0
);

alter table public.orders_test enable row level security;
alter table public.order_counters_test enable row level security;

drop policy if exists "voir_commandes_test_restaurant" on public.orders_test;
drop policy if exists "creer_commandes_test_restaurant" on public.orders_test;
drop policy if exists "modifier_commandes_test_restaurant" on public.orders_test;
drop policy if exists "supprimer_commandes_test_restaurant" on public.orders_test;

create policy "voir_commandes_test_restaurant" on public.orders_test
  for select to authenticated
  using (restaurant_id = public.current_restaurant_id());
-- Ecriture TEST uniquement tant que le restaurant est reellement en TEST :
-- impossible de contourner le ledger en ecrivant ses ventes ici en prod.
create policy "creer_commandes_test_restaurant" on public.orders_test
  for insert to authenticated
  with check (restaurant_id = public.current_restaurant_id()
              and public.restaurant_environment(restaurant_id) = 'test');
create policy "modifier_commandes_test_restaurant" on public.orders_test
  for update to authenticated
  using (restaurant_id = public.current_restaurant_id()
         and public.restaurant_environment(restaurant_id) = 'test')
  with check (restaurant_id = public.current_restaurant_id()
              and public.restaurant_environment(restaurant_id) = 'test');
create policy "supprimer_commandes_test_restaurant" on public.orders_test
  for delete to authenticated
  using (restaurant_id = public.current_restaurant_id()
         and public.restaurant_environment(restaurant_id) = 'test');

drop policy if exists "voir_son_compteur_test" on public.order_counters_test;
create policy "voir_son_compteur_test" on public.order_counters_test
  for select to authenticated
  using (restaurant_id = public.current_restaurant_id());

-- Impression temps reel (server.js) egalement pour la table TEST.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders_test'
     ) then
    alter publication supabase_realtime add table public.orders_test;
  end if;
end $$;

-- Table de production : on n'y ecrit qu'en environnement 'production'.
drop policy if exists "creer_commandes_restaurant" on public.orders;
create policy "creer_commandes_restaurant" on public.orders
  for insert with check (
    restaurant_id = public.current_restaurant_id()
    and public.restaurant_environment(restaurant_id) = 'production'
  );

-- Colonnes de verrouillage fiscal (production uniquement).
alter table public.orders
  add column if not exists fiscal_locked_at timestamptz,
  add column if not exists fiscal_ledger_id uuid;

-- Numero de commande : compteur distinct en TEST (ne pollue jamais la
-- numerotation reelle).
create or replace function public.next_order_num(p_restaurant_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num integer;
  v_env text;
begin
  if p_restaurant_id <> public.current_restaurant_id() then
    raise exception 'restaurant_id ne correspond pas a l''utilisateur connecte';
  end if;

  select environment into v_env from public.restaurants where id = p_restaurant_id;

  if v_env = 'test' then
    insert into public.order_counters_test (restaurant_id, last_num)
    values (p_restaurant_id, 1)
    on conflict (restaurant_id)
    do update set last_num = public.order_counters_test.last_num + 1
    returning last_num into v_num;
  else
    insert into public.order_counters (restaurant_id, last_num)
    values (p_restaurant_id, 1)
    on conflict (restaurant_id)
    do update set last_num = public.order_counters.last_num + 1
    returning last_num into v_num;
  end if;

  return v_num;
end;
$$;

grant execute on function public.next_order_num(uuid) to authenticated;

-- ── 3. Ledger fiscal ────────────────────────────────────────
create table if not exists public.fiscal_ledger_heads (
  restaurant_id uuid primary key references public.restaurants (id) on delete restrict,
  last_seq bigint not null default 0,
  last_hash text not null default repeat('0', 64)
);

create table if not exists public.fiscal_ledger (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  seq bigint not null,
  event_type text not null check (event_type in
    ('activation', 'sale', 'cancellation', 'closing', 'archive')),
  order_id uuid,
  order_num integer,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default clock_timestamp(),
  payment text,
  service text,
  total_ttc numeric(12, 2) not null default 0,
  total_ht numeric(12, 2) not null default 0,
  total_tva numeric(12, 2) not null default 0,
  vat_breakdown jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  previous_hash text not null,
  hash text not null,
  unique (restaurant_id, seq)
);

-- Une seule vente et une seule annulation par commande.
create unique index if not exists fiscal_ledger_one_sale_per_order
  on public.fiscal_ledger (order_id) where event_type = 'sale';
create unique index if not exists fiscal_ledger_one_cancel_per_order
  on public.fiscal_ledger (order_id) where event_type = 'cancellation';

create table if not exists public.fiscal_closings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  kind text not null check (kind in ('daily', 'monthly', 'annual')),
  closing_number bigint not null,
  period_start date not null,
  period_end date not null,
  first_seq bigint not null,
  last_seq bigint not null,
  sales_count integer not null default 0,
  cancellations_count integer not null default 0,
  total_ttc numeric(14, 2) not null default 0,
  total_ht numeric(14, 2) not null default 0,
  total_tva numeric(14, 2) not null default 0,
  vat_breakdown jsonb not null default '[]'::jsonb,
  payments_breakdown jsonb not null default '{}'::jsonb,
  grand_total_ttc numeric(16, 2) not null default 0,
  previous_hash text not null,
  hash text not null,
  closed_by uuid,
  closed_at timestamptz not null default clock_timestamp(),
  unique (restaurant_id, kind, period_start),
  unique (restaurant_id, kind, closing_number)
);

create table if not exists public.fiscal_archives (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  period_start date not null,
  period_end date not null,
  first_seq bigint not null,
  last_seq bigint not null,
  entry_count integer not null,
  content_hash text not null,
  created_by uuid,
  created_at timestamptz not null default clock_timestamp()
);

-- Append-only : aucune modification / suppression / TRUNCATE, pour aucun role.
create or replace function public.fiscal_forbid_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'FISCAL_IMMUTABLE: % interdit sur %', tg_op, tg_table_name
    using errcode = 'FS003';
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['fiscal_ledger', 'fiscal_closings', 'fiscal_archives'] loop
    execute format('drop trigger if exists %I_no_mutation on public.%I', t, t);
    execute format(
      'create trigger %I_no_mutation before update or delete on public.%I
         for each row execute function public.fiscal_forbid_mutation()', t, t);
    execute format('drop trigger if exists %I_no_truncate on public.%I', t, t);
    execute format(
      'create trigger %I_no_truncate before truncate on public.%I
         for each statement execute function public.fiscal_forbid_mutation()', t, t);
  end loop;
end $$;

-- RLS : lecture reservee au gerant de son restaurant, aucune ecriture directe.
alter table public.fiscal_ledger_heads enable row level security;
alter table public.fiscal_ledger enable row level security;
alter table public.fiscal_closings enable row level security;
alter table public.fiscal_archives enable row level security;

drop policy if exists "gerant_voit_ledger" on public.fiscal_ledger;
drop policy if exists "gerant_voit_heads" on public.fiscal_ledger_heads;
drop policy if exists "gerant_voit_clotures" on public.fiscal_closings;
drop policy if exists "gerant_voit_archives" on public.fiscal_archives;
create policy "gerant_voit_ledger" on public.fiscal_ledger
  for select to authenticated
  using (restaurant_id = public.current_restaurant_id() and public.is_current_user_gerant());
create policy "gerant_voit_heads" on public.fiscal_ledger_heads
  for select to authenticated
  using (restaurant_id = public.current_restaurant_id() and public.is_current_user_gerant());
create policy "gerant_voit_clotures" on public.fiscal_closings
  for select to authenticated
  using (restaurant_id = public.current_restaurant_id() and public.is_current_user_gerant());
create policy "gerant_voit_archives" on public.fiscal_archives
  for select to authenticated
  using (restaurant_id = public.current_restaurant_id() and public.is_current_user_gerant());

revoke all on public.fiscal_ledger_heads from public, anon, authenticated;
revoke all on public.fiscal_ledger from public, anon, authenticated;
revoke all on public.fiscal_closings from public, anon, authenticated;
revoke all on public.fiscal_archives from public, anon, authenticated;
grant select on public.fiscal_ledger_heads to authenticated;
grant select on public.fiscal_ledger to authenticated;
grant select on public.fiscal_closings to authenticated;
grant select on public.fiscal_archives to authenticated;

-- ── 4. Fonctions internes du moteur ─────────────────────────
create or replace function public.fiscal_entry_hash(
  p_prev text, p_seq bigint, p_type text, p_restaurant uuid, p_order uuid,
  p_num integer, p_occurred timestamptz, p_recorded timestamptz,
  p_payment text, p_service text, p_ttc numeric, p_ht numeric, p_tva numeric,
  p_vat jsonb, p_payload jsonb
) returns text
language sql
stable
set search_path = ''
as $$
  select encode(sha256(convert_to(concat_ws('|',
    p_prev, p_seq::text, p_type, p_restaurant::text,
    coalesce(p_order::text, ''), coalesce(p_num::text, ''),
    to_char(p_occurred at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US'),
    to_char(p_recorded at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US'),
    coalesce(p_payment, ''), coalesce(p_service, ''),
    p_ttc::text, p_ht::text, p_tva::text, p_vat::text, p_payload::text
  ), 'UTF8')), 'hex')
$$;

-- Ventilation TVA d'une commande. Les prix de la caisse sont TTC. Taux par
-- ligne via item.vat_rate, sinon taux par defaut du restaurant.
-- (REGLE A VALIDER : 10 % / 5,5 % / 20 % selon produit et service.)
create or replace function public.fiscal_vat_breakdown(p_items jsonb, p_default_rate numeric)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with lines as (
    select coalesce((i ->> 'vat_rate')::numeric, p_default_rate) as rate,
           coalesce((i ->> 'total')::numeric, 0) as ttc
    from jsonb_array_elements(
      case when jsonb_typeof(p_items) = 'array' then p_items else '[]'::jsonb end) i
  ), grouped as (
    select rate, round(sum(ttc), 2) as ttc from lines group by rate
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'rate', rate,
      'ttc', ttc,
      'ht', round(ttc / (1 + rate / 100), 2),
      'tva', ttc - round(ttc / (1 + rate / 100), 2)
    ) order by rate), '[]'::jsonb)
  from grouped
$$;

create or replace function public.fiscal_sum_key(p_breakdown jsonb, p_key text)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select coalesce(sum((e ->> p_key)::numeric), 0)
  from jsonb_array_elements(p_breakdown) e
$$;

-- Ajoute une ecriture au ledger (verrou de la tete de chaine = ecritures
-- strictement sequentielles, sans trou). Interne : non appelable par les clients.
create or replace function public.fiscal_append(
  p_restaurant uuid, p_type text, p_order uuid, p_num integer,
  p_occurred timestamptz, p_payment text, p_service text,
  p_vat jsonb, p_payload jsonb
) returns public.fiscal_ledger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_head public.fiscal_ledger_heads;
  v_row public.fiscal_ledger;
  v_ttc numeric(12, 2);
  v_ht numeric(12, 2);
  v_tva numeric(12, 2);
  v_rec timestamptz := clock_timestamp();
begin
  insert into public.fiscal_ledger_heads (restaurant_id)
  values (p_restaurant) on conflict (restaurant_id) do nothing;

  select * into v_head from public.fiscal_ledger_heads
   where restaurant_id = p_restaurant for update;

  v_ttc := round(public.fiscal_sum_key(p_vat, 'ttc'), 2);
  v_ht := round(public.fiscal_sum_key(p_vat, 'ht'), 2);
  v_tva := round(public.fiscal_sum_key(p_vat, 'tva'), 2);

  v_row.id := gen_random_uuid();
  v_row.restaurant_id := p_restaurant;
  v_row.seq := v_head.last_seq + 1;
  v_row.event_type := p_type;
  v_row.order_id := p_order;
  v_row.order_num := p_num;
  v_row.occurred_at := p_occurred;
  v_row.recorded_at := v_rec;
  v_row.payment := p_payment;
  v_row.service := p_service;
  v_row.total_ttc := v_ttc;
  v_row.total_ht := v_ht;
  v_row.total_tva := v_tva;
  v_row.vat_breakdown := p_vat;
  v_row.payload := p_payload;
  v_row.previous_hash := v_head.last_hash;
  v_row.hash := public.fiscal_entry_hash(
    v_head.last_hash, v_row.seq, p_type, p_restaurant, p_order, p_num,
    p_occurred, v_rec, p_payment, p_service, v_ttc, v_ht, v_tva, p_vat, p_payload);

  insert into public.fiscal_ledger values (v_row.*);
  update public.fiscal_ledger_heads
     set last_seq = v_row.seq, last_hash = v_row.hash
   where restaurant_id = p_restaurant;
  return v_row;
end;
$$;

revoke all on function public.fiscal_append(uuid, text, uuid, integer, timestamptz, text, text, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.fiscal_entry_hash(text, bigint, text, uuid, uuid, integer, timestamptz, timestamptz, text, text, numeric, numeric, numeric, jsonb, jsonb) from public, anon, authenticated;

-- ── 5. Garde-fou sur orders (vente = ecriture ledger + verrou) ──
create or replace function public.orders_fiscal_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rest public.restaurants;
  v_sale boolean;
  v_vat jsonb;
  v_entry public.fiscal_ledger;
  v_ignored text[] := array['print_request', 'print_error', 'points_gagnes',
                            'points_utilises', 'status'];
begin
  if tg_op = 'DELETE' then
    if old.fiscal_locked_at is not null and not public.fiscal_bypass_on() then
      raise exception 'FISCAL_LOCKED: une vente enregistree ne peut pas etre supprimee (utiliser l''annulation tracee)'
        using errcode = 'FS001';
    end if;
    return old;
  end if;

  if public.fiscal_bypass_on() then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.fiscal_locked_at is not null then
    if (to_jsonb(new) - v_ignored) is distinct from (to_jsonb(old) - v_ignored) then
      raise exception 'FISCAL_LOCKED: vente verrouillee, modification refusee (montants, articles, paiement, date...)'
        using errcode = 'FS001';
    end if;
    if new.status in ('annulee', 'en attente', 'test') then
      raise exception 'FISCAL_LOCKED: changement de statut refuse, utiliser l''annulation tracee'
        using errcode = 'FS001';
    end if;
    return new;
  end if;

  -- Un client ne peut jamais poser lui-meme le verrou.
  new.fiscal_locked_at := null;
  new.fiscal_ledger_id := null;

  select * into v_rest from public.restaurants where id = new.restaurant_id;
  if not (v_rest.environment = 'production' and v_rest.fiscal_profile = 'FR') then
    return new;
  end if;

  v_sale := new.payment is not null and btrim(new.payment) <> ''
            and coalesce(new.status, '') not in ('en attente', 'test', 'annulee');
  if not v_sale then
    return new;
  end if;

  v_vat := public.fiscal_vat_breakdown(new.items, v_rest.fiscal_default_vat_rate);
  v_entry := public.fiscal_append(
    new.restaurant_id, 'sale', new.id, new.num, new.cree_le,
    new.payment, new.service, v_vat,
    jsonb_build_object(
      'order_total', new.total,
      'items_total_mismatch', round(public.fiscal_sum_key(v_vat, 'ttc'), 2) <> round(new.total, 2),
      'items', new.items,
      'client', new.client,
      'split_of', new.split_of
    ));
  new.fiscal_locked_at := clock_timestamp();
  new.fiscal_ledger_id := v_entry.id;
  return new;
end;
$$;

drop trigger if exists orders_fiscal_guard on public.orders;
create trigger orders_fiscal_guard
  before insert or update or delete on public.orders
  for each row execute function public.orders_fiscal_guard();

-- ── 6. RPC : gestion de l'environnement ─────────────────────
create or replace function public.set_restaurant_environment(p_env text)
returns public.restaurants
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.current_restaurant_id();
  v_rest public.restaurants;
begin
  if v_rid is null or not public.is_current_user_gerant() then
    raise exception 'FISCAL_FORBIDDEN: reserve au gerant' using errcode = 'FS002';
  end if;
  if p_env not in ('test', 'production') then
    raise exception 'environnement invalide';
  end if;

  select * into v_rest from public.restaurants where id = v_rid for update;
  if v_rest.fiscal_profile = 'FR' and p_env <> 'production' then
    raise exception 'FISCAL_LOCKED: un restaurant en profil fiscal FR ne peut pas repasser en TEST'
      using errcode = 'FS001';
  end if;

  perform set_config('vice.fiscal_rpc', 'on', true);
  update public.restaurants set environment = p_env where id = v_rid returning * into v_rest;
  return v_rest;
end;
$$;

create or replace function public.activate_fiscal_fr(p_confirm text)
returns public.restaurants
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.current_restaurant_id();
  v_rest public.restaurants;
begin
  if v_rid is null or not public.is_current_user_gerant() then
    raise exception 'FISCAL_FORBIDDEN: reserve au gerant' using errcode = 'FS002';
  end if;
  if p_confirm is distinct from 'ACTIVER' then
    raise exception 'FISCAL_CONFIRM: confirmation attendue (ACTIVER)' using errcode = 'FS004';
  end if;

  select * into v_rest from public.restaurants where id = v_rid for update;
  if v_rest.fiscal_profile = 'FR' then
    return v_rest; -- idempotent
  end if;
  if v_rest.environment <> 'production' then
    raise exception 'FISCAL_ENV: passer d''abord en PRODUCTION' using errcode = 'FS004';
  end if;

  perform set_config('vice.fiscal_rpc', 'on', true);
  update public.restaurants
     set fiscal_profile = 'FR', fiscal_activated_at = clock_timestamp()
   where id = v_rid returning * into v_rest;

  perform public.fiscal_append(
    v_rid, 'activation', null, null, v_rest.fiscal_activated_at, null, null,
    '[]'::jsonb,
    jsonb_build_object('profile', 'FR', 'engine', 'vice-fiscal-engine/1',
                       'default_vat_rate', v_rest.fiscal_default_vat_rate,
                       'activated_by', auth.uid()));
  return v_rest;
end;
$$;

-- ── 7. RPC : annulation tracee d'une vente ──────────────────
create or replace function public.fiscal_cancel_order(p_order_id uuid, p_reason text)
returns public.fiscal_ledger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.current_restaurant_id();
  v_order public.orders;
  v_sale public.fiscal_ledger;
  v_neg jsonb;
  v_entry public.fiscal_ledger;
begin
  if v_rid is null or not public.is_current_user_gerant() then
    raise exception 'FISCAL_FORBIDDEN: reserve au gerant' using errcode = 'FS002';
  end if;
  if not public.restaurant_fiscal_active(v_rid) then
    raise exception 'FISCAL_ENV: fiscalite non active' using errcode = 'FS004';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 3 then
    raise exception 'FISCAL_REASON: motif obligatoire' using errcode = 'FS004';
  end if;

  select * into v_order from public.orders
   where id = p_order_id and restaurant_id = v_rid for update;
  if not found or v_order.fiscal_locked_at is null then
    raise exception 'FISCAL_NOT_FOUND: vente introuvable' using errcode = 'FS004';
  end if;
  if v_order.status = 'annulee' then
    raise exception 'FISCAL_ALREADY: vente deja annulee' using errcode = 'FS004';
  end if;

  select * into v_sale from public.fiscal_ledger
   where order_id = p_order_id and event_type = 'sale';

  select coalesce(jsonb_agg(jsonb_build_object(
           'rate', (e ->> 'rate')::numeric,
           'ttc', -((e ->> 'ttc')::numeric),
           'ht', -((e ->> 'ht')::numeric),
           'tva', -((e ->> 'tva')::numeric)) order by (e ->> 'rate')::numeric), '[]'::jsonb)
    into v_neg
    from jsonb_array_elements(v_sale.vat_breakdown) e;

  v_entry := public.fiscal_append(
    v_rid, 'cancellation', p_order_id, v_order.num, clock_timestamp(),
    v_order.payment, v_order.service, v_neg,
    jsonb_build_object('reason', btrim(p_reason), 'sale_seq', v_sale.seq,
                       'cancelled_by', auth.uid()));

  perform set_config('vice.fiscal_rpc', 'on', true);
  update public.orders set status = 'annulee' where id = p_order_id;
  return v_entry;
end;
$$;

-- ── 8. RPC : clotures ───────────────────────────────────────
create or replace function public.fiscal_require_manager()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_rid uuid := public.current_restaurant_id();
begin
  if v_rid is null or not public.is_current_user_gerant() then
    raise exception 'FISCAL_FORBIDDEN: reserve au gerant' using errcode = 'FS002';
  end if;
  if not public.restaurant_fiscal_active(v_rid) then
    raise exception 'FISCAL_ENV: fiscalite non active' using errcode = 'FS004';
  end if;
  return v_rid;
end;
$$;

create or replace function public.fiscal_closing_hash(c public.fiscal_closings)
returns text
language sql
stable
set search_path = ''
as $$
  select encode(sha256(convert_to(concat_ws('|',
    c.previous_hash, c.kind, c.restaurant_id::text, c.closing_number::text,
    c.period_start::text, c.period_end::text, c.first_seq::text, c.last_seq::text,
    c.sales_count::text, c.cancellations_count::text,
    c.total_ttc::text, c.total_ht::text, c.total_tva::text,
    c.vat_breakdown::text, c.payments_breakdown::text, c.grand_total_ttc::text
  ), 'UTF8')), 'hex')
$$;

-- Insere la cloture + trace dans le ledger. Interne.
create or replace function public.fiscal_store_closing(
  p_rid uuid, p_kind text, p_start date, p_end date, p_first bigint, p_last bigint,
  p_sales integer, p_cancels integer, p_ttc numeric, p_ht numeric, p_tva numeric,
  p_vat jsonb, p_pay jsonb
) returns public.fiscal_closings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prev public.fiscal_closings;
  v_row public.fiscal_closings;
begin
  select * into v_prev from public.fiscal_closings
   where restaurant_id = p_rid and kind = p_kind
   order by closing_number desc limit 1;

  v_row.id := gen_random_uuid();
  v_row.restaurant_id := p_rid;
  v_row.kind := p_kind;
  v_row.closing_number := coalesce(v_prev.closing_number, 0) + 1;
  v_row.period_start := p_start;
  v_row.period_end := p_end;
  v_row.first_seq := p_first;
  v_row.last_seq := p_last;
  v_row.sales_count := p_sales;
  v_row.cancellations_count := p_cancels;
  v_row.total_ttc := p_ttc;
  v_row.total_ht := p_ht;
  v_row.total_tva := p_tva;
  v_row.vat_breakdown := p_vat;
  v_row.payments_breakdown := p_pay;
  v_row.grand_total_ttc := coalesce(v_prev.grand_total_ttc, 0) + p_ttc;
  v_row.previous_hash := coalesce(v_prev.hash, repeat('0', 64));
  v_row.closed_by := auth.uid();
  v_row.closed_at := clock_timestamp();
  v_row.hash := public.fiscal_closing_hash(v_row);

  insert into public.fiscal_closings values (v_row.*);

  perform public.fiscal_append(
    p_rid, 'closing', null, null, v_row.closed_at, null, null, '[]'::jsonb,
    jsonb_build_object('closing_id', v_row.id, 'kind', p_kind,
                       'closing_number', v_row.closing_number,
                       'period_start', p_start, 'period_end', p_end,
                       'closing_hash', v_row.hash, 'total_ttc', p_ttc));
  return v_row;
end;
$$;

revoke all on function public.fiscal_store_closing(uuid, text, date, date, bigint, bigint, integer, integer, numeric, numeric, numeric, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.fiscal_closing_hash(public.fiscal_closings) from public, anon, authenticated;
revoke all on function public.fiscal_require_manager() from public, anon;
grant execute on function public.fiscal_require_manager() to authenticated;

-- Cloture journaliere (Z). Couvre TOUTES les ecritures depuis la cloture
-- precedente (par numero de sequence) : aucune vente synchronisee tard
-- ne peut etre oubliee.
create or replace function public.fiscal_close_day(p_date date default null)
returns public.fiscal_closings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.fiscal_require_manager();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_date date := coalesce(p_date, (now() at time zone 'Europe/Paris')::date);
  v_prev public.fiscal_closings;
  v_head public.fiscal_ledger_heads;
  v_first bigint;
  v_sales integer; v_cancels integer;
  v_ttc numeric; v_ht numeric; v_tva numeric;
  v_vat jsonb; v_pay jsonb;
begin
  if v_date > v_today then
    raise exception 'FISCAL_DATE: cloture dans le futur impossible' using errcode = 'FS004';
  end if;

  select * into v_head from public.fiscal_ledger_heads where restaurant_id = v_rid for update;
  select * into v_prev from public.fiscal_closings
   where restaurant_id = v_rid and kind = 'daily'
   order by closing_number desc limit 1;
  if found and v_date <= v_prev.period_end then
    raise exception 'FISCAL_DATE: jour deja cloture' using errcode = 'FS004';
  end if;

  v_first := coalesce(v_prev.last_seq, 0) + 1;

  select count(*) filter (where event_type = 'sale'),
         count(*) filter (where event_type = 'cancellation'),
         coalesce(sum(total_ttc), 0), coalesce(sum(total_ht), 0), coalesce(sum(total_tva), 0)
    into v_sales, v_cancels, v_ttc, v_ht, v_tva
    from public.fiscal_ledger
   where restaurant_id = v_rid and seq between v_first and v_head.last_seq
     and event_type in ('sale', 'cancellation');

  if v_sales + v_cancels = 0 then
    raise exception 'FISCAL_EMPTY: aucune operation a cloturer' using errcode = 'FS004';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('rate', rate, 'ttc', ttc, 'ht', ht, 'tva', tva)
                            order by rate), '[]'::jsonb)
    into v_vat
    from (select (e ->> 'rate')::numeric as rate,
                 sum((e ->> 'ttc')::numeric) as ttc,
                 sum((e ->> 'ht')::numeric) as ht,
                 sum((e ->> 'tva')::numeric) as tva
            from public.fiscal_ledger l
           cross join lateral jsonb_array_elements(l.vat_breakdown) e
           where l.restaurant_id = v_rid and l.seq between v_first and v_head.last_seq
             and l.event_type in ('sale', 'cancellation')
           group by 1) s;

  select coalesce(jsonb_object_agg(p, t), '{}'::jsonb) into v_pay
    from (select coalesce(payment, 'inconnu') as p, sum(total_ttc) as t
            from public.fiscal_ledger
           where restaurant_id = v_rid and seq between v_first and v_head.last_seq
             and event_type in ('sale', 'cancellation')
           group by 1) s;

  return public.fiscal_store_closing(
    v_rid, 'daily', v_date, v_date, v_first, v_head.last_seq,
    v_sales, v_cancels, v_ttc, v_ht, v_tva, v_vat, v_pay);
end;
$$;

-- Cloture mensuelle (agregat des clotures journalieres du mois) et
-- annuelle (agregat des clotures mensuelles de l'annee).
create or replace function public.fiscal_close_period(p_kind text, p_year integer, p_month integer default null)
returns public.fiscal_closings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.fiscal_require_manager();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_start date;
  v_end date;
  v_src text;
  v_head public.fiscal_ledger_heads;
  v_lastdaily public.fiscal_closings;
  v_first bigint; v_last bigint;
  v_sales integer; v_cancels integer;
  v_ttc numeric; v_ht numeric; v_tva numeric;
  v_vat jsonb; v_pay jsonb;
begin
  if p_kind = 'monthly' then
    if p_month is null or p_month not between 1 and 12 then
      raise exception 'mois invalide' using errcode = 'FS004';
    end if;
    v_start := make_date(p_year, p_month, 1);
    v_end := (v_start + interval '1 month - 1 day')::date;
    v_src := 'daily';
  elsif p_kind = 'annual' then
    v_start := make_date(p_year, 1, 1);
    v_end := make_date(p_year, 12, 31);
    v_src := 'monthly';
  else
    raise exception 'type de cloture invalide' using errcode = 'FS004';
  end if;

  if v_end >= v_today then
    raise exception 'FISCAL_DATE: periode non terminee' using errcode = 'FS004';
  end if;

  select * into v_head from public.fiscal_ledger_heads where restaurant_id = v_rid for update;

  if exists (select 1 from public.fiscal_closings
              where restaurant_id = v_rid and kind = p_kind and period_start = v_start) then
    raise exception 'FISCAL_DATE: periode deja cloturee' using errcode = 'FS004';
  end if;

  if p_kind = 'monthly' then
    -- Toutes les ventes du mois doivent deja etre dans une cloture journaliere.
    select * into v_lastdaily from public.fiscal_closings
     where restaurant_id = v_rid and kind = 'daily' order by closing_number desc limit 1;
    if exists (select 1 from public.fiscal_ledger l
                where l.restaurant_id = v_rid and l.event_type in ('sale', 'cancellation')
                  and l.seq > coalesce(v_lastdaily.last_seq, 0)
                  and (l.occurred_at at time zone 'Europe/Paris')::date <= v_end) then
      raise exception 'FISCAL_ORDER: cloturer d''abord les jours restants' using errcode = 'FS004';
    end if;
  else
    if exists (select 1 from public.fiscal_closings d
                where d.restaurant_id = v_rid and d.kind = 'daily'
                  and d.period_start between v_start and v_end
                  and not exists (select 1 from public.fiscal_closings m
                                   where m.restaurant_id = v_rid and m.kind = 'monthly'
                                     and d.period_start between m.period_start and m.period_end)) then
      raise exception 'FISCAL_ORDER: cloturer d''abord les mois restants' using errcode = 'FS004';
    end if;
  end if;

  select min(first_seq), max(last_seq),
         coalesce(sum(sales_count), 0), coalesce(sum(cancellations_count), 0),
         coalesce(sum(total_ttc), 0), coalesce(sum(total_ht), 0), coalesce(sum(total_tva), 0)
    into v_first, v_last, v_sales, v_cancels, v_ttc, v_ht, v_tva
    from public.fiscal_closings
   where restaurant_id = v_rid and kind = v_src and period_start between v_start and v_end;

  if v_first is null then
    raise exception 'FISCAL_EMPTY: aucune cloture a agreger' using errcode = 'FS004';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('rate', rate, 'ttc', ttc, 'ht', ht, 'tva', tva)
                            order by rate), '[]'::jsonb)
    into v_vat
    from (select (e ->> 'rate')::numeric as rate,
                 sum((e ->> 'ttc')::numeric) as ttc,
                 sum((e ->> 'ht')::numeric) as ht,
                 sum((e ->> 'tva')::numeric) as tva
            from public.fiscal_closings c
           cross join lateral jsonb_array_elements(c.vat_breakdown) e
           where c.restaurant_id = v_rid and c.kind = v_src
             and c.period_start between v_start and v_end
           group by 1) s;

  select coalesce(jsonb_object_agg(k, t), '{}'::jsonb) into v_pay
    from (select kv.key as k, sum(kv.value::numeric) as t
            from public.fiscal_closings c
           cross join lateral jsonb_each_text(c.payments_breakdown) kv
           where c.restaurant_id = v_rid and c.kind = v_src
             and c.period_start between v_start and v_end
           group by 1) s;

  return public.fiscal_store_closing(
    v_rid, p_kind, v_start, v_end, v_first, v_last,
    v_sales, v_cancels, v_ttc, v_ht, v_tva, v_vat, v_pay);
end;
$$;

-- ── 9. RPC : verification d'integrite, archivage, statut ────
create or replace function public.fiscal_verify_chain()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.fiscal_require_manager();
  r public.fiscal_ledger;
  v_prev text := repeat('0', 64);
  v_expected bigint := 1;
  v_count bigint := 0;
  c public.fiscal_closings;
  v_cprev text;
  v_ckind text := null;
begin
  for r in select * from public.fiscal_ledger where restaurant_id = v_rid order by seq loop
    if r.seq <> v_expected then
      return jsonb_build_object('ok', false, 'entries', v_count, 'error', 'seq_gap', 'seq', r.seq);
    end if;
    if r.previous_hash <> v_prev or r.hash <> public.fiscal_entry_hash(
         v_prev, r.seq, r.event_type, r.restaurant_id, r.order_id, r.order_num,
         r.occurred_at, r.recorded_at, r.payment, r.service,
         r.total_ttc, r.total_ht, r.total_tva, r.vat_breakdown, r.payload) then
      return jsonb_build_object('ok', false, 'entries', v_count, 'error', 'hash_mismatch', 'seq', r.seq);
    end if;
    v_prev := r.hash;
    v_expected := v_expected + 1;
    v_count := v_count + 1;
  end loop;

  for c in select * from public.fiscal_closings where restaurant_id = v_rid
           order by kind, closing_number loop
    if v_ckind is distinct from c.kind then
      v_ckind := c.kind;
      v_cprev := repeat('0', 64);
    end if;
    if c.previous_hash <> v_cprev or c.hash <> public.fiscal_closing_hash(c) then
      return jsonb_build_object('ok', false, 'entries', v_count, 'error', 'closing_mismatch',
                                'kind', c.kind, 'closing_number', c.closing_number);
    end if;
    v_cprev := c.hash;
  end loop;

  return jsonb_build_object('ok', true, 'entries', v_count, 'head_hash', v_prev);
end;
$$;

create or replace function public.fiscal_archive_content(
  p_rid uuid, p_start date, p_end date, p_first bigint, p_last bigint
) returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'engine', 'vice-fiscal-engine/1',
    'restaurant_id', p_rid,
    'period_start', p_start, 'period_end', p_end,
    'first_seq', p_first, 'last_seq', p_last,
    'ledger', coalesce((select jsonb_agg(to_jsonb(l) order by l.seq)
                          from public.fiscal_ledger l
                         where l.restaurant_id = p_rid and l.seq between p_first and p_last), '[]'::jsonb),
    'closings', coalesce((select jsonb_agg(to_jsonb(c) order by c.kind, c.closing_number)
                            from public.fiscal_closings c
                           where c.restaurant_id = p_rid and c.last_seq >= p_first and c.first_seq <= p_last), '[]'::jsonb)
  )
$$;

-- Archive d'une periode deja cloturee (jours). Renvoie le contenu complet
-- (a telecharger) ; l'empreinte est enregistree de facon immuable.
create or replace function public.fiscal_archive_period(p_start date, p_end date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.fiscal_require_manager();
  v_first bigint; v_last bigint;
  v_content jsonb;
  v_hash text;
  v_archive public.fiscal_archives;
begin
  select min(first_seq), max(last_seq) into v_first, v_last
    from public.fiscal_closings
   where restaurant_id = v_rid and kind = 'daily' and period_start between p_start and p_end;
  if v_first is null then
    raise exception 'FISCAL_EMPTY: aucune cloture journaliere sur cette periode' using errcode = 'FS004';
  end if;

  v_content := public.fiscal_archive_content(v_rid, p_start, p_end, v_first, v_last);
  v_hash := encode(sha256(convert_to(v_content::text, 'UTF8')), 'hex');

  insert into public.fiscal_archives
    (restaurant_id, period_start, period_end, first_seq, last_seq, entry_count, content_hash, created_by)
  values (v_rid, p_start, p_end, v_first, v_last,
          jsonb_array_length(v_content -> 'ledger'), v_hash, auth.uid())
  returning * into v_archive;

  perform public.fiscal_append(
    v_rid, 'archive', null, null, v_archive.created_at, null, null, '[]'::jsonb,
    jsonb_build_object('archive_id', v_archive.id, 'content_hash', v_hash,
                       'period_start', p_start, 'period_end', p_end,
                       'first_seq', v_first, 'last_seq', v_last));

  return jsonb_build_object('archive', to_jsonb(v_archive), 'content', v_content);
end;
$$;

create or replace function public.fiscal_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_rid uuid := public.current_restaurant_id();
  v_rest public.restaurants;
  v_head public.fiscal_ledger_heads;
  v_daily public.fiscal_closings;
begin
  if v_rid is null or not public.is_current_user_gerant() then
    raise exception 'FISCAL_FORBIDDEN: reserve au gerant' using errcode = 'FS002';
  end if;
  select * into v_rest from public.restaurants where id = v_rid;
  select * into v_head from public.fiscal_ledger_heads where restaurant_id = v_rid;
  select * into v_daily from public.fiscal_closings
   where restaurant_id = v_rid and kind = 'daily' order by closing_number desc limit 1;
  return jsonb_build_object(
    'environment', v_rest.environment,
    'fiscal_profile', v_rest.fiscal_profile,
    'fiscal_active', v_rest.environment = 'production' and v_rest.fiscal_profile = 'FR',
    'fiscal_activated_at', v_rest.fiscal_activated_at,
    'default_vat_rate', v_rest.fiscal_default_vat_rate,
    'ledger_entries', coalesce(v_head.last_seq, 0),
    'last_daily_closing', case when v_daily.id is null then null
       else jsonb_build_object('period_start', v_daily.period_start, 'closed_at', v_daily.closed_at,
                               'last_seq', v_daily.last_seq) end,
    'unclosed_entries', coalesce(v_head.last_seq, 0) - coalesce(v_daily.last_seq, 0)
  );
end;
$$;

-- Droits d'execution : uniquement les utilisateurs authentifies.
do $$
declare f text;
begin
  foreach f in array array[
    'set_restaurant_environment(text)',
    'activate_fiscal_fr(text)',
    'fiscal_cancel_order(uuid, text)',
    'fiscal_close_day(date)',
    'fiscal_close_period(text, integer, integer)',
    'fiscal_verify_chain()',
    'fiscal_archive_period(date, date)',
    'fiscal_status()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
revoke all on function public.fiscal_archive_content(uuid, date, date, bigint, bigint) from public, anon, authenticated;

commit;
