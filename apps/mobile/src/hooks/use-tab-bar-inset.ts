import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Hauteur occupée en bas par la barre d'onglets (native ou web), safe area incluse. */
export const TAB_BAR_HEIGHT = Platform.select({ ios: 50, android: 80, default: 68 });

export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_HEIGHT;
}
