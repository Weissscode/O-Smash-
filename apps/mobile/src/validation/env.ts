import Constants from 'expo-constants';
import { z } from 'zod';

/**
 * Variables d'environnement PUBLIQUES, validées au démarrage.
 * Les EXPO_PUBLIC_* sont injectées à la compilation : elles sont lisibles
 * par quiconque décompile l'app. On n'y met donc que des valeurs publiques.
 */
const envSchema = z
  .object({
    dataSource: z.enum(['mock', 'supabase']).default('mock'),
    supabaseUrl: z.url().optional(),
    supabaseAnonKey: z.string().min(20).optional(),
    appVariant: z.enum(['development', 'preview', 'production']).default('development'),
  })
  .superRefine((env, ctx) => {
    if (env.dataSource === 'supabase' && (!env.supabaseUrl || !env.supabaseAnonKey)) {
      ctx.addIssue({
        code: 'custom',
        message: 'EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY sont requis quand EXPO_PUBLIC_DATA_SOURCE=supabase',
      });
    }
    if (env.appVariant === 'production' && env.dataSource === 'mock') {
      ctx.addIssue({ code: 'custom', message: 'Les données de démonstration sont interdites en production' });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

const emptyToUndefined = (v: string | undefined) => (v && v.trim() !== '' && !v.includes('xxxx') ? v.trim() : undefined);

export function parseEnv(raw: Record<string, string | undefined>, appVariant: unknown): AppEnv {
  return envSchema.parse({
    dataSource: emptyToUndefined(raw.EXPO_PUBLIC_DATA_SOURCE),
    supabaseUrl: emptyToUndefined(raw.EXPO_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: emptyToUndefined(raw.EXPO_PUBLIC_SUPABASE_ANON_KEY),
    appVariant: typeof appVariant === 'string' ? appVariant : undefined,
  });
}

// Accès statique obligatoire : Expo ne remplace que `process.env.EXPO_PUBLIC_X` écrit en toutes lettres.
export const env: AppEnv = parseEnv(
  {
    EXPO_PUBLIC_DATA_SOURCE: process.env.EXPO_PUBLIC_DATA_SOURCE,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  Constants.expoConfig?.extra?.appVariant,
);
