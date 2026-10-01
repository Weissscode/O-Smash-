import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import type { TextStyle } from 'react-native';

/**
 * Anton : grands titres et accroches uniquement (toujours en capitales).
 * Inter : toute l'interface — très lisible aux petites tailles.
 * Chaque graisse est une famille distincte pour un rendu identique iOS/Android.
 */
export const fontAssets = {
  Anton: Anton_400Regular,
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-SemiBold': Inter_600SemiBold,
  'Inter-Bold': Inter_700Bold,
  'Inter-ExtraBold': Inter_800ExtraBold,
} as const;

export const fonts = {
  display: 'Anton',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extrabold: 'Inter-ExtraBold',
} as const;

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'headline'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'caption'
  | 'overline'
  | 'price';

export const textVariants: Record<TextVariant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 44, lineHeight: 54, textTransform: 'uppercase', letterSpacing: 0.3 },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, textTransform: 'uppercase', letterSpacing: 0.3 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, textTransform: 'uppercase', letterSpacing: 0.4 },
  headline: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  callout: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
  price: { fontFamily: fonts.extrabold, fontSize: 16, lineHeight: 20, fontVariant: ['tabular-nums'] },
};
