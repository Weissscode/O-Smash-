-- ============================================================
-- Migration 002 : ajout des colonnes manquantes sur orders
-- A executer dans Supabase > SQL Editor (en plus de schema.sql,
-- ne remplace rien - juste un ajout)
-- ============================================================

alter table public.orders add column if not exists num integer;
alter table public.orders add column if not exists split_of integer;
