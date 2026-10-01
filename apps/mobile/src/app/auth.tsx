import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Checker } from '@/components/ui/checker';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { selectItemCount, useCartStore } from '@/store/cart-store';
import { useTheme } from '@/theme/theme';

/**
 * Connexion — PROTOTYPE de la phase 1 (interface uniquement).
 * Les fournisseurs (Apple, Google, e-mail via Supabase Auth) sont branchés
 * en phase 4 ; les boutons sont donc volontairement inactifs.
 * Le panier est stocké localement : il n'est jamais perdu pendant la connexion.
 */
export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const count = useCartStore(selectItemCount);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingBottom: insets.bottom + theme.space.lg }]}>
      <Checker cell={8} height={16} opacity={0.9} />
      <View style={[styles.header, { padding: theme.layout.gutter }]}>
        <PressableScale onPress={() => router.back()} haptic="selection" accessibilityLabel="Fermer" hitSlop={8} style={[styles.close, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Icon name="close" size={16} />
        </PressableScale>
      </View>
      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.md }}>
        <Text variant="display">Connecte-toi pour valider</Text>
        <Text variant="body" tone="muted">
          On a besoin d&apos;un compte pour suivre ta commande et te prévenir quand elle est prête.
          {count > 0 ? ` Ton panier (${count} article${count > 1 ? 's' : ''}) est gardé.` : ''}
        </Text>
      </View>

      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.space.sm, marginTop: 'auto' }}>
        <View style={[styles.notice, { backgroundColor: theme.colors.warningSoft, borderRadius: theme.radius.md, padding: theme.space.md, gap: theme.space.sm }]}>
          <Icon name="warning" size={16} color={theme.colors.warning} />
          <Text variant="caption" style={styles.flex}>
            Prototype : la connexion sera activée en phase 4, après validation de l&apos;environnement Supabase staging.
          </Text>
        </View>
        {Platform.OS === 'ios' && <Button label="Continuer avec Apple" variant="primary" disabled />}
        <Button label="Continuer avec Google" variant="secondary" disabled />
        <Button label="Continuer avec un e-mail" variant="secondary" disabled />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'flex-end' },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notice: { flexDirection: 'row', alignItems: 'center' },
});
