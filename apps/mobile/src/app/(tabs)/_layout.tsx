import { Redirect } from 'expo-router';

import AppTabs from '@/components/navigation/app-tabs';
import { useHydrated } from '@/hooks/use-hydrated';
import { useLocationStore } from '@/store/location-store';

export default function TabsLayout() {
  const hydrated = useHydrated(useLocationStore);
  const onboardingDone = useLocationStore((s) => s.onboardingDone);
  if (!hydrated) return null;
  // Pas de compte requis : l'onboarding ne sert qu'à expliquer la géolocalisation.
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <AppTabs />;
}
