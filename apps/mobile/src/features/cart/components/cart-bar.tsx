import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { formatPrice } from '@/lib/money';
import { selectItemCount, selectSubtotal, useCartStore } from '@/store/cart-store';
import { useTheme } from '@/theme/theme';

type Props = {
  /** N'afficher que si le panier appartient à ce restaurant. */
  restaurantId?: string;
  bottomOffset?: number;
};

/** Barre flottante "Voir le panier" : le panier est toujours à un tap. */
export function CartBar({ restaurantId, bottomOffset = 0 }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const count = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  const cartRestaurantId = useCartStore((s) => s.restaurantId);
  const restaurantName = useCartStore((s) => s.restaurantName);

  if (count === 0 || (restaurantId && cartRestaurantId !== restaurantId)) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(160)}
      layout={LinearTransition}
      style={[styles.wrap, { bottom: bottomOffset + theme.space.md, paddingHorizontal: theme.layout.gutter }]}>
      <PressableScale
        onPress={() => router.push('/cart')}
        testID="cart-bar"
        accessibilityLabel={`Voir le panier, ${count} article${count > 1 ? 's' : ''}, ${formatPrice(subtotal)}`}
        style={[styles.bar, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill, ...theme.shadow.floating }]}>
        <View style={[styles.count, { backgroundColor: theme.colors.accent }]}>
          <Text variant="headline" color={theme.colors.onAccent}>
            {count}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text variant="headline" tone="onPrimary">
            Voir le panier
          </Text>
          {!restaurantId && restaurantName ? (
            <Text variant="caption" color={theme.colors.onPrimary} style={styles.sub} numberOfLines={1}>
              {restaurantName}
            </Text>
          ) : null}
        </View>
        <Text variant="price" tone="onPrimary">
          {formatPrice(subtotal)}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0 },
  bar: { flexDirection: 'row', alignItems: 'center', minHeight: 60, paddingLeft: 8, paddingRight: 22, gap: 12 },
  count: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  sub: { opacity: 0.7 },
});
