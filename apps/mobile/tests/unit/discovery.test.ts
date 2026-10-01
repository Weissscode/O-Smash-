import { buildRestaurantList } from '@/features/discovery/restaurant-view';
import { demoMenus } from '@/services/catalog/fixtures/demo-restaurants';
import { discoveryCategories } from '@/services/catalog/fixtures/discovery';
import { osmash, osmashMenu } from '@/services/catalog/fixtures/osmash';
import { searchMenus } from '@/services/catalog/search';

const restaurants = [osmashMenu, ...demoMenus].map((m) => m.restaurant);
const longwy = { latitude: 49.5205, longitude: 5.76 };
const thursdayEvening = new Date('2026-10-01T19:40:00+02:00');
const base = { origin: longwy, radiusKm: 20, sort: 'distance' as const, categoryId: null, now: thursdayEvening };

describe('liste des restaurants (accueil)', () => {
  it('trie par proximité par défaut, les restaurants fermés ou en pause en dernier', () => {
    const list = buildRestaurantList(restaurants, base);
    expect(list.map((v) => v.restaurant.slug)).toEqual(['osmash', 'demo-tacos-house', 'demo-wok-street', 'demo-pizza-forno']);
    expect(list.at(-1)?.status.state).toBe('paused');
  });

  it('filtre par rayon', () => {
    const list = buildRestaurantList(restaurants, { ...base, radiusKm: 2 });
    expect(list.map((v) => v.restaurant.slug)).toEqual(['osmash', 'demo-tacos-house']);
  });

  it('filtre par catégorie de découverte', () => {
    const list = buildRestaurantList(restaurants, { ...base, categoryId: 'asian' });
    expect(list.map((v) => v.restaurant.slug).sort()).toEqual(['demo-wok-street', 'osmash']);
  });

  it("trie par temps d'attente", () => {
    const list = buildRestaurantList(restaurants, { ...base, sort: 'eta' });
    const open = list.filter((v) => v.canOrderNow).map((v) => v.eta.minutes);
    expect(open).toEqual([...open].sort((a, b) => a - b));
  });

  it('sans position : pas de distance, aucun filtre de rayon', () => {
    const list = buildRestaurantList(restaurants, { ...base, origin: null, radiusKm: 1 });
    expect(list).toHaveLength(4);
    expect(list.every((v) => v.distanceKm === null)).toBe(true);
  });

  it('un restaurant fermé ne peut pas commander maintenant', () => {
    const morning = new Date('2026-10-01T09:00:00+02:00');
    const view = buildRestaurantList([osmash], { ...base, now: morning })[0];
    expect(view.canOrderNow).toBe(false);
    expect(view.status.state).toBe('closed');
  });
});

describe('recherche', () => {
  const menus = [osmashMenu, ...demoMenus];

  it('insensible aux accents et à la casse', () => {
    const r = searchMenus('etudiant', menus, discoveryCategories);
    expect(r.products.map((p) => p.product.id)).toContain('p_f_etud');
  });

  it('tous les mots doivent correspondre', () => {
    const r = searchMenus('smash bacon', menus, discoveryCategories);
    expect(r.products.length).toBeGreaterThan(0);
    expect(r.products.every((p) => /bacon/i.test(p.product.description + p.product.name))).toBe(true);
  });

  it('une catégorie remonte les restaurants associés', () => {
    const r = searchMenus('burgers', menus, discoveryCategories);
    expect(r.categories.map((c) => c.id)).toEqual(['burger']);
    expect(r.restaurants.map((x) => x.slug)).toContain('osmash');
  });

  it('requête vide : aucun résultat', () => {
    expect(searchMenus('   ', menus, discoveryCategories)).toEqual({ restaurants: [], products: [], categories: [] });
  });
});
