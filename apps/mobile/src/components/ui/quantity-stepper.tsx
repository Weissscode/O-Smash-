import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Sous le minimum, le bouton "−" devient une corbeille (suppression). */
  allowRemove?: boolean;
};

export function QuantityStepper({ value, onChange, min = 1, max = 20, size = 'md', allowRemove }: Props) {
  const { colors, radius, touch } = useTheme();
  const dim = size === 'md' ? touch.min : 36;
  const canDecrease = value > min || (allowRemove && value === min);
  const showTrash = allowRemove && value === min;
  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceMuted, borderRadius: radius.pill }]}>
      <PressableScale
        haptic="selection"
        disabled={!canDecrease}
        onPress={() => onChange(value - 1)}
        accessibilityLabel={showTrash ? 'Supprimer' : 'Diminuer la quantité'}
        style={[styles.btn, { width: dim, height: dim, opacity: canDecrease ? 1 : 0.35 }]}>
        <Icon name={showTrash ? 'trash' : 'minus'} size={size === 'md' ? 16 : 14} />
      </PressableScale>
      <Text variant="headline" style={styles.value} accessibilityLabel={`Quantité ${value}`}>
        {value}
      </Text>
      <PressableScale
        haptic="selection"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        accessibilityLabel="Augmenter la quantité"
        style={[styles.btn, { width: dim, height: dim, opacity: value >= max ? 0.35 : 1 }]}>
        <Icon name="plus" size={size === 'md' ? 16 : 14} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
