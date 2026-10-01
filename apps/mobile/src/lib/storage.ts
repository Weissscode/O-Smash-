import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Stockage persistant NON sensible (panier, préférences, recherches récentes).
 * Les jetons d'authentification passent eux par services/supabase/secure-storage.
 */
export const persistStorage = createJSONStorage(() => AsyncStorage);

export const storageKeys = {
  cart: 'vicego.cart.v1',
  location: 'vicego.location.v1',
  recentSearches: 'vicego.recent-searches.v1',
  onboarding: 'vicego.onboarding.v1',
} as const;
