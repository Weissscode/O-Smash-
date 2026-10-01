import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checker } from '@/components/ui/checker';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { confirmDialog } from '@/lib/dialog';
import { useLocationStore } from '@/store/location-store';
import { useTheme } from '@/theme/theme';
import { env } from '@/validation/env';

type RowItem = { icon: IconName; label: string; phase?: string; onPress?: () => void; destructive?: boolean };

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useTabBarInset();
  const location = useLocationStore((s) => s.location);
  const resetLocation = useLocationStore((s) => s.reset);

  const account: RowItem[] = [
    { icon: 'profile', label: 'Informations personnelles', phase: 'Phase 4' },
    { icon: 'card', label: 'Méthodes de connexion', phase: 'Phase 4' },
    { icon: 'bell', label: 'Notifications', phase: 'Phase 7' },
    { icon: 'gift', label: 'Fidélité par restaurant', phase: 'Phase 8' },
    { icon: 'heart', label: 'Favoris', phase: 'Phase 3' },
  ];
  const app: RowItem[] = [
    { icon: 'pin', label: location ? `Position : ${location.label}` : 'Choisir ma position', onPress: () => router.push('/location') },
    { icon: 'help', label: 'Aide', phase: 'Bientôt' },
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingTop: insets.top + theme.space.md, paddingBottom: bottomInset + theme.space.xl }}>
      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.lg }}>
        <Text variant="display">Profil</Text>
        <View style={[styles.hero, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xl }]}>
          <View style={{ padding: theme.space.xl, gap: theme.space.sm }}>
            <Text variant="title" tone="onPrimary">
              Pas encore connecté
            </Text>
            <Text variant="callout" color={theme.colors.onPrimary} style={styles.muted}>
              Tu peux tout explorer sans compte. On te demandera de te connecter uniquement pour valider une commande.
            </Text>
            <Button label="Se connecter" variant="accent" size="md" style={{ alignSelf: 'flex-start', marginTop: theme.space.sm }} onPress={() => router.push('/auth')} />
          </View>
          <Checker cell={6} height={12} colorA={theme.colors.accent} colorB={theme.colors.primary} />
        </View>
      </View>

      <Group title="Compte" items={account} />
      <Group title="Application" items={app} />

      {env.appVariant !== 'production' && (
        <Group
          title="Développement"
          items={[
            {
              icon: 'sparkles',
              label: "Revoir l'onboarding",
              onPress: () =>
                confirmDialog({
                  title: "Revoir l'onboarding ?",
                  message: 'La position enregistrée sera effacée.',
                  confirmLabel: 'Continuer',
                  onConfirm: () => {
                    resetLocation();
                    router.replace('/onboarding');
                  },
                }),
            },
          ]}
        />
      )}

      <Text variant="caption" tone="subtle" align="center" style={{ marginTop: theme.space.xxl }}>
        Vice Go {Constants.expoConfig?.version} · {env.appVariant} · données : {env.dataSource === 'mock' ? 'démo' : 'Supabase'}
      </Text>
    </ScrollView>
  );
}

function Group({ title, items }: { title: string; items: RowItem[] }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.space.xxl, paddingHorizontal: theme.layout.gutter, gap: theme.space.sm }}>
      <Text variant="overline" tone="muted">
        {title}
      </Text>
      <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderColor: theme.colors.border, borderWidth: StyleSheet.hairlineWidth }}>
        {items.map((item, i) => (
          <PressableScale
            key={item.label}
            haptic="selection"
            scaleTo={0.99}
            disabled={!item.onPress}
            onPress={item.onPress}
            accessibilityLabel={item.phase ? `${item.label}, disponible ${item.phase}` : item.label}
            style={[styles.row, { minHeight: 54, paddingHorizontal: theme.space.lg, gap: theme.space.md, borderTopWidth: i ? StyleSheet.hairlineWidth : 0, borderTopColor: theme.colors.border }]}>
            <Icon name={item.icon} size={18} color={item.destructive ? theme.colors.danger : theme.colors.text} />
            <Text variant="body" tone={item.onPress ? 'default' : 'muted'} style={styles.flex} numberOfLines={1}>
              {item.label}
            </Text>
            {item.phase ? <Badge label={item.phase} /> : <Icon name="chevronRight" size={12} color={theme.colors.textSubtle} />}
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  hero: { overflow: 'hidden' },
  muted: { opacity: 0.75 },
});
