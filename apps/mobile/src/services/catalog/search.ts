import { normalizeSearch } from '@/lib/text';
import type { DiscoveryCategory, RestaurantMenu } from '@/types/domain';

import type { SearchResults } from './repository';

/**
 * Recherche locale sur restaurants / produits / catégories.
 * Sert pour les données de démo ET comme spécification du comportement que
 * la recherche serveur (phase 2, full-text Postgres) devra respecter :
 * insensible aux accents et à la casse, chaque mot doit correspondre.
 */
export function searchMenus(text: string, menus: RestaurantMenu[], categories: DiscoveryCategory[]): SearchResults {
  const tokens = normalizeSearch(text).split(' ').filter(Boolean);
  if (tokens.length === 0) return { restaurants: [], products: [], categories: [] };
  const matches = (haystack: string) => {
    const h = normalizeSearch(haystack);
    return tokens.every((t) => h.includes(t));
  };

  const matchedCategories = categories.filter((c) => matches(c.label));
  const categoryIds = new Set(matchedCategories.map((c) => c.id));

  const restaurants = menus
    .map((m) => m.restaurant)
    .filter((r) => matches(`${r.name} ${r.cuisineLabel} ${r.tagline} ${r.address.city}`) || r.discoveryCategoryIds.some((id) => categoryIds.has(id)));

  const products = menus.flatMap((m) =>
    m.products.filter((p) => matches(`${p.name} ${p.description}`)).map((product) => ({ product, restaurant: m.restaurant })),
  );

  return { restaurants, products: products.slice(0, 30), categories: matchedCategories };
}
