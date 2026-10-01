import { AppError, toAppError, userMessage } from '@/lib/errors';
import { parseEnv } from '@/validation/env';

describe('validation des variables d’environnement', () => {
  it('par défaut : données de démonstration en développement', () => {
    expect(parseEnv({}, 'development')).toMatchObject({ dataSource: 'mock', appVariant: 'development' });
  });

  it('ignore les valeurs d’exemple non remplies', () => {
    const env = parseEnv({ EXPO_PUBLIC_SUPABASE_URL: 'https://xxxxxxxxxxxx.supabase.co' }, 'development');
    expect(env.supabaseUrl).toBeUndefined();
  });

  it('exige URL et clé publique quand la source est Supabase', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'supabase' }, 'preview')).toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
    expect(
      parseEnv(
        { EXPO_PUBLIC_DATA_SOURCE: 'supabase', EXPO_PUBLIC_SUPABASE_URL: 'https://abcd.supabase.co', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_abcdefghijklmnopqrstuvwxyz' },
        'preview',
      ).dataSource,
    ).toBe('supabase');
  });

  it('interdit les données de démonstration en production', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_DATA_SOURCE: 'mock' }, 'production')).toThrow(/interdites en production/);
  });
});

describe('erreurs applicatives', () => {
  it('reconnaît une erreur réseau', () => {
    expect(toAppError(new TypeError('Network request failed')).kind).toBe('network');
    expect(userMessage(new Error('Failed to fetch')).title).toBe('Pas de connexion');
  });
  it('conserve une AppError telle quelle', () => {
    const e = new AppError('not_found', 'Produit introuvable');
    expect(toAppError(e)).toBe(e);
    expect(userMessage(e)).toEqual({ title: 'Introuvable', description: 'Produit introuvable' });
  });
});
