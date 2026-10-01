import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { formatPrice } from '@/lib/money';
import { useTheme } from '@/theme/theme';
import type { Product } from '@/types/domain';

type Props = { product: Product; onPress: () => void; disabled?: boolean };

/** Ligne produit : texte à gauche, gros visuel détouré à droite, bouton +. */
export function ProductRow({ product, onPress, disabled }: Props) {
  const theme = useTheme();
  const unavailable = !product.isAvailable;
  return (
    <PressableScale
      onPress={onPress}
      disabled={unavailable || disabled}
      haptic="selection"
      scaleTo={0.985}
      testID={`product-${product.id}`}
      accessibilityLabel={`${product.name}, ${formatPrice(product.basePrice)}${unavailable ? ', indisponible' : ''}`}
      accessibilityState={{ disabled: unavailable }}
      style={[styles.row, { paddingVertical: theme.space.lg, gap: theme.space.lg, opacity: unavailable ? 0.5 : 1 }]}>
      <View style={[styles.text, { gap: theme.space.xs }]}>
        <View style={[styles.badges, { gap: theme.space.xs }]}>
          {product.isPopular && <Badge label="Populaire" tone="accent" icon="flame" />}
          {product.labels.includes('signature') && <Badge label="Signature" tone="neutral" />}
          {product.labels.includes('vegetarian') && <Badge label="Végé" tone="success" icon="leaf" />}
          {product.labels.includes('spicy') && <Badge label="Épicé" tone="danger" />}
        </View>
        <Text variant="headline" numberOfLines={2}>
          {product.name}
        </Text>
        {product.description ? (
          <Text variant="callout" tone="muted" numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text variant="price" style={{ marginTop: 2 }}>
          {unavailable ? 'Indisponible' : formatPrice(product.basePrice)}
        </Text>
      </View>
      <View style={[styles.media, { borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceMuted }]}>
        {product.image != null ? <Image source={product.image} style={styles.image} contentFit="contain" transition={150} /> : null}
        {!unavailable && !disabled && (
          <View style={[styles.add, { backgroundColor: theme.colors.surface, ...theme.shadow.card }]}>
            <Icon name="plus" size={16} color={theme.colors.text} />
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap' },
  media: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  image: { width: 104, height: 104 },
  add: { position: 'absolute', right: 8, bottom: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
