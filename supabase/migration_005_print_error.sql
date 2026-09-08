-- ============================================================
-- Migration 005 : visibilite des echecs d'impression
-- A executer dans Supabase > SQL Editor
--
-- Ajoute une colonne print_error sur orders. server.js l'ecrit a chaque
-- fois qu'il traite un print_request : null si tout s'est bien imprime,
-- sinon un resume de ce qui a echoue (ex: "caisse: Timeout 192.168.1.37").
-- Permet a l'appli de savoir qu'un ticket n'est jamais sorti, meme si
-- l'ecran affichait "Ticket envoye a l'imprimante..." au moment de la
-- commande (ce message est optimiste, il ne veut pas dire que
-- l'impression a reussi).
-- ============================================================

alter table public.orders add column if not exists print_error text;
