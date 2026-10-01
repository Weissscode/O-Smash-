import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOnline } from '@/hooks/use-network';
import { useTheme } from '@/theme/theme';

import { Icon } from './icon';
import { Text } from './text';

/** Bandeau global : l'utilisateur sait toujours quand il est hors ligne. */
export function OfflineBanner() {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  const { colors, space, radius } = useTheme();
  if (online) return null;
  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + space.xs }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert">
      <View style={[styles.pill, { backgroundColor: colors.primary, borderRadius: radius.pill, gap: space.sm, paddingHorizontal: space.lg }]}>
        <Icon name="wifiOff" size={14} color={colors.onPrimary} />
        <Text variant="caption" tone="onPrimary">
          Hors ligne — les infos peuvent ne pas être à jour
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
