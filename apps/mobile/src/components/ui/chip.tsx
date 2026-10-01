import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme';

import { Icon, type IconName, type IconSpec } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName | IconSpec;
  trailingIcon?: IconName;
  testID?: string;
};

export function Chip({ label, selected, onPress, icon, trailingIcon, testID }: Props) {
  const { colors, radius, space, touch, fonts } = useTheme();
  const fg = selected ? colors.onPrimary : colors.text;
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radius.pill,
          paddingHorizontal: space.lg,
          minHeight: touch.min - 6,
          gap: space.xs + 2,
        },
      ]}>
      {icon && <Icon name={icon} size={15} color={fg} />}
      <Text variant="callout" color={fg} style={{ fontFamily: selected ? fonts.semibold : fonts.medium }}>
        {label}
      </Text>
      {trailingIcon && (
        <View>
          <Icon name={trailingIcon} size={12} color={fg} />
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
});
