import { useSyncExternalStore } from 'react';

type PersistApi = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
};

/** true une fois qu'un store zustand persisté a relu ses données sur l'appareil. */
export function useHydrated(store: PersistApi): boolean {
  return useSyncExternalStore(
    (onChange) => store.persist.onFinishHydration(onChange),
    () => store.persist.hasHydrated(),
    () => false,
  );
}
