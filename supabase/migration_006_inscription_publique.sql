-- ============================================================
-- Migration 006 : inscription publique fidélité (plaque NFC / QR imprimé)
-- A executer dans Supabase > SQL Editor (en plus des migrations
-- precedentes, notamment migration_005_fidelite.sql)
--
-- Ajoute :
--  - un slug public par restaurant (URL /r/<slug>/fidelite)
--  - des consentements separes CGU / marketing sur customers
--    (en plus de consentement_rgpd, garde pour compatibilite avec
--    les inscriptions deja faites depuis /scan)
-- ============================================================

alter table public.restaurants add column if not exists slug text;

-- Genere un slug a partir du nom pour les restaurants existants qui
-- n'en ont pas encore (minuscules, tirets, sans caracteres speciaux).
update public.restaurants
set slug = trim(both '-' from regexp_replace(lower(nom), '[^a-z0-9]+', '-', 'g'))
where slug is null;

alter table public.restaurants alter column slug set not null;
create unique index if not exists restaurants_slug_idx on public.restaurants (slug);

alter table public.customers
  add column if not exists consentement_cgu boolean not null default false,
  add column if not exists consentement_marketing boolean not null default false;

-- Pas de nouvelle policy RLS publique ici : la resolution slug -> id
-- restaurant et la creation du client passent uniquement par la
-- fonction serverless (/api/register-customer, cle secrete cote
-- serveur). Le navigateur du visiteur n'a jamais d'acces direct a
-- la table restaurants ni customers pour ce parcours.
