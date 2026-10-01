import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { describeOpenStatus } from '@/lib/opening-hours';
import { useTheme } from '@/theme/theme';

import type { RestaurantView } from '../restaurant-view';
import { RestaurantCover } from './restaurant-cover';
import { RestaurantMeta } from './restaurant-meta';

type Props = { view: RestaurantView; now: Date; onPress: () => void; variant?: 'full' | 'compact' };

export function RestaurantCard({ view, now, onPress, variant = 'full' }: Props) {
  const theme = useTheme();
  const { restaurant, status } = view;
  const closed = !view.canOrderNow;
  const coverHeight = variant === 'full' ? 176 : 120;
  const statusLabel = describeOpenStatus(status, now, restaurant.timezone);

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={0.98}
      accessibilityLabel={`${restaurant.name}, ${statusLabel}`}
      accessibilityHint="Ouvre le menu du restaurant"
      testID={`restaurant-card-${restaurant.slug}`}
      style={[variant === 'compact' && { width: 260 }]}>
      <View>
        <RestaurantCover restaurant={restaurant} height={coverHeight} radius={theme.radius.xl} dimmed={closed} />
        <View style={[styles.topBadges, { padding: theme.space.md, gap: theme.space.xs }]}>
          {status.state === 'paused' && <Badge label="En pause" tone="inverse" icon="pause" />}
          {status.state === 'closed' && <Badge label="Fermé" tone="inverse" />}
          {status.state === 'open' && status.closingSoon && <Badge label="Ferme bientôt" tone="warning" />}
          {restaurant.loyaltyEnabled && <Badge label="Fidélité" tone="secondary" icon="gift" />}
        </View>
        {restaurant.logo != null && (
          <View style={[styles.logo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.bg, ...theme.shadow.card }]}>
            <Image source={restaurant.logo} style={styles.logoImg} contentFit="contain" />
          </View>
        )}
      </View>
      <View style={{ paddingTop: theme.space.md, paddingHorizontal: theme.space.xs, gap: 2 }}>
        <View style={styles.titleRow}>
          <Text variant="headline" numberOfLines={1} style={styles.flex}>
            {restaurant.name}
          </Text>
          <View style={[styles.score, { gap: 3 }]}>
            <Icon name="flame" size={12} color={theme.colors.accent} />
            <Text variant="caption" tone="muted">
              {restaurant.popularity}
            </Text>
          </View>
        </View>
        {closed ? (
          <Text variant="callout" tone="muted" numberOfLines={1}>
            {statusLabel}
          </Text>
        ) : (
          <RestaurantMeta view={view} />
        )}
      </View>
    </PressableScale>
  );
}

export function RestaurantCardSkeleton({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const theme = useTheme();
  return (
    <View style={[variant === 'compact' && { width: 260 }, { gap: theme.space.sm }]}>
      <Skeleton height={variant === 'full' ? 176 : 120} radius={theme.radius.xl} />
      <Skeleton width="60%" height={18} />
      <Skeleton width="40%" height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBadges: { position: 'absolute', top: 0, left: 0, flexDirection: 'row', flexWrap: 'wrap' },
  logo: { position: 'absolute', right: 14, bottom: -18, width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: 42, height: 42, borderRadius: 21 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 64 },
  score: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  flex: { flexShrink: 1 },
});
