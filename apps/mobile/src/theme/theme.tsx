import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, layout, lightColors, motion, radius, shadow, space, touch, type ColorTokens } from './tokens';
import { fonts, textVariants } from './typography';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  space: typeof space;
  radius: typeof radius;
  motion: typeof motion;
  touch: typeof touch;
  shadow: typeof shadow;
  layout: typeof layout;
  fonts: typeof fonts;
  text: typeof textVariants;
};

export function buildTheme(scheme: 'light' | 'dark'): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    space,
    radius,
    motion,
    touch,
    shadow,
    layout,
    fonts,
    text: textVariants,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({ children, forcedScheme }: { children: ReactNode; forcedScheme?: 'light' | 'dark' }) {
  const system = useColorScheme();
  const scheme = forcedScheme ?? (system === 'dark' ? 'dark' : 'light');
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
