import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuration Expo de Vice Go.
 *
 * APP_VARIANT (défini dans eas.json) sépare les trois installations possibles
 * sur un même iPhone : development, preview (staging) et production.
 * Seules des valeurs PUBLIQUES transitent ici : la clé Supabase "publishable"
 * (anon) est protégée par les règles RLS. Aucun secret (Stripe, service role,
 * Apple, Google) ne doit jamais apparaître dans ce fichier ni dans l'app.
 */
type Variant = 'development' | 'preview' | 'production';

const variant: Variant =
  process.env.APP_VARIANT === 'production' || process.env.APP_VARIANT === 'preview'
    ? process.env.APP_VARIANT
    : 'development';

const BASE_BUNDLE_ID = 'com.vicecode.vicego';

/**
 * Projet EAS (valeurs publiques, non secrètes) : compte `vicecode-team`,
 * projet affiché « Weiss » sur expo.dev. Le slug doit être identique à celui
 * du projet en ligne, sinon EAS refuse de builder.
 */
const EAS_PROJECT_ID = 'ddf55865-887b-456c-b05b-1081846d3ebe';
const EAS_OWNER = 'vicecode-team';
const EAS_SLUG = 'weiss';

const variantConfig: Record<Variant, { name: string; bundleId: string; scheme: string }> = {
  development: { name: 'Vice Go Dev', bundleId: `${BASE_BUNDLE_ID}.dev`, scheme: 'vicego-dev' },
  preview: { name: 'Vice Go Staging', bundleId: `${BASE_BUNDLE_ID}.preview`, scheme: 'vicego-preview' },
  production: { name: 'Vice Go', bundleId: BASE_BUNDLE_ID, scheme: 'vicego' },
};

const current = variantConfig[variant];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: current.name,
  owner: EAS_OWNER,
  slug: EAS_SLUG,
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: current.scheme,
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: current.bundleId,
    supportsTablet: false,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Vice Go utilise ta position pour te montrer les restaurants proches et leur distance. Tu peux aussi saisir une ville à la place.',
    },
  },
  android: {
    package: current.bundleId,
    adaptiveIcon: {
      backgroundColor: '#0E0D12',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Vice Go utilise ta position pour te montrer les restaurants proches et leur distance. Tu peux aussi saisir une ville à la place.',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0E0D12',
        image: './assets/images/splash-icon.png',
        imageWidth: 180,
      },
    ],
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appVariant: variant,
    eas: { projectId: EAS_PROJECT_ID },
  },
});
