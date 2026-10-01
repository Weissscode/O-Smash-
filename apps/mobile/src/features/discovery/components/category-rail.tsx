import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme/theme';
import type { DiscoveryCategory, ID } from '@/types/domain';

type Props = {
  categories: DiscoveryCategory[] | undefined;
  selectedId: ID | null;
  onSelect: (id: ID | null) => void;
};

/** Catégories horizontales de l'accueil : grosses pastilles tactiles. */
export function CategoryRail({ categories, selectedId, onSelect }: Props) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.md }}
      accessibilityRole="tablist">
      {!categories
        ? Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={styles.item}>
              <Skeleton width={64} height={64} radius={theme.radius.xl} />
              <Skeleton width={48} height={10} />
            </View>
          ))
        : categories.map((c) => {
            const selected = c.id === selectedId;
            return (
              <PressableScale
                key={c.id}
                haptic="selection"
                onPress={() => onSelect(selected ? null : c.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={c.label}
                testID={`category-${c.id}`}
                style={styles.item}>
                <View
                  style={[
                    styles.tile,
                    {
                      borderRadius: theme.radius.xl,
                      backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                    },
                  ]}>
                  <Icon name={c.icon} size={26} color={selected ? theme.colors.onAccent : theme.colors.text} />
                </View>
                <Text variant="caption" tone={selected ? 'default' : 'muted'} style={selected && { fontFamily: theme.fonts.bold }}>
                  {c.label}
                </Text>
              </PressableScale>
            );
          })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', gap: 6, width: 68 },
  tile: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
});
