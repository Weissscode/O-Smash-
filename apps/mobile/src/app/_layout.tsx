import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/ui/offline-banner';
import { StateView } from '@/components/ui/state-view';
import { bindQueryLifecycle, createQueryClient } from '@/services/query-client';
import { ThemeProvider, useTheme } from '@/theme/theme';
import { fontAssets } from '@/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 250, fade: true });

export const unstable_settings = { anchor: '(tabs)' };

function Navigator() {
  const theme = useTheme();
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: theme.colors.bg, card: theme.colors.bg, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.accent },
  };
  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="restaurant/[slug]" />
        <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="location"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.62, 1], sheetGrabberVisible: true, sheetCornerRadius: theme.radius.xxl }}
        />
      </Stack>
      <OfflineBanner />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [queryClient] = useState(createQueryClient);

  useEffect(() => bindQueryLifecycle(), []);
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, fontError]);

  // En cas d'échec de chargement des polices, on affiche quand même l'app (polices système).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <Navigator />
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Filet de sécurité global : une erreur de rendu n'affiche jamais un écran blanc. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorScreen retry={retry} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ErrorScreen({ retry }: { retry: () => Promise<void> }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center' }}>
      <StateView
        icon="warning"
        tone="danger"
        title="Quelque chose a planté"
        description="L'écran n'a pas pu s'afficher. Ton panier est conservé."
        actionLabel="Réessayer"
        onAction={() => void retry()}
      />
    </View>
  );
}
