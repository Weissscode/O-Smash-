import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Adaptateur de stockage pour la session Supabase.
 *
 * iOS/Android : Keychain / Keystore via expo-secure-store. Une session
 * Supabase dépasse souvent la taille conseillée d'une entrée (~2 Ko), on la
 * découpe donc en morceaux. Web (prévisualisation uniquement) : localStorage.
 */
const CHUNK_SIZE = 1800;
const chunkCountKey = (key: string) => `${key}.chunks`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;
// SecureStore n'accepte que [A-Za-z0-9._-]
const safe = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

async function removeChunks(key: string) {
  const count = Number((await SecureStore.getItemAsync(chunkCountKey(key), options)) ?? 0);
  for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(chunkKey(key, i), options);
  await SecureStore.deleteItemAsync(chunkCountKey(key), options);
}

export const secureSessionStorage = {
  async getItem(rawKey: string): Promise<string | null> {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(rawKey) ?? null;
    const key = safe(rawKey);
    const count = Number((await SecureStore.getItemAsync(chunkCountKey(key), options)) ?? 0);
    if (!count) return null;
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(chunkKey(key, i), options);
      if (part == null) return null; // session corrompue : on force une reconnexion
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(rawKey: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return globalThis.localStorage?.setItem(rawKey, value);
    const key = safe(rawKey);
    await removeChunks(key);
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), options);
    }
    await SecureStore.setItemAsync(chunkCountKey(key), String(count), options);
  },
  async removeItem(rawKey: string): Promise<void> {
    if (Platform.OS === 'web') return globalThis.localStorage?.removeItem(rawKey);
    await removeChunks(safe(rawKey));
  },
};
