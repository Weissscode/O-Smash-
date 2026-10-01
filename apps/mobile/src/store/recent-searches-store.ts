import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, storageKeys } from '@/lib/storage';
import { normalizeSearch } from '@/lib/text';

const MAX_RECENT = 8;

type RecentSearchesState = {
  items: string[];
  push: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
};

/** Historique LOCAL des recherches (jamais envoyé au serveur). */
export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      items: [],
      push: (query) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return;
        const key = normalizeSearch(trimmed);
        const rest = get().items.filter((q) => normalizeSearch(q) !== key);
        set({ items: [trimmed, ...rest].slice(0, MAX_RECENT) });
      },
      remove: (query) => set({ items: get().items.filter((q) => q !== query) }),
      clear: () => set({ items: [] }),
    }),
    { name: storageKeys.recentSearches, storage: persistStorage, version: 1 },
  ),
);
