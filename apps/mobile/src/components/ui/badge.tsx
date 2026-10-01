import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type BadgeTone = 'neutral' | 'accent' | 'secondary' | 'success' | 'warning' | 'danger' | 'inverse';

type Props = { label: string; tone?: BadgeTone; icon?: IconName };

export function Badge({ label, tone = 'neutral', icon }: Props) {
  const { colors, radius, space } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.surfaceMuted, fg: colors.text },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    secondary: { bg: colors.secondarySoft, fg: colors.secondary },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    inverse: { bg: colors.primary, fg: colors.onPrimary },
  };
  const c = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderRadius: radius.pill, paddingHorizontal: space.sm, gap: space.xs }]}>
      {icon && <Icon name={icon} size={11} color={c.fg} />}
      <Text variant="overline" color={c.fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 4 },
});
