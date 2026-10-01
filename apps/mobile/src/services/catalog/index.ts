import { AppError } from '@/lib/errors';
import { env } from '@/validation/env';

import { createMockCatalogRepository } from './mock-repository';
import type { CatalogRepository } from './repository';

export type { CatalogRepository, RestaurantQuery, SearchResults } from './repository';

function notReadyRepository(): CatalogRepository {
  const fail = async (): Promise<never> => {
    throw new AppError('not_configured', 'Le catalogue Supabase sera branché en phase 2 (après validation des migrations staging).');
  };
  return {
    listDiscoveryCategories: fail,
    listRestaurants: fail,
    getRestaurantMenu: fail,
    getProduct: fail,
    search: fail,
  };
}

/**
 * Point d'entrée unique du catalogue. En phase 1 : données de démonstration.
 * L'implémentation Supabase arrivera en phase 2 ; d'ici là, choisir
 * "supabase" affiche une erreur explicite plutôt que des données fausses.
 */
export const catalog: CatalogRepository =
  env.dataSource === 'mock' ? createMockCatalogRepository({ latencyMs: 450 }) : notReadyRepository();
