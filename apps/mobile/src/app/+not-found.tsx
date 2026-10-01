import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { StateView } from '@/components/ui/state-view';
import { useTheme } from '@/theme/theme';

export default function NotFound() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center' }}>
      <StateView icon="search" title="Page introuvable" description="Ce lien n'existe pas ou plus." actionLabel="Retour à l'accueil" onAction={() => router.replace('/')} />
    </View>
  );
}
