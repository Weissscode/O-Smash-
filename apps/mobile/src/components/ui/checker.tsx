import { useId } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

type Props = {
  /** Taille d'une case en points. */
  cell?: number;
  height?: number;
  colorA?: string;
  colorB?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Damier — signature graphique Vice Go. À utiliser avec parcimonie :
 * bandeaux fins, bords de cartes, onboarding, jamais en fond d'écran entier.
 */
export function Checker({ cell = 8, height = cell * 2, colorA, colorB, opacity = 1, style }: Props) {
  const theme = useTheme();
  const id = `checker-${useId().replace(/:/g, '')}`;
  const a = colorA ?? theme.colors.checkerA;
  const b = colorB ?? theme.colors.checkerB;
  return (
    <Svg width="100%" height={height} style={style} opacity={opacity} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <Pattern id={id} width={cell * 2} height={cell * 2} patternUnits="userSpaceOnUse">
          <Rect width={cell * 2} height={cell * 2} fill={b} />
          <Rect width={cell} height={cell} fill={a} />
          <Rect x={cell} y={cell} width={cell} height={cell} fill={a} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
