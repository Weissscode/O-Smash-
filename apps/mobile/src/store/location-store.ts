import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, storageKeys } from '@/lib/storage';
import type { LatLng } from '@/types/domain';

export type LocationSource = 'device' | 'manual';

export type SavedLocation = {
  coords: LatLng;
  label: string;
  source: LocationSource;
  updatedAt: number;
};

export const RADIUS_OPTIONS_KM = [2, 5, 10, 20] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];

type LocationState = {
  location: SavedLocation | null;
  radiusKm: RadiusKm;
  /** true une fois l'écran d'explication vu (accepté OU refusé). */
  onboardingDone: boolean;
  setLocation: (location: Omit<SavedLocation, 'updatedAt'>) => void;
  setRadius: (radius: RadiusKm) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      radiusKm: 10,
      onboardingDone: false,
      setLocation: (location) => set({ location: { ...location, updatedAt: Date.now() } }),
      setRadius: (radiusKm) => set({ radiusKm }),
      completeOnboarding: () => set({ onboardingDone: true }),
      reset: () => set({ location: null, radiusKm: 10, onboardingDone: false }),
    }),
    { name: storageKeys.location, storage: persistStorage, version: 1 },
  ),
);
