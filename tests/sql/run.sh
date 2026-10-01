#!/usr/bin/env bash
# Usage: PGHOST=/tmp PGPORT=5544 PGUSER=postgres tests/sql/run.sh
# Cree une base jetable, applique schema + migrations + migration 008, execute
# tests/sql/fiscal_engine.test.sql. N'utilise JAMAIS Supabase.
set -euo pipefail
cd "$(dirname "$0")/../.."
DB="vice_fiscal_test_$$"
export PGOPTIONS="-c client_min_messages=notice"
P="psql -v ON_ERROR_STOP=1 -q -X -d $DB"
createdb "$DB"
trap 'dropdb --if-exists "$DB" >/dev/null 2>&1 || true' EXIT
$P -f tests/sql/00_supabase_stub.sql
$P -f supabase/schema.sql
for f in supabase/migration_00[2-7]*.sql supabase/migration_008_fiscal_engine.sql; do
  echo "-- apply $f"; $P -f "$f"
done
$P -f tests/sql/fiscal_engine.test.sql
