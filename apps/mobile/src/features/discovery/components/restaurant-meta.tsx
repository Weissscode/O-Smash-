import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatEtaRange } from '@/lib/eta';
import { formatDistance } from '@/lib/geo';
import { useTheme } from '@/theme/theme';

import type { RestaurantView } from '../restaurant-view';

/** Ligne "⏱ 15–20 min · 1,2 km · Smash burger". */
export function RestaurantMeta({ view, showCuisine = true }: { view: RestaurantView; showCuisine?: boolean }) {
  const { colors, space } = useTheme();
  const parts: string[] = [];
  if (view.distanceKm !== null) parts.push(formatDistance(view.distanceKm));
  if (showCuisine) parts.push(view.restaurant.cuisineLabel);
  return (
    <View style={[styles.row, { gap: space.xs }]}>
      <Icon name="clock" size={13} color={colors.textMuted} />
      <Text variant="callout" tone="muted" numberOfLines={1}>
        <Text variant="callout" style={{ color: colors.text }}>
          {view.canOrderNow ? formatEtaRange(view.eta.range) : '—'}
        </Text>
        {parts.length ? `  ·  ${parts.join('  ·  ')}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
