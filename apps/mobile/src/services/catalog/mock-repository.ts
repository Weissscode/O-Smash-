import { AppError } from '@/lib/errors';
import type { DiscoveryCategory, RestaurantMenu } from '@/types/domain';

import { demoMenus } from './fixtures/demo-restaurants';
import { discoveryCategories } from './fixtures/discovery';
import { osmashMenu } from './fixtures/osmash';
import type { CatalogRepository } from './repository';
import { searchMenus } from './search';

type Options = {
  menus?: RestaurantMenu[];
  categories?: DiscoveryCategory[];
  /** Latence simulée (ms) pour voir les skeletons en développement. */
  latencyMs?: number;
};

const wait = (ms: number) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

/** Implémentation en mémoire du catalogue (phase 1 et tests). */
export function createMockCatalogRepository(options: Options = {}): CatalogRepository {
  const menus = options.menus ?? [osmashMenu, ...demoMenus];
  const categories = options.categories ?? discoveryCategories;
  const latency = options.latencyMs ?? 0;

  return {
    async listDiscoveryCategories() {
      await wait(latency / 2);
      return categories;
    },
    async listRestaurants() {
      await wait(latency);
      return menus.map((m) => m.restaurant);
    },
    async getRestaurantMenu(slug) {
      await wait(latency);
      const menu = menus.find((m) => m.restaurant.slug === slug);
      if (!menu) throw new AppError('not_found', "Ce restaurant n'existe pas ou n'est plus disponible sur Vice Go.");
      return menu;
    },
    async getProduct(productId) {
      await wait(latency / 2);
      for (const m of menus) {
        const product = m.products.find((p) => p.id === productId);
        if (product) return { product, restaurant: m.restaurant };
      }
      throw new AppError('not_found', "Ce produit n'est plus disponible.");
    },
    async search(text) {
      await wait(latency / 3);
      return searchMenus(text, menus, categories);
    },
  };
}
