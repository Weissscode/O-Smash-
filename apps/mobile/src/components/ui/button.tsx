import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  icon?: IconName;
  /** Contenu aligné à droite (ex. prix sur le bouton "Ajouter"). */
  trailing?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  trailing,
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityHint,
  testID,
}: Props) {
  const { colors, radius, touch, space } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    accent: { bg: colors.accent, fg: colors.onAccent },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.text },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  };
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <PressableScale
      testID={testID}
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      haptic={variant === 'ghost' ? 'selection' : 'tap'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderRadius: radius.pill,
          minHeight: size === 'lg' ? touch.button : touch.min,
          paddingHorizontal: size === 'lg' ? space.xxl : space.lg,
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={[styles.row, { gap: space.sm }]}>
          {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} color={p.fg} />}
          <Text variant={size === 'lg' ? 'headline' : 'callout'} color={p.fg} style={trailing ? styles.grow : undefined} numberOfLines={1}>
            {label}
          </Text>
          {trailing}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' },
  grow: { flex: 1 },
});
