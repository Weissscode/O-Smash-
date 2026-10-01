import type { DiscoveryCategory } from '@/types/domain';

/** Catégories transverses de l'accueil (communes à tous les restaurants). */
export const discoveryCategories: DiscoveryCategory[] = [
  { id: 'burger', label: 'Burgers', icon: { ios: 'flame.fill', material: 'lunch_dining' } },
  { id: 'chicken', label: 'Poulet', icon: { ios: 'bolt.fill', material: 'kebab_dining' } },
  { id: 'asian', label: 'Asiatique', icon: { ios: 'takeoutbag.and.cup.and.straw.fill', material: 'ramen_dining' } },
  { id: 'tacos', label: 'Tacos', icon: { ios: 'star.fill', material: 'local_dining' } },
  { id: 'pizza', label: 'Pizza', icon: { ios: 'circle.grid.cross.fill', material: 'local_pizza' } },
  { id: 'dessert', label: 'Desserts', icon: { ios: 'birthday.cake.fill', material: 'icecream' } },
  { id: 'drinks', label: 'Boissons', icon: { ios: 'cup.and.saucer.fill', material: 'local_cafe' } },
];
