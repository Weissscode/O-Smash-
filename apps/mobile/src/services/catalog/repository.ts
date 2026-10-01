import type { DiscoveryCategory, ID, LatLng, Product, Restaurant, RestaurantMenu } from '@/types/domain';

/**
 * Contrat d'accès au catalogue. Les écrans et hooks ne dépendent QUE de
 * cette interface : passer des données de démonstration à Supabase (phase 2)
 * revient à fournir une autre implémentation, sans toucher à l'UI.
 */
export type RestaurantQuery = {
  near?: LatLng | null;
};

export type SearchResults = {
  restaurants: Restaurant[];
  products: { product: Product; restaurant: Restaurant }[];
  categories: DiscoveryCategory[];
};

export interface CatalogRepository {
  listDiscoveryCategories(): Promise<DiscoveryCategory[]>;
  listRestaurants(query: RestaurantQuery): Promise<Restaurant[]>;
  getRestaurantMenu(slug: string): Promise<RestaurantMenu>;
  getProduct(productId: ID): Promise<{ product: Product; restaurant: Restaurant }>;
  search(text: string): Promise<SearchResults>;
}
