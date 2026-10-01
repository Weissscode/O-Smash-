import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { catalog } from '@/services/catalog';
import { queryKeys } from '@/services/query-client';

export function useDiscoveryCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: () => catalog.listDiscoveryCategories(), staleTime: Infinity });
}

export function useRestaurants() {
  return useQuery({ queryKey: queryKeys.restaurants, queryFn: () => catalog.listRestaurants({}) });
}

export function useRestaurantMenu(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.menu(slug ?? ''),
    queryFn: () => catalog.getRestaurantMenu(slug as string),
    enabled: !!slug,
  });
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(productId ?? ''),
    queryFn: () => catalog.getProduct(productId as string),
    enabled: !!productId,
  });
}

export function useCatalogSearch(text: string) {
  const trimmed = text.trim();
  return useQuery({
    queryKey: queryKeys.search(trimmed),
    queryFn: () => catalog.search(trimmed),
    enabled: trimmed.length >= 2,
    placeholderData: keepPreviousData,
  });
}
