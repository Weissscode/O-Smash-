import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Checker } from '@/components/ui/checker';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { requestDeviceLocation } from '@/features/location/location-service';
import { haptics } from '@/lib/haptics';
import { useLocationStore } from '@/store/location-store';
import { ThemeProvider, useTheme } from '@/theme/theme';

const heroImage = require('@/assets/fixtures/osmash/smoke.webp');

/** Onboarding toujours sombre : c'est la "vitrine" de la marque Vice Go. */
export default function OnboardingScreen() {
  return (
    <ThemeProvider forcedScheme="dark">
      <Onboarding />
    </ThemeProvider>
  );
}

function Onboarding() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setLocation = useLocationStore((s) => s.setLocation);
  const completeOnboarding = useLocationStore((s) => s.completeOnboarding);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const finish = () => {
    completeOnboarding();
    router.replace('/');
  };

  const useMyLocation = async () => {
    setLoading(true);
    setMessage(null);
    const result = await requestDeviceLocation();
    setLoading(false);
    if (result.status === 'granted') {
      haptics.success();
      setLocation(result.location);
      finish();
    } else if (result.status === 'denied') {
      haptics.warning();
      completeOnboarding();
      router.replace('/');
      router.push('/location');
    } else {
      setMessage(result.message);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom + theme.space.lg }]}>
      <View style={styles.checkerTop}>
        <Checker cell={10} height={20} opacity={0.12} />
      </View>

      <Animated.View entering={FadeInUp.duration(500)} style={[styles.brandRow, { paddingHorizontal: theme.layout.gutter, marginTop: theme.space.xl }]}>
        <Text variant="hero" style={styles.logo}>
          VICE
        </Text>
        <View style={[styles.goTag, { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md }]}>
          <Text variant="hero" color={theme.colors.onAccent} style={styles.logo}>
            GO
          </Text>
        </View>
      </Animated.View>

      <View style={styles.heroWrap}>
        <View style={[styles.glow, { backgroundColor: theme.colors.accent }]} />
        <Animated.View entering={FadeInDown.delay(120).springify().damping(14)}>
          <Image source={heroImage} style={styles.hero} contentFit="contain" accessibilityIgnoresInvertColors />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(220).duration(400)} style={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.md }}>
        <Text variant="display">Les meilleurs snacks, sans attendre.</Text>
        <Text variant="body" tone="muted">
          Commande, paie et récupère ta commande sur place ou à emporter.
        </Text>

        <View style={[styles.why, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.md, marginTop: theme.space.sm }]}>
          <Icon name="location" size={20} color={theme.colors.accent} />
          <Text variant="callout" tone="muted" style={styles.flex}>
            Ta position sert uniquement à trouver les restaurants proches et à calculer les distances. Tu peux aussi saisir une ville.
          </Text>
        </View>
        {message && (
          <Text variant="callout" tone="danger" accessibilityRole="alert">
            {message}
          </Text>
        )}
      </Animated.View>

      <View style={[styles.actions, { paddingHorizontal: theme.layout.gutter, gap: theme.space.sm }]}>
        <Button label="Utiliser ma position" icon="location" variant="primary" loading={loading} onPress={useMyLocation} testID="onboarding-locate" />
        <Button
          label="Saisir une ville ou un code postal"
          variant="ghost"
          onPress={() => {
            completeOnboarding();
            router.replace('/');
            router.push('/location');
          }}
          testID="onboarding-manual"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  checkerTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { fontSize: 52, lineHeight: 60 },
  goTag: { paddingHorizontal: 10, transform: [{ rotate: '-4deg' }] },
  heroWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, opacity: 0.22 },
  hero: { width: 300, height: 220 },
  why: { flexDirection: 'row', alignItems: 'center' },
  actions: { marginTop: 'auto', paddingTop: 20 },
});
