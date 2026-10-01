import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StateView } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { CartBar } from '@/features/cart/components/cart-bar';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/theme/theme';

/**
 * Commandes en cours et historique. Le suivi temps réel arrive en phase 5,
 * l'historique et "Recommander" en phase 8 : en attendant, un état vide soigné.
 */
export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = useTabBarInset();
  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.bg, paddingTop: insets.top + theme.space.md }]}>
      <Text variant="display" style={{ paddingHorizontal: theme.layout.gutter }}>
        Commandes
      </Text>
      <StateView
        icon="orders"
        title="Aucune commande"
        description="Tes commandes en cours et ton historique apparaîtront ici, avec le suivi en temps réel."
        actionLabel="Trouver un restaurant"
        onAction={() => router.navigate('/')}
      />
      <CartBar bottomOffset={bottomInset} />
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
