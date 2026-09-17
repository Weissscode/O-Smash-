begin;

-- Le rôle est lu depuis le profil authentifié, jamais depuis une valeur
-- fournie par le navigateur.
create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.is_current_user_gerant()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select p.role = 'gerant'
      from public.profiles p
      where p.id = auth.uid()
    ),
    false
  )
$$;

-- L'inscription existante peut créer le premier gérant de son propre
-- restaurant. Les comptes staff restent provisionnés côté serveur.
create or replace function public.can_create_initial_manager(
  p_restaurant_id uuid,
  p_profile_email text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.restaurants r
    where r.id = $1
      and lower(r.email_contact) = lower(auth.jwt() ->> 'email')
      and lower($2) = lower(auth.jwt() ->> 'email')
      and not exists (
        select 1
        from public.profiles p
        where p.restaurant_id = r.id
      )
  )
$$;

revoke all on function public.current_profile_role() from public;
revoke all on function public.is_current_user_gerant() from public;
revoke all on function public.can_create_initial_manager(uuid, text) from public;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_current_user_gerant() to authenticated;
grant execute on function public.can_create_initial_manager(uuid, text) to authenticated;

-- Un utilisateur ne peut plus changer son rôle ou son restaurant.
drop policy if exists "modifier_son_profil" on public.profiles;
create policy "modifier_son_profil"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and restaurant_id = public.current_restaurant_id()
  and role = public.current_profile_role()
);

-- Ferme la création directe d'un profil gérant sur un restaurant existant.
drop policy if exists "creer_son_profil" on public.profiles;
create policy "creer_son_profil"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'gerant'
  and public.can_create_initial_manager(restaurant_id, email)
);

-- Les mutations de configuration sont réservées au gérant.
drop policy if exists "creer_paliers_restaurant" on public.loyalty_tiers;
drop policy if exists "modifier_paliers_restaurant" on public.loyalty_tiers;
drop policy if exists "supprimer_paliers_restaurant" on public.loyalty_tiers;

create policy "creer_paliers_restaurant" on public.loyalty_tiers
  for insert to authenticated
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );
create policy "modifier_paliers_restaurant" on public.loyalty_tiers
  for update to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  )
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );
create policy "supprimer_paliers_restaurant" on public.loyalty_tiers
  for delete to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );

drop policy if exists "creer_recompenses_restaurant" on public.rewards;
drop policy if exists "modifier_recompenses_restaurant" on public.rewards;
drop policy if exists "supprimer_recompenses_restaurant" on public.rewards;

create policy "creer_recompenses_restaurant" on public.rewards
  for insert to authenticated
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );
create policy "modifier_recompenses_restaurant" on public.rewards
  for update to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  )
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );
create policy "supprimer_recompenses_restaurant" on public.rewards
  for delete to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );

-- Les suppressions de clients et le cycle de vie des cartes sont réservés
-- au gérant. Les lectures utiles au scan restent accessibles au staff.
drop policy if exists "supprimer_clients_restaurant" on public.customers;
create policy "supprimer_clients_restaurant" on public.customers
  for delete to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );

drop policy if exists "creer_cartes_restaurant" on public.loyalty_cards;
drop policy if exists "modifier_cartes_restaurant" on public.loyalty_cards;
drop policy if exists "supprimer_cartes_restaurant" on public.loyalty_cards;

create policy "creer_cartes_restaurant" on public.loyalty_cards
  for insert to authenticated
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );
create policy "modifier_cartes_restaurant" on public.loyalty_cards
  for update to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  )
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );
create policy "supprimer_cartes_restaurant" on public.loyalty_cards
  for delete to authenticated
  using (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );

drop policy if exists "creer_evenements_cartes_restaurant" on public.loyalty_card_events;
create policy "creer_evenements_cartes_restaurant" on public.loyalty_card_events
  for insert to authenticated
  with check (
    restaurant_id = public.current_restaurant_id()
    and public.is_current_user_gerant()
  );

commit;
