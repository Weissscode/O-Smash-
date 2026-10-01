import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { toAppError } from '@/lib/errors';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        retry: (count, error) => {
          const kind = toAppError(error).kind;
          return (kind === 'network' || kind === 'unknown') && count < 2;
        },
      },
      mutations: {
        // Jamais de nouvel essai automatique d'une écriture (commande, paiement) :
        // l'idempotence est gérée explicitement par les fonctions serveur.
        retry: false,
      },
    },
  });
}

let bound = false;

/** Relie TanStack Query à l'état réseau et au premier plan de l'app. */
export function bindQueryLifecycle() {
  if (bound) return;
  bound = true;
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(state.isConnected !== false && state.isInternetReachable !== false)),
  );
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (status: AppStateStatus) => focusManager.setFocused(status === 'active'));
  }
}

export const queryKeys = {
  categories: ['catalog', 'categories'] as const,
  restaurants: ['catalog', 'restaurants'] as const,
  menu: (slug: string) => ['catalog', 'menu', slug] as const,
  product: (id: string) => ['catalog', 'product', id] as const,
  search: (text: string) => ['catalog', 'search', text] as const,
};
