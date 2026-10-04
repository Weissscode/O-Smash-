# Environnement Supabase STAGING — guide pas à pas

Objectif : un projet Supabase **séparé** où Vice Go, les migrations et les tests peuvent tout casser sans
jamais toucher la base O'SMASH utilisée par la caisse.

> 🔒 **Règle absolue** : toutes les actions marquées **[PROD — LECTURE SEULE]** ne font que lire.
> Aucune commande de ce guide n'écrit dans la production. Toute future écriture en production fera l'objet
> d'une demande explicite séparée, avec le script exact, avant exécution.

---

## Étape 1 — Récupérer le schéma réel de production **[PROD — LECTURE SEULE]**

Les migrations du dépôt (`supabase/*.sql`) ont été appliquées à la main dans le SQL Editor : rien ne garantit
que la base réelle leur correspond. On part donc de la base elle-même.

### 1.a — Récupérer la chaîne de connexion

Supabase → projet de production → bouton **Connect** (en haut) → onglet **Connection string** →
**Session pooler**. Copie l'URL `postgresql://postgres.xxxx:[MOT-DE-PASSE]@...pooler.supabase.com:5432/postgres`.

⚠️ Cette URL contient le mot de passe de la base : ne la colle jamais dans un fichier du dépôt, un chat
public ou un ticket. Garde-la dans ton gestionnaire de mots de passe.

### 1.b — Exporter le schéma (structure uniquement, aucune donnée)

Option A — avec `pg_dump` (client PostgreSQL 17 recommandé : `brew install postgresql@17` sur Mac) :

```bash
export PROD_DB_URL='postgresql://...'          # dans ton terminal uniquement
pg_dump "$PROD_DB_URL" --schema-only --schema=public --no-owner --no-privileges -f prod_schema_public.sql
unset PROD_DB_URL
```

Option B — avec la CLI Supabase (nécessite Docker Desktop lancé) :

```bash
npx supabase db dump --db-url "$PROD_DB_URL" --schema public -f prod_schema_public.sql
```

Le fichier obtenu contient tables, colonnes, index, fonctions, triggers et règles RLS du schéma `public` —
**aucune ligne de données**. Envoie-le-moi : je le compare aux migrations du dépôt et j'en fais la migration
« de base » versionnée.

### 1.c — Sans rien installer : inventaire depuis le SQL Editor

Si tu préfères ne rien installer, exécute ces requêtes (**SELECT uniquement**) dans
Supabase → SQL Editor, puis exporte chaque résultat en CSV (bouton *Export*) et envoie-les-moi.

```sql
-- 1) Tables et colonnes
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 2) Règles RLS
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3) RLS activée par table
select relname as table_name, relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by relname;

-- 4) Fonctions
select p.proname, pg_get_function_identity_arguments(p.oid) as args, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;

-- 5) Tables diffusées en temps réel
select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';

-- 6) Volumétrie (nombre de lignes, sans lire les données)
select relname as table_name, n_live_tup as approx_rows
from pg_stat_user_tables where schemaname = 'public' order by relname;
```

### 1.d — Le plus simple : tout l'inventaire en UNE requête (SELECT uniquement)

Colle ceci dans Supabase → SQL Editor (projet de production), clique **Run**, puis clique sur la cellule
`inventaire` du résultat → **Copy** et colle le texte à l'IA. Aucune donnée client n'est lue : uniquement la
structure, les règles et le nombre approximatif de lignes par table.

```sql
select json_build_object(
  'migrations', (select json_object_agg(m, ok) from (values
    ('schema_base',            to_regclass('public.orders') is not null and to_regclass('public.profiles') is not null),
    ('002_orders_num',         exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='split_of')),
    ('003_product_stock',      to_regclass('public.product_stock') is not null),
    ('004_print_request',      exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='print_request')),
    ('004_realtime_orders',    exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='orders')),
    ('005_fidelite',           to_regclass('public.loyalty_transactions') is not null),
    ('005_print_error',        exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='print_error')),
    ('006_slug_consentements', exists (select 1 from information_schema.columns where table_schema='public' and table_name='customers' and column_name='consentement_cgu')),
    ('006_order_counter',      to_regprocedure('public.next_order_num(uuid)') is not null),
    ('007_staff_permissions',  to_regprocedure('public.is_current_user_gerant()') is not null),
    ('008_fiscal_engine',      exists (select 1 from information_schema.columns where table_schema='public' and table_name='restaurants' and column_name='fiscal_profile'))
  ) as t(m, ok)),
  'colonnes', (select json_object_agg(table_name, cols) from (
    select table_name, json_agg(column_name || ' ' || data_type || case when is_nullable = 'NO' then ' not null' else '' end order by ordinal_position) as cols
    from information_schema.columns where table_schema = 'public' group by table_name) c),
  'rls_active', (select json_object_agg(c.relname, c.relrowsecurity)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'),
  'policies', (select json_agg(json_build_object('table', tablename, 'nom', policyname, 'cmd', cmd, 'using', qual, 'check', with_check))
    from pg_policies where schemaname = 'public'),
  'fonctions', (select json_agg(p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' || case when p.prosecdef then ' SECURITY DEFINER' else '' end)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'),
  'realtime', (select json_agg(tablename) from pg_publication_tables where pubname = 'supabase_realtime'),
  'lignes_approx', (select json_object_agg(relname, n_live_tup) from pg_stat_user_tables where schemaname = 'public'),
  'historique_cli', to_regclass('supabase_migrations.schema_migrations') is not null
) as inventaire;
```

---

## Étape 2 — Vérifier quelles migrations sont réellement appliquées **[PROD — LECTURE SEULE]**

Une seule requête, à coller dans le SQL Editor. Chaque ligne indique si la marque laissée par une migration
du dépôt est présente en production :

```sql
select * from (values
  ('schema.sql — tables de base',            to_regclass('public.orders') is not null and to_regclass('public.profiles') is not null),
  ('002 — orders.num / split_of',            exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='split_of')),
  ('003 — product_stock',                    to_regclass('public.product_stock') is not null),
  ('004 — orders.print_request + realtime',  exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='print_request')
                                             and exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='orders')),
  ('005 — fidélité (customers, ledger…)',    to_regclass('public.loyalty_transactions') is not null),
  ('005 — orders.print_error',               exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='print_error')),
  ('006 — restaurants.slug + consentements', exists (select 1 from information_schema.columns where table_schema='public' and table_name='customers' and column_name='consentement_cgu')),
  ('006 — order_counters + next_order_num',  to_regprocedure('public.next_order_num(uuid)') is not null),
  ('007 — permissions staff/gérant',         to_regprocedure('public.is_current_user_gerant()') is not null
                                             and exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='modifier_son_profil' and with_check is not null))
) as t(migration, appliquee);
```

Toute ligne à `false` est un écart entre le dépôt et la production : on le traite **avant** toute nouvelle
migration Vice Go. Vérifie aussi s'il existe un historique de migrations géré par la CLI :

```sql
select to_regclass('supabase_migrations.schema_migrations') is not null as historique_cli_present;
```

---

## Étape 3 — Créer le projet staging

1. Supabase → **New project**.
2. Nom : `vicego-staging` · Organisation : la même que la prod.
3. **Région : la même que la production** (Settings → General du projet prod) pour des performances comparables.
4. Mot de passe de base : généré, fort, rangé dans ton gestionnaire de mots de passe (différent de la prod).
5. Plan gratuit possible au début (le projet se met en pause après ~1 semaine sans activité ; il suffit de le relancer).

Note les valeurs **publiques** du staging : Settings → API → *Project URL* et clé **publishable** (`sb_publishable_…`).
La clé **secrète** (`sb_secret_…`) ne sert qu'aux fonctions serveur : elle ne va jamais dans l'app ni dans Git.

---

## Étape 4 — Reproduire la structure et des données de TEST uniquement

1. **Structure** : on applique au staging le schéma exporté à l'étape 1 (c'est la production qui fait foi) :

   ```bash
   export STAGING_DB_URL='postgresql://...staging...'
   psql "$STAGING_DB_URL" -v ON_ERROR_STOP=1 -f prod_schema_public.sql
   psql "$STAGING_DB_URL" -c "alter publication supabase_realtime add table public.orders;"
   unset STAGING_DB_URL
   ```

   Je préparerai ensuite cette structure sous forme de **migration de base versionnée** dans `supabase/migrations/`,
   pour que staging et (plus tard) production soient gérés par la CLI Supabase, avec historique.

2. **Données** : on ne copie **aucune donnée de production** (téléphones, e-mails, historiques clients = données
   personnelles, RGPD). Je fournirai un script de données fictives (`supabase/seed/staging.sql`) :
   restaurant O'SMASH de test (même catalogue, mêmes PID), 2 restaurants fictifs, un compte gérant et un compte
   staff de test, des clients fidélité fictifs, quelques commandes.

3. **Auth** (Supabase → Authentication → URL Configuration du staging) : les redirections OAuth
   (`vicego-dev://`, `vicego-preview://`) seront configurées en phase 4.

---

## Étape 5 — Variables d'environnement staging / production

Voir [`environnements.md`](./environnements.md) : tableau complet de qui utilise quel projet, et où chaque
variable est définie.
