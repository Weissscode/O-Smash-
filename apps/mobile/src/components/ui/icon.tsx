import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from '@/theme/theme';

/**
 * Icône multiplateforme : SF Symbol sur iOS, Material Symbol sur Android/web.
 * Le catalogue d'icônes de l'app est centralisé dans `icons` pour garder un
 * vocabulaire visuel cohérent.
 */
export const icons = {
  home: { ios: 'house.fill', material: 'home' },
  search: { ios: 'magnifyingglass', material: 'search' },
  orders: { ios: 'bag.fill', material: 'shopping_bag' },
  profile: { ios: 'person.crop.circle.fill', material: 'account_circle' },
  location: { ios: 'location.fill', material: 'near_me' },
  pin: { ios: 'mappin.and.ellipse', material: 'location_on' },
  chevronDown: { ios: 'chevron.down', material: 'expand_more' },
  chevronRight: { ios: 'chevron.right', material: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', material: 'chevron_left' },
  close: { ios: 'xmark', material: 'close' },
  clock: { ios: 'clock.fill', material: 'schedule' },
  walk: { ios: 'figure.walk', material: 'directions_walk' },
  star: { ios: 'star.fill', material: 'star' },
  heart: { ios: 'heart', material: 'favorite' },
  plus: { ios: 'plus', material: 'add' },
  minus: { ios: 'minus', material: 'remove' },
  check: { ios: 'checkmark', material: 'check' },
  trash: { ios: 'trash', material: 'delete' },
  bag: { ios: 'bag.fill', material: 'shopping_bag' },
  gift: { ios: 'gift.fill', material: 'redeem' },
  wifiOff: { ios: 'wifi.slash', material: 'wifi_off' },
  warning: { ios: 'exclamationmark.triangle.fill', material: 'warning' },
  sliders: { ios: 'slider.horizontal.3', material: 'tune' },
  history: { ios: 'clock.arrow.circlepath', material: 'history' },
  dineIn: { ios: 'fork.knife', material: 'restaurant' },
  takeaway: { ios: 'takeoutbag.and.cup.and.straw.fill', material: 'takeout_dining' },
  card: { ios: 'creditcard.fill', material: 'credit_card' },
  bell: { ios: 'bell.fill', material: 'notifications' },
  help: { ios: 'questionmark.circle.fill', material: 'help' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', material: 'logout' },
  pause: { ios: 'pause.circle.fill', material: 'pause_circle' },
  sparkles: { ios: 'sparkles', material: 'auto_awesome' },
  leaf: { ios: 'leaf.fill', material: 'eco' },
  flame: { ios: 'flame.fill', material: 'local_fire_department' },
} as const satisfies Record<string, { ios: string; material: string }>;

export type IconName = keyof typeof icons;
export type IconSpec = { ios: string; material: string };

type Props = {
  name: IconName | IconSpec;
  size?: number;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  accessibilityLabel?: string;
};

export function Icon({ name, size = 20, color, weight = 'semibold', accessibilityLabel }: Props) {
  const theme = useTheme();
  const spec: IconSpec = typeof name === 'string' ? icons[name] : name;
  return (
    <SymbolView
      name={{ ios: spec.ios, android: spec.material, web: spec.material } as SymbolViewProps['name']}
      size={size}
      weight={weight}
      tintColor={color ?? theme.colors.text}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    />
  );
}
