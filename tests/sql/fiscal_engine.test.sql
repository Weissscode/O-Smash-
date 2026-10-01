-- Tests du moteur fiscal (migration 008). Executes sur un PostgreSQL jetable.
\set ON_ERROR_STOP on
\set QUIET on

create or replace function t_assert(p_ok boolean, p_msg text) returns void language plpgsql as $$
begin
  if p_ok is not true then raise exception 'ASSERTION FAILED: %', p_msg; end if;
  raise notice 'ok - %', p_msg;
end $$;

-- Verifie que p_sql leve une erreur dont le SQLSTATE / message correspond.
create or replace function t_fails(p_sql text, p_code text, p_msg text) returns void language plpgsql as $$
declare v_state text; v_text text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate, v_text = message_text;
    if p_code is not null and v_state <> p_code then
      raise exception 'ASSERTION FAILED: % (attendu %, recu % : %)', p_msg, p_code, v_state, v_text;
    end if;
    raise notice 'ok - % [%]', p_msg, v_state;
    return;
  end;
  raise exception 'ASSERTION FAILED: % (aucune erreur levee)', p_msg;
end $$;

create or replace function t_login(p_uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_uid::text, false);
  perform set_config('request.jwt.claim.role', 'authenticated', false);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', p_uid, 'email', 'u@x.test', 'role', 'authenticated')::text, false);
end $$;

-- ── Jeu de donnees ──────────────────────────────────────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'gerantA@x.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'staffA@x.test'),
  ('00000000-0000-0000-0000-0000000000b1', 'gerantB@x.test'),
  ('00000000-0000-0000-0000-0000000000c1', 'gerantC@x.test');

-- 1. Restaurant cree par un client : forcement TEST / fiscalite OFF
select t_login('00000000-0000-0000-0000-0000000000a1');
set role authenticated;
insert into public.restaurants (id, nom, slug, email_contact, environment, fiscal_profile)
values ('10000000-0000-0000-0000-00000000000a', 'Resto A', 'resto-a', 'gerantA@x.test', 'production', 'FR');
reset role;
select t_assert((select environment = 'test' and fiscal_profile = 'NONE'
                   from public.restaurants where id = '10000000-0000-0000-0000-00000000000a'),
                'un restaurant cree par un client demarre en TEST / fiscalite NONE');

insert into public.restaurants (id, nom, slug, email_contact) values
  ('10000000-0000-0000-0000-00000000000b', 'Resto B', 'resto-b', 'gerantB@x.test'),
  ('10000000-0000-0000-0000-00000000000c', 'Resto C', 'resto-c', 'gerantC@x.test');
insert into public.profiles (id, restaurant_id, email, role) values
  ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'gerantA@x.test', 'gerant'),
  ('00000000-0000-0000-0000-0000000000a2', '10000000-0000-0000-0000-00000000000a', 'staffA@x.test', 'staff'),
  ('00000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', 'gerantB@x.test', 'gerant'),
  ('00000000-0000-0000-0000-0000000000c1', '10000000-0000-0000-0000-00000000000c', 'gerantC@x.test', 'gerant');

-- 2. Les colonnes fiscales ne sont pas modifiables hors RPC
select t_fails($$update public.restaurants set fiscal_profile = 'FR' where id = '10000000-0000-0000-0000-00000000000a'$$,
               'FS002', 'UPDATE direct de fiscal_profile refuse (meme superuser, sans RPC)');
select t_login('00000000-0000-0000-0000-0000000000a1');
set role authenticated;
update public.restaurants set environment = 'production' where id = '10000000-0000-0000-0000-00000000000a';
reset role;
select t_assert((select environment = 'test' from public.restaurants where id = '10000000-0000-0000-0000-00000000000a'),
                'un client ne peut pas changer l''environnement par UPDATE (RLS : 0 ligne)');

-- 3. MODE TEST : commandes dans orders_test, jamais dans orders, pas de ledger
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
select t_assert(public.next_order_num('10000000-0000-0000-0000-00000000000a') = 1, 'compteur TEST demarre a 1');
insert into public.orders_test (restaurant_id, num, items, total, payment, service, status)
values ('10000000-0000-0000-0000-00000000000a', 1, '[{"total": 11}]', 11, 'CB', 'Sur place', 'en cours');
select t_fails($$insert into public.orders (restaurant_id, num, items, total, payment, status)
                  values ('10000000-0000-0000-0000-00000000000a', 2, '[]', 5, 'CB', 'en cours')$$,
               '42501', 'en mode TEST, ecriture dans orders (production) refusee par RLS');
reset role;
select t_assert((select count(*) from public.fiscal_ledger) = 0, 'mode TEST : aucun ledger fiscal');
select t_assert((select count(*) from public.order_counters) = 0, 'mode TEST : le compteur de production n''est pas touche');

-- 4. Passage en PRODUCTION (gerant uniquement)
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
select t_fails($$select public.set_restaurant_environment('production')$$, 'FS002', 'un staff ne peut pas passer en production');
select t_login('00000000-0000-0000-0000-0000000000a1');
select public.set_restaurant_environment('production');
select t_assert(public.next_order_num('10000000-0000-0000-0000-00000000000a') = 1, 'compteur PRODUCTION independant du compteur TEST');
select t_fails($$insert into public.orders_test (restaurant_id, num, items, total, status)
                  values ('10000000-0000-0000-0000-00000000000a', 9, '[]', 1, 'en cours')$$,
               '42501', 'en PRODUCTION, ecriture dans orders_test refusee (pas de contournement du ledger)');
-- fiscalite NONE : comportement historique conserve
insert into public.orders (id, restaurant_id, num, items, total, payment, service, status)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000a', 1, '[{"total": 8}]', 8, 'CB', 'Sur place', 'en cours');
update public.orders set total = 9 where id = '20000000-0000-0000-0000-000000000001';
delete from public.orders where id = '20000000-0000-0000-0000-000000000001';
reset role;
select t_assert((select count(*) from public.fiscal_ledger) = 0, 'production sans profil FR : pas de ledger, edition/suppression comme avant');

-- 5. Activation du profil FR
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
select t_fails($$select public.activate_fiscal_fr('ACTIVER')$$, 'FS002', 'un staff ne peut pas activer la fiscalite');
select t_login('00000000-0000-0000-0000-0000000000a1');
select t_fails($$select public.activate_fiscal_fr('oui')$$, 'FS004', 'activation sans confirmation refusee');
select public.activate_fiscal_fr('ACTIVER');
reset role;
select t_assert((select fiscal_profile = 'FR' and fiscal_activated_at is not null from public.restaurants where id = '10000000-0000-0000-0000-00000000000a'), 'profil FR actif');
select t_assert((select event_type = 'activation' and seq = 1 from public.fiscal_ledger where restaurant_id = '10000000-0000-0000-0000-00000000000a'), 'ledger : ecriture d''activation seq 1');

-- 5b. Le profil FR ne peut plus etre desactive (ni par RPC, ni par SQL direct, ni par DevTools)
select t_login('00000000-0000-0000-0000-0000000000a1');
set role authenticated;
select t_fails($$select public.set_restaurant_environment('test')$$, 'FS001', 'impossible de repasser en TEST en profil FR');
update public.restaurants set fiscal_profile = 'NONE' where id = '10000000-0000-0000-0000-00000000000a';
reset role;
select t_assert((select fiscal_profile = 'FR' from public.restaurants where id = '10000000-0000-0000-0000-00000000000a'), 'UPDATE client du profil fiscal sans effet');
select t_fails($$update public.restaurants set fiscal_profile = 'NONE' where id = '10000000-0000-0000-0000-00000000000a'$$, 'FS001', 'meme en SQL direct : retour a NONE refuse');
select t_fails($$update public.restaurants set environment = 'test' where id = '10000000-0000-0000-0000-00000000000a'$$, 'FS001', 'meme en SQL direct : retour en TEST refuse');
select t_fails($$delete from public.restaurants where id = '10000000-0000-0000-0000-00000000000a'$$, '23503', 'un restaurant avec ledger ne peut pas etre supprime');

-- 6. Vente : ledger + verrouillage
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
insert into public.orders (id, restaurant_id, num, items, total, payment, service, status, cree_le)
values ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-00000000000a', 2,
        '[{"pid":"b1","qty":1,"total":11.00}]', 11.00, 'CB', 'Sur place', 'en cours', now());
select t_fails($$update public.orders set total = 1 where id = '20000000-0000-0000-0000-000000000002'$$, 'FS001', 'vente verrouillee : total non modifiable');
select t_fails($$update public.orders set payment = 'Especes' where id = '20000000-0000-0000-0000-000000000002'$$, 'FS001', 'vente verrouillee : moyen de paiement non modifiable');
select t_fails($$update public.orders set items = '[]' where id = '20000000-0000-0000-0000-000000000002'$$, 'FS001', 'vente verrouillee : articles non modifiables');
select t_fails($$update public.orders set fiscal_locked_at = null where id = '20000000-0000-0000-0000-000000000002'$$, 'FS001', 'verrou non retirable');
select t_fails($$delete from public.orders where id = '20000000-0000-0000-0000-000000000002'$$, 'FS001', 'vente verrouillee : suppression refusee');
select t_fails($$update public.orders set status = 'annulee' where id = '20000000-0000-0000-0000-000000000002'$$, 'FS001', 'annulation directe refusee (RPC tracee obligatoire)');
update public.orders set print_request = 'caisse' where id = '20000000-0000-0000-0000-000000000002';
update public.orders set status = 'terminee' where id = '20000000-0000-0000-0000-000000000002';
reset role;
select t_assert((select print_request = 'caisse' and status = 'terminee' and fiscal_locked_at is not null and fiscal_ledger_id is not null
                   from public.orders where id = '20000000-0000-0000-0000-000000000002'),
                'impression et statut de workflow autorises sur une vente verrouillee');
select t_assert((select total_ttc = 11.00 and total_ht = 10.00 and total_tva = 1.00 and seq = 2 and event_type = 'sale'
                   from public.fiscal_ledger where order_id = '20000000-0000-0000-0000-000000000002'),
                'ledger : vente TTC 11,00 = HT 10,00 + TVA 1,00 (10 %)');
-- le serveur d'impression (service_role) reste autorise a remettre print_request a null
set role service_role;
update public.orders set print_request = null, print_error = null where id = '20000000-0000-0000-0000-000000000002';
reset role;

-- 6b. Taux par ligne et ecart d'articles
insert into public.orders (id, restaurant_id, num, items, total, payment, service, status)
values ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-00000000000a', 3,
        '[{"total":11.00},{"total":12.00,"vat_rate":20}]', 24.00, 'Especes', 'A emporter', 'en cours');
select t_assert((select total_ttc = 23.00 and total_tva = 3.00 and jsonb_array_length(vat_breakdown) = 2
                        and (payload ->> 'items_total_mismatch')::boolean
                   from public.fiscal_ledger where order_id = '20000000-0000-0000-0000-000000000003'),
                'TVA multi-taux (10 % + 20 %) et ecart articles/total signale dans le payload');

-- 7. Commande telephone : pas de vente tant que non payee
insert into public.orders (id, restaurant_id, num, items, total, status, phone, fiscal_locked_at)
values ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-00000000000a', 4, '[{"total":5}]', 5, 'en attente', '0600000000', now());
select t_assert((select fiscal_locked_at is null and fiscal_ledger_id is null from public.orders where id = '20000000-0000-0000-0000-000000000004'),
                'un client ne peut pas pre-poser le verrou fiscal');
select t_assert((select count(*) from public.fiscal_ledger where order_id = '20000000-0000-0000-0000-000000000004') = 0, 'commande telephone en attente : pas d''ecriture fiscale');
update public.orders set payment = 'CB', status = 'payée' where id = '20000000-0000-0000-0000-000000000004';
select t_assert((select count(*) = 1 from public.fiscal_ledger where order_id = '20000000-0000-0000-0000-000000000004' and event_type = 'sale'),
                'encaissement de la commande telephone : vente enregistree');
insert into public.orders (id, restaurant_id, num, items, total, status)
values ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-00000000000a', 5, '[{"total":5}]', 5, 'en attente');
delete from public.orders where id = '20000000-0000-0000-0000-000000000005';
select t_assert((select count(*) from public.orders where id = '20000000-0000-0000-0000-000000000005') = 0, 'commande telephone non payee supprimable');

-- 8. Immutabilite du ledger
select t_fails($$update public.fiscal_ledger set total_ttc = 1$$, 'FS003', 'ledger : UPDATE interdit (superuser inclus)');
select t_fails($$delete from public.fiscal_ledger$$, 'FS003', 'ledger : DELETE interdit');
select t_fails($$truncate public.fiscal_ledger$$, 'FS003', 'ledger : TRUNCATE interdit');
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
select t_assert((select count(*) from public.fiscal_ledger) = 0, 'staff : ledger illisible (RLS)');
select t_fails($$insert into public.fiscal_ledger (restaurant_id, seq, event_type, occurred_at, previous_hash, hash)
                  values ('10000000-0000-0000-0000-00000000000a', 99, 'sale', now(), 'x', 'y')$$, '42501', 'ecriture directe dans le ledger refusee');
select t_fails($$select public.fiscal_append('10000000-0000-0000-0000-00000000000a','sale',null,null,now(),null,null,'[]','{}')$$, '42501', 'fiscal_append non appelable par un client');
select t_login('00000000-0000-0000-0000-0000000000a1');
select t_assert((select count(*) from public.fiscal_ledger) >= 4, 'gerant : ledger lisible');
select t_login('00000000-0000-0000-0000-0000000000b1');
select t_assert((select count(*) from public.fiscal_ledger) = 0, 'isolation multi-restaurants : le gerant B ne voit rien de A');
reset role;

-- 9. Annulation tracee
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
select t_fails($$select public.fiscal_cancel_order('20000000-0000-0000-0000-000000000002', 'erreur de caisse')$$, 'FS002', 'un staff ne peut pas annuler une vente');
select t_login('00000000-0000-0000-0000-0000000000a1');
select t_fails($$select public.fiscal_cancel_order('20000000-0000-0000-0000-000000000002', 'x')$$, 'FS004', 'motif d''annulation obligatoire');
select public.fiscal_cancel_order('20000000-0000-0000-0000-000000000002', 'erreur de caisse');
select t_fails($$select public.fiscal_cancel_order('20000000-0000-0000-0000-000000000002', 'encore')$$, 'FS004', 'double annulation refusee');
reset role;
select t_assert((select status = 'annulee' from public.orders where id = '20000000-0000-0000-0000-000000000002'), 'commande annulee');
select t_assert((select total_ttc = -11.00 and total_tva = -1.00 and payload ->> 'reason' = 'erreur de caisse'
                   from public.fiscal_ledger where order_id = '20000000-0000-0000-0000-000000000002' and event_type = 'cancellation'),
                'ledger : contre-ecriture negative avec motif');
select t_assert((select count(*) = 1 from public.orders where id = '20000000-0000-0000-0000-000000000002'), 'la commande annulee reste en base (jamais supprimee)');

-- 10. Clotures (restaurant A : jour courant)
select t_login('00000000-0000-0000-0000-0000000000a2');
set role authenticated;
select t_fails($$select public.fiscal_close_day()$$, 'FS002', 'un staff ne peut pas cloturer');
select t_login('00000000-0000-0000-0000-0000000000a1');
select t_assert((select sales_count = 3 and cancellations_count = 1 and total_ttc = 11 + 23 + 5 - 11 and closing_number = 1
                        and grand_total_ttc = total_ttc
                   from public.fiscal_close_day()), 'cloture Z : 3 ventes, 1 annulation, totaux et grand total coherents');
select t_fails($$select public.fiscal_close_day()$$, 'FS004', 'jour deja cloture');
select t_assert((public.fiscal_status() ->> 'unclosed_entries')::int = 1, 'statut : seule l''ecriture de cloture reste hors cloture');
select t_assert((public.fiscal_verify_chain() ->> 'ok')::boolean, 'verification de chaine OK');
reset role;
select t_fails($$update public.fiscal_closings set total_ttc = 0$$, 'FS003', 'clotures immuables');

-- 11. Cloture mensuelle / annuelle (restaurant C, periode passee) + archive
update public.restaurants set environment = 'production' where false; -- no-op
select set_config('vice.fiscal_rpc', 'on', false);
update public.restaurants set environment = 'production' where id = '10000000-0000-0000-0000-00000000000c';
select set_config('vice.fiscal_rpc', 'off', false);
select t_login('00000000-0000-0000-0000-0000000000c1');
set role authenticated;
select public.activate_fiscal_fr('ACTIVER');
insert into public.orders (id, restaurant_id, num, items, total, payment, service, status, cree_le)
values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000c', 1, '[{"total":22}]', 22, 'CB', 'Sur place', 'en cours', '2025-03-10 12:00:00+01');
select t_assert((public.fiscal_close_day('2025-03-10')).total_ttc = 22, 'cloture d''un jour passe (10/03/2025)');
insert into public.orders (id, restaurant_id, num, items, total, payment, service, status, cree_le)
values ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-00000000000c', 2, '[{"total":33}]', 33, 'Especes', 'Sur place', 'en cours', '2025-03-11 12:00:00+01');
select t_fails($$select public.fiscal_close_period('monthly', 2025, 3)$$, 'FS004', 'cloture mensuelle refusee tant que des jours ne sont pas clotures');
select public.fiscal_close_day('2025-03-11');
select t_fails($$select public.fiscal_close_day('2025-03-09')$$, 'FS004', 'les clotures journalieres restent chronologiques');
select t_assert((select total_ttc = 55 and sales_count = 2 and payments_breakdown = '{"CB": 22.00, "Especes": 33.00}'::jsonb
                   from public.fiscal_close_period('monthly', 2025, 3)), 'cloture mensuelle = somme des jours (55 EUR), ventilation par moyen de paiement');
select t_fails($$select public.fiscal_close_period('monthly', 2026, 12)$$, 'FS004', 'periode non terminee refusee');
select t_assert((select total_ttc = 55 and grand_total_ttc = 55 from public.fiscal_close_period('annual', 2025)), 'cloture annuelle 2025 = 55 EUR');
select t_assert((public.fiscal_archive_period('2025-03-01', '2025-03-31') -> 'archive' ->> 'entry_count')::int = 4, 'archivage de la periode (export JSON + empreinte)');
select t_assert((public.fiscal_verify_chain() ->> 'ok')::boolean, 'chaine OK apres clotures + archive');
reset role;
select t_fails($$update public.fiscal_archives set content_hash = 'x'$$, 'FS003', 'archives immuables');

-- 12. Detection d'une alteration (triggers desactives par un administrateur DB)
begin;
alter table public.fiscal_ledger disable trigger fiscal_ledger_no_mutation;
update public.fiscal_ledger set total_ttc = 999 where restaurant_id = '10000000-0000-0000-0000-00000000000c' and seq = 2;
select t_login('00000000-0000-0000-0000-0000000000c1');
set role authenticated;
select t_assert((public.fiscal_verify_chain() ->> 'ok')::boolean = false
                and public.fiscal_verify_chain() ->> 'error' = 'hash_mismatch'
                and (public.fiscal_verify_chain() ->> 'seq')::int = 2, 'alteration detectee par la verification de chaine (seq 2)');
reset role;
rollback;

\echo
\echo '=== TOUS LES TESTS SQL FISCAUX SONT PASSES ==='
