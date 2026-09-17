-- ============================================================
-- Migration 006 : numero de commande atomique, partage entre
-- tous les appareils (tablette / PC / telephone), par restaurant.
-- A executer dans Supabase > SQL Editor (en plus des migrations
-- precedentes, ne remplace rien - juste un ajout).
--
-- Probleme resolu : le numero de commande etait jusqu'ici calcule
-- en local (localStorage) sur chaque appareil ("lire le dernier
-- numero + 1"), ce qui peut produire des doublons si deux appareils
-- valident une commande au meme moment. La fonction ci-dessous
-- incremente un compteur en base de maniere atomique (verrou de
-- ligne Postgres implicite sur l'UPDATE), donc deux appels
-- simultanes ne peuvent jamais recevoir le meme numero.
-- ============================================================

-- ── TABLE : un compteur par restaurant ──────────────────────
create table if not exists public.order_counters (
  restaurant_id uuid primary key references public.restaurants (id) on delete cascade,
  last_num integer not null default 0
);

alter table public.order_counters enable row level security;

-- Lecture/ecriture reservees a son propre restaurant (coherent avec le
-- reste du schema). La fonction next_order_num() ci-dessous tourne en
-- SECURITY DEFINER donc elle n'a pas besoin de cette policy pour
-- fonctionner, mais on la garde par coherence/duforte defense.
create policy "voir_son_compteur" on public.order_counters
  for select using (restaurant_id = public.current_restaurant_id());

-- ── FONCTION : incrementation atomique ──────────────────────
-- Renvoie le prochain numero de commande pour p_restaurant_id.
-- L'UPDATE (ou l'INSERT initial) verrouille la ligne du compteur le
-- temps de la transaction : si deux clients appellent la fonction en
-- meme temps, le second attend que le premier ait termine et recoit
-- donc forcement num+1, jamais le meme numero.
create or replace function public.next_order_num(p_restaurant_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num integer;
begin
  -- On ne genere un numero que pour SON PROPRE restaurant.
  if p_restaurant_id <> public.current_restaurant_id() then
    raise exception 'restaurant_id ne correspond pas a l''utilisateur connecte';
  end if;

  insert into public.order_counters (restaurant_id, last_num)
  values (p_restaurant_id, 1)
  on conflict (restaurant_id)
  do update set last_num = public.order_counters.last_num + 1
  returning last_num into v_num;

  return v_num;
end;
$$;

grant execute on function public.next_order_num(uuid) to authenticated;
