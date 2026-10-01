import { estimatePrepTime, type EtaResult } from '@/lib/eta';
import { distanceKm } from '@/lib/geo';
import { getOpenStatus, type OpenStatus } from '@/lib/opening-hours';
import type { ID, LatLng, Restaurant } from '@/types/domain';

/** Données calculées d'un restaurant pour l'affichage (distance, délai, statut). */
export type RestaurantView = {
  restaurant: Restaurant;
  distanceKm: number | null;
  eta: EtaResult;
  status: OpenStatus;
  canOrderNow: boolean;
};

export type SortKey = 'distance' | 'popularity' | 'eta';

export const SORT_LABELS: Record<SortKey, string> = {
  distance: 'Proximité',
  popularity: 'Populaires',
  eta: "Temps d'attente",
};

export function toRestaurantView(restaurant: Restaurant, origin: LatLng | null, now: Date): RestaurantView {
  const status = getOpenStatus(restaurant.openingHours, restaurant.timezone, now, { isPaused: restaurant.isPaused });
  return {
    restaurant,
    distanceKm: origin ? distanceKm(origin, restaurant.location) : null,
    eta: estimatePrepTime({ settings: restaurant.settings.eta, activeOrders: restaurant.activeOrders }),
    status,
    canOrderNow: status.state === 'open',
  };
}

type BuildOptions = {
  origin: LatLng | null;
  radiusKm: number;
  sort: SortKey;
  categoryId: ID | null;
  now: Date;
};

/**
 * Liste de l'accueil : filtre par rayon et catégorie, puis tri.
 * Les restaurants ouverts passent toujours avant les fermés / en pause.
 */
export function buildRestaurantList(restaurants: Restaurant[], { origin, radiusKm, sort, categoryId, now }: BuildOptions): RestaurantView[] {
  const views = restaurants
    .filter((r) => !categoryId || r.discoveryCategoryIds.includes(categoryId))
    .map((r) => toRestaurantView(r, origin, now))
    .filter((v) => v.distanceKm === null || v.distanceKm <= radiusKm);

  const compare: Record<SortKey, (a: RestaurantView, b: RestaurantView) => number> = {
    distance: (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
    popularity: (a, b) => b.restaurant.popularity - a.restaurant.popularity,
    eta: (a, b) => a.eta.minutes - b.eta.minutes,
  };

  return views.sort((a, b) => Number(b.canOrderNow) - Number(a.canOrderNow) || compare[sort](a, b));
}
