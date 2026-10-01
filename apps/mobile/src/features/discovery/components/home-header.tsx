import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Checker } from '@/components/ui/checker';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useLocationStore } from '@/store/location-store';
import { useTheme } from '@/theme/theme';

export function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 11) return 'Bien réveillé ?';
  if (h < 15) return "C'est l'heure du midi";
  if (h < 18) return 'Petit creux ?';
  if (h < 23) return 'Ça mange quoi ce soir ?';
  return 'Faim de nuit ?';
}

export function HomeHeader({ now }: { now: Date }) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const location = useLocationStore((s) => s.location);

  return (
    <View style={{ paddingTop: insets.top + theme.space.sm }}>
      <View style={[styles.topRow, { paddingHorizontal: theme.layout.gutter }]}>
        <PressableScale
          haptic="selection"
          onPress={() => router.push('/location')}
          accessibilityLabel={location ? `Position : ${location.label}. Modifier` : 'Choisir ma position'}
          testID="location-pill"
          style={[styles.locationPill, { gap: theme.space.xs }]}>
          <Icon name={location?.source === 'device' ? 'location' : 'pin'} size={15} color={theme.colors.accent} />
          <View>
            <Text variant="overline" tone="muted">
              Autour de
            </Text>
            <View style={[styles.row, { gap: 4 }]}>
              <Text variant="headline" numberOfLines={1} style={styles.locationLabel}>
                {location?.label ?? 'Choisir une position'}
              </Text>
              <Icon name="chevronDown" size={12} color={theme.colors.text} />
            </View>
          </View>
        </PressableScale>
        <View style={[styles.brand, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}>
          <Text variant="title" tone="onPrimary" style={styles.brandText}>
            VICE<Text variant="title" tone="accent" style={styles.brandText}>GO</Text>
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: theme.layout.gutter, marginTop: theme.space.xl }}>
        <Text variant="hero" numberOfLines={2}>
          {greetingFor(now)}
        </Text>
      </View>

      <View style={{ paddingHorizontal: theme.layout.gutter, marginTop: theme.space.lg }}>
        <PressableScale
          haptic="selection"
          scaleTo={0.985}
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          accessibilityLabel="Rechercher un restaurant, un plat ou une catégorie"
          testID="home-search"
          style={[
            styles.search,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill, borderColor: theme.colors.border, gap: theme.space.sm, ...theme.shadow.card },
          ]}>
          <Icon name="search" size={18} color={theme.colors.text} />
          <Text variant="body" tone="subtle" style={styles.flex}>
            Burger, tacos, O&apos;SMASH…
          </Text>
        </PressableScale>
      </View>
      <View style={{ marginTop: theme.space.xl, marginBottom: theme.space.lg, paddingHorizontal: theme.layout.gutter }}>
        <View style={[styles.checkerWrap, { borderRadius: theme.radius.sm }]}>
          <Checker cell={5} height={10} opacity={0.9} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center' },
  locationPill: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minHeight: 44, paddingRight: 12 },
  locationLabel: { maxWidth: 220 },
  brand: { paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-3deg' }] },
  brandText: { fontSize: 18, lineHeight: 22 },
  search: { flexDirection: 'row', alignItems: 'center', minHeight: 54, paddingHorizontal: 18, borderWidth: StyleSheet.hairlineWidth },
  flex: { flex: 1 },
  checkerWrap: { overflow: 'hidden', width: 64 },
});
