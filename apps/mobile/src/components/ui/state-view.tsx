import { StyleSheet, View } from 'react-native';

import { userMessage } from '@/lib/errors';
import { useTheme } from '@/theme/theme';

import { Button } from './button';
import { Checker } from './checker';
import { Icon, type IconName } from './icon';
import { Text } from './text';

type Props = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
  testID?: string;
};

/** État vide / erreur / hors ligne : toujours un titre clair et, si possible, une action. */
export function StateView({ icon, title, description, actionLabel, onAction, tone = 'neutral', testID }: Props) {
  const { colors, space, radius } = useTheme();
  return (
    <View testID={testID} style={[styles.wrap, { padding: space.xxl, gap: space.md }]}>
      <View style={[styles.iconWrap, { borderRadius: radius.xl, backgroundColor: tone === 'danger' ? colors.dangerSoft : colors.surfaceMuted }]}>
        <Icon name={icon} size={30} color={tone === 'danger' ? colors.danger : colors.text} />
        <View style={styles.checker}>
          <Checker cell={4} height={8} opacity={0.9} />
        </View>
      </View>
      <Text variant="title" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" tone="muted" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="primary" size="md" style={{ marginTop: space.sm }} /> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { title, description } = userMessage(error);
  return <StateView icon="warning" tone="danger" title={title} description={description} actionLabel={onRetry ? 'Réessayer' : undefined} onAction={onRetry} testID="error-state" />;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  iconWrap: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  checker: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  description: { maxWidth: 320 },
});
