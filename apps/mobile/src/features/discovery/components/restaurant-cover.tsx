import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Checker } from '@/components/ui/checker';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme/theme';
import { fixedColors } from '@/theme/tokens';
import type { Restaurant } from '@/types/domain';

type Props = {
  restaurant: Pick<Restaurant, 'name' | 'cover' | 'brandColor'>;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  dimmed?: boolean;
};

/**
 * Visuel de couverture. Sans photo, on génère une couverture typographique
 * (couleur de marque + damier + nom en Anton) : jamais de trou gris.
 */
export function RestaurantCover({ restaurant, height, radius = 0, style, dimmed }: Props) {
  const theme = useTheme();
  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: theme.colors.primary }, style]}>
      {restaurant.cover != null ? (
        <>
          <LinearGradient colors={[restaurant.brandColor, fixedColors.ink]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Image source={restaurant.cover} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: restaurant.brandColor }]}>
          <View style={styles.generated}>
            <Text variant="display" color={fixedColors.ink} numberOfLines={2} style={styles.generatedText}>
              {restaurant.name.replace(/\s*\(démo\)/i, '')}
            </Text>
          </View>
          <View style={styles.bottomChecker}>
            <Checker cell={7} height={14} colorA={fixedColors.ink} colorB={restaurant.brandColor} />
          </View>
        </View>
      )}
      {dimmed && <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  generated: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  generatedText: { opacity: 0.9 },
  bottomChecker: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
