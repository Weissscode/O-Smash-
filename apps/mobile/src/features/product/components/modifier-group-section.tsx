import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { formatPriceDelta } from '@/lib/money';
import { useTheme } from '@/theme/theme';
import type { ModifierGroup } from '@/types/domain';

import { describeGroupRule } from '../selection';

type Props = {
  group: ModifierGroup;
  selected: string[];
  onToggle: (optionId: string) => void;
  error?: string;
  /** Incrémenté à chaque tentative de validation pour rejouer l'animation d'erreur. */
  shakeKey?: number;
};

export function ModifierGroupSection({ group, selected, onToggle, error, shakeKey = 0 }: Props) {
  const theme = useTheme();
  const single = group.maxSelect === 1;
  const required = group.minSelect > 0;
  const satisfied = selected.length >= group.minSelect;
  const shake = useSharedValue(0);

  useEffect(() => {
    if (error && shakeKey > 0) {
      shake.set(withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 50 }), withTiming(-4, { duration: 50 }), withTiming(0, { duration: 50 })));
    }
  }, [error, shakeKey, shake]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <View style={{ paddingTop: theme.space.xxl }} accessibilityRole={single ? 'radiogroup' : undefined}>
      <Animated.View style={[styles.header, shakeStyle]}>
        <View style={styles.flex}>
          <Text variant="headline">{group.name}</Text>
          <Text variant="caption" tone={error ? 'danger' : 'muted'}>
            {error ?? describeGroupRule(group)}
          </Text>
        </View>
        {required && <Badge label={satisfied ? 'OK' : 'Obligatoire'} tone={satisfied ? 'success' : error ? 'danger' : 'accent'} icon={satisfied ? 'check' : undefined} />}
      </Animated.View>
      <View style={{ marginTop: theme.space.sm }}>
        {group.options.map((option) => {
          const isOn = selected.includes(option.id);
          const blocked = !isOn && !single && selected.length >= group.maxSelect;
          const disabled = !option.isAvailable || blocked;
          return (
            <PressableScale
              key={option.id}
              haptic="selection"
              scaleTo={0.99}
              disabled={disabled}
              onPress={() => onToggle(option.id)}
              accessibilityRole={single ? 'radio' : 'checkbox'}
              accessibilityState={{ checked: isOn, disabled }}
              accessibilityLabel={`${option.name}${option.priceDelta ? `, ${formatPriceDelta(option.priceDelta)}` : ''}${!option.isAvailable ? ', épuisé' : ''}`}
              testID={`option-${option.id}`}
              style={[styles.option, { minHeight: theme.touch.min + 8, borderBottomColor: theme.colors.border, opacity: disabled ? 0.4 : 1, gap: theme.space.md }]}>
              <View
                style={[
                  single ? styles.radio : styles.checkbox,
                  { borderColor: isOn ? theme.colors.primary : theme.colors.textSubtle, backgroundColor: isOn ? theme.colors.primary : 'transparent' },
                ]}>
                {isOn && (single ? <View style={[styles.radioDot, { backgroundColor: theme.colors.onPrimary }]} /> : <Icon name="check" size={12} color={theme.colors.onPrimary} weight="bold" />)}
              </View>
              <Text variant="body" style={styles.flex}>
                {option.name}
              </Text>
              {!option.isAvailable ? (
                <Text variant="caption" tone="muted">
                  Épuisé
                </Text>
              ) : option.priceDelta ? (
                <Text variant="callout" tone="muted">
                  {formatPriceDelta(option.priceDelta)}
                </Text>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  option: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
