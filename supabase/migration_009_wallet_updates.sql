-- ============================================================
-- Migration 009 : mise a jour automatique des cartes Apple Wallet
-- (PassKit Web Service)
-- A executer dans Supabase > SQL Editor AVANT de definir la variable
-- WALLET_AUTH_SECRET dans Vercel (c'est elle qui active le service).
--
-- Principe PassKit : chaque carte installee s'enregistre aupres de notre
-- serveur (appareil + jeton de notification). Quand les donnees du client
-- changent, on previent Apple (APNs), l'iPhone redemande la carte a jour.
--   - wallet_registrations : quel appareil detient quelle carte.
--   - loyalty_cards.wallet_updated_at : date de derniere modification
--     visible sur la carte. Maintenue par trigger : toute ecriture de
--     points (caisse, recompense, correction manuelle) est prise en
--     compte, sans dependre du code appelant.
-- ============================================================

create table if not exists public.wallet_registrations (
  id uuid primary key default gen_random_uuid(),
  device_library_id text not null,
  pass_type_id text not null,
  serial_number text not null,          -- = loyalty_cards.uid_nfc
  push_token text not null,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  unique (device_library_id, pass_type_id, serial_number)
);

create index if not exists wallet_registrations_serial_idx
  on public.wallet_registrations (serial_number);

-- RLS active SANS aucune policy : la table n'est lisible/modifiable que
-- par la cle secrete (fonctions serveur /api/wallet). Ni le navigateur
-- du client, ni celui du staff n'y ont acces.
alter table public.wallet_registrations enable row level security;

alter table public.loyalty_cards
  add column if not exists wallet_updated_at timestamptz not null default now();

create or replace function public.touch_wallet_cards()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.points_balance is distinct from old.points_balance
     or new.nombre_visites is distinct from old.nombre_visites
     or new.prenom is distinct from old.prenom
     or new.tier_id is distinct from old.tier_id then
    update public.loyalty_cards
       set wallet_updated_at = now()
     where customer_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists customers_touch_wallet on public.customers;
create trigger customers_touch_wallet
  after update on public.customers
  for each row execute function public.touch_wallet_cards();
