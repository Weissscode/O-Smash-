/**
 * Design tokens Vice Go — source unique des couleurs, espacements, rayons,
 * ombres et durées. Aucun composant ne doit coder une couleur en dur.
 *
 * Identité : base encre profonde + crème chaude, accent "Vice" rose néon
 * (hérité de la lueur du logo Vice Code), violet électrique en second accent
 * (clin d'œil au lilas de la borne O'SMASH). Le damier reste une signature
 * ponctuelle (voir components/ui/checker.tsx), jamais un fond plein.
 */

const palette = {
  ink: '#0E0D12',
  ink2: '#17151D',
  ink3: '#221F2A',
  ink4: '#2E2A38',
  cream: '#F7F4EF',
  cream2: '#EFEAE2',
  white: '#FFFFFF',
  vice: '#E5175A',
  viceSoft: '#FFE3EC',
  viceGlow: '#FF4F86',
  violet: '#6E4CF5',
  violetSoft: '#ECE7FF',
  green: '#178A50',
  greenSoft: '#E2F5EA',
  amber: '#B86E00',
  amberSoft: '#FFF1D9',
  red: '#C9302C',
  redSoft: '#FDE8E7',
  grey500: '#6B6775',
  grey400: '#8E8A97',
  grey300: '#C9C5CF',
  grey200: '#E4E0E6',
} as const;

export type ColorTokens = {
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceMuted: string;
  surfacePressed: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  secondary: string;
  secondarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  skeleton: string;
  skeletonHighlight: string;
  overlay: string;
  checkerA: string;
  checkerB: string;
};

export const lightColors: ColorTokens = {
  bg: palette.cream,
  bgElevated: palette.white,
  surface: palette.white,
  surfaceMuted: palette.cream2,
  surfacePressed: palette.grey200,
  border: palette.grey200,
  text: palette.ink,
  textMuted: palette.grey500,
  textSubtle: palette.grey400,
  textInverse: palette.white,
  primary: palette.ink,
  onPrimary: palette.white,
  accent: palette.vice,
  accentSoft: palette.viceSoft,
  onAccent: palette.white,
  secondary: palette.violet,
  secondarySoft: palette.violetSoft,
  success: palette.green,
  successSoft: palette.greenSoft,
  warning: palette.amber,
  warningSoft: palette.amberSoft,
  danger: palette.red,
  dangerSoft: palette.redSoft,
  skeleton: palette.cream2,
  skeletonHighlight: palette.white,
  overlay: 'rgba(14,13,18,0.55)',
  checkerA: palette.ink,
  checkerB: palette.cream,
};

export const darkColors: ColorTokens = {
  bg: palette.ink,
  bgElevated: palette.ink2,
  surface: palette.ink2,
  surfaceMuted: palette.ink3,
  surfacePressed: palette.ink4,
  border: palette.ink4,
  text: palette.cream,
  textMuted: palette.grey300,
  textSubtle: palette.grey400,
  textInverse: palette.ink,
  primary: palette.cream,
  onPrimary: palette.ink,
  accent: palette.viceGlow,
  accentSoft: '#3A1424',
  onAccent: palette.ink,
  secondary: '#9C84FF',
  secondarySoft: '#251D45',
  success: '#3FC47F',
  successSoft: '#12301F',
  warning: '#F2B042',
  warningSoft: '#33260E',
  danger: '#FF6B66',
  dangerSoft: '#3A1513',
  skeleton: palette.ink3,
  skeletonHighlight: palette.ink4,
  overlay: 'rgba(0,0,0,0.6)',
  checkerA: palette.cream,
  checkerB: palette.ink,
};

/** Grille de 4 pt. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

/** Durées courtes : l'app doit paraître instantanée. */
export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
  pressScale: 0.97,
} as const;

/** Cibles tactiles : jamais en dessous de 44 pt (HIG Apple). */
export const touch = {
  min: 44,
  button: 56,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

export const layout = {
  gutter: space.xl,
  maxContentWidth: 640,
} as const;

/** Couleurs indépendantes du thème (ex. texte posé sur une couleur de marque). */
export const fixedColors = {
  ink: palette.ink,
  white: palette.white,
  cream: palette.cream,
} as const;
