import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme/theme';
import type { ColorTokens } from '@/theme/tokens';
import type { TextVariant } from '@/theme/typography';

export type TextTone = 'default' | 'muted' | 'subtle' | 'inverse' | 'accent' | 'success' | 'warning' | 'danger' | 'onPrimary';

const toneToColor: Record<TextTone, keyof ColorTokens> = {
  default: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  inverse: 'textInverse',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  onPrimary: 'onPrimary',
};

export type TextProps = RNTextProps & { variant?: TextVariant; tone?: TextTone; color?: string; align?: 'left' | 'center' | 'right' };

export function Text({ variant = 'body', tone = 'default', color, align, style, ...rest }: TextProps) {
  const theme = useTheme();
  const isHeading = variant === 'hero' || variant === 'display' || variant === 'title';
  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : rest.accessibilityRole}
      maxFontSizeMultiplier={isHeading ? 1.3 : 1.8}
      style={[theme.text[variant], { color: color ?? theme.colors[toneToColor[tone]] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
