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

-- Genere un slug a partir du nom pour tous les restaurants (minuscules,
-- tirets, sans caracteres speciaux). Si plusieurs restaurants portent
-- le meme nom (doublons de test, restaurants homonymes...), on
-- desambiguise avec un suffixe numerique plutot que d'echouer : le
-- plus ancien garde le slug "propre", les suivants deviennent
-- "slug-2", "slug-3", etc. Recalcule a chaque execution (idempotent),
-- donc rejouable meme si un essai precedent a deja pose des slugs.
with ranked as (
  select
    id,
    trim(both '-' from regexp_replace(lower(nom), '[^a-z0-9]+', '-', 'g')) as base_slug,
    row_number() over (
      partition by trim(both '-' from regexp_replace(lower(nom), '[^a-z0-9]+', '-', 'g'))
      order by cree_le, id
    ) as rn
  from public.restaurants
)
update public.restaurants r
set slug = case when ranked.rn = 1 then ranked.base_slug else ranked.base_slug || '-' || ranked.rn end
from ranked
where r.id = ranked.id;

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
