import * as Location from 'expo-location';

import { AppError } from '@/lib/errors';
import type { SavedLocation } from '@/store/location-store';

/**
 * Accès à la position. La permission n'est demandée qu'après l'écran
 * d'explication (onboarding), jamais au lancement à froid.
 */

export type DeviceLocationResult =
  | { status: 'granted'; location: Omit<SavedLocation, 'updatedAt'> }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'unavailable'; message: string };

async function labelFor(latitude: number, longitude: number): Promise<string> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address) {
      const street = [address.streetNumber, address.street].filter(Boolean).join(' ');
      return street || address.district || address.city || 'Position actuelle';
    }
  } catch {
    // le géocodage inverse est un bonus : on garde un libellé générique
  }
  return 'Position actuelle';
}

export async function requestDeviceLocation(): Promise<DeviceLocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return { status: 'denied', canAskAgain: permission.canAskAgain };
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000, requiredAccuracy: 500 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    const { latitude, longitude } = position.coords;
    return { status: 'granted', location: { coords: { latitude, longitude }, label: await labelFor(latitude, longitude), source: 'device' } };
  } catch {
    return { status: 'unavailable', message: 'Impossible de récupérer ta position. Saisis une ville ou un code postal.' };
  }
}

/** Ville ou code postal saisi à la main -> coordonnées (géocodeur natif iOS/Android). */
export async function geocodeManualEntry(query: string): Promise<Omit<SavedLocation, 'updatedAt'>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) throw new AppError('not_found', 'Saisis une ville ou un code postal.');
  let results: Location.LocationGeocodedLocation[] = [];
  try {
    results = await Location.geocodeAsync(/^\d{5}$/.test(trimmed) ? `${trimmed}, France` : trimmed);
  } catch (error) {
    throw new AppError('network', 'Recherche de lieu impossible pour le moment. Réessaie.', { cause: error });
  }
  const first = results[0];
  if (!first) throw new AppError('not_found', `Aucun lieu trouvé pour « ${trimmed} ».`);
  return { coords: { latitude: first.latitude, longitude: first.longitude }, label: trimmed, source: 'manual' };
}
