import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env } from '@/validation/env';

import { secureSessionStorage } from './secure-storage';

/**
 * Client Supabase unique de l'app (clé publishable + RLS).
 * Renvoie null tant qu'aucun projet n'est configuré (phase 1 en données
 * de démonstration) : les appelants affichent alors un état explicite au
 * lieu d'échouer silencieusement.
 */
let client: SupabaseClient | null = null;
let appStateBound = false;

export function getSupabase(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: secureSessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
  }
  if (!appStateBound && Platform.OS !== 'web') {
    appStateBound = true;
    // Rafraîchit le jeton uniquement quand l'app est au premier plan.
    AppState.addEventListener('change', (state) => {
      if (!client) return;
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!env.supabaseUrl && !!env.supabaseAnonKey;
}
