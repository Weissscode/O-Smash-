-- ============================================================
-- Migration 004 : impression via Supabase Realtime
-- A executer dans Supabase > SQL Editor
--
-- Ajoute une colonne print_request sur orders : quand l'app cree ou
-- met a jour une commande qui doit etre imprimee, elle pose une valeur
-- ('full' | 'cuisine' | 'caisse'). Le serveur d'impression local
-- (server.js) ecoute les changements en temps reel sur cette table et
-- imprime des qu'il voit une valeur non vide, puis la remet a null.
-- ============================================================

alter table public.orders add column if not exists print_request text;

-- Necessaire pour que Supabase diffuse les changements de cette table
-- en temps reel (sinon server.js ne recoit jamais rien).
alter publication supabase_realtime add table public.orders;
