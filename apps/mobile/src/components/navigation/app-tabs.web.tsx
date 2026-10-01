import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TAB_BAR_HEIGHT } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/theme/theme';

/**
 * Équivalent web (prévisualisation navigateur uniquement) de la barre native.
 * Même structure d'onglets que app-tabs.tsx.
 */
const TABS: { name: string; href: '/' | '/search' | '/orders' | '/profile'; label: string; icon: IconName }[] = [
  { name: 'index', href: '/', label: 'Accueil', icon: 'home' },
  { name: 'search', href: '/search', label: 'Recherche', icon: 'search' },
  { name: 'orders', href: '/orders', label: 'Commandes', icon: 'orders' },
  { name: 'profile', href: '/profile', label: 'Profil', icon: 'profile' },
];

type TabButtonProps = TabTriggerSlotProps & { label: string; icon: IconName };

const TabButton = forwardRef<View, TabButtonProps>(function TabButton({ isFocused, label, icon, ...props }, ref) {
  const theme = useTheme();
  const color = isFocused ? theme.colors.accent : theme.colors.textMuted;
  return (
    <Pressable ref={ref} {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} style={styles.tab}>
      <Icon name={icon} size={22} color={color} />
      <Text variant="caption" color={isFocused ? theme.colors.text : theme.colors.textMuted}>
        {label}
      </Text>
    </Pressable>
  );
});

export default function AppTabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={[
          styles.bar,
          { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom, backgroundColor: theme.colors.bgElevated, borderTopColor: theme.colors.border },
        ]}>
        {TABS.map((t) => (
          <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
            <TabButton label={t.label} icon={t.icon} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
