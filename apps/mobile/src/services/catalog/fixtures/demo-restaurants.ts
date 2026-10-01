import { eurosToCents } from '@/lib/money';
import type { Product, Restaurant, RestaurantMenu, RestaurantSettings, WeeklyHours } from '@/types/domain';

/**
 * Restaurants FICTIFS, uniquement pour éprouver l'interface multi-restaurants
 * en phase 1 (tri, distance, fermé, pause, sans fidélité, sans photo...).
 * Marqués isDemo : interdits en production (voir validation/env.ts).
 */

const everyDay = (open: `${number}:${number}`, close: `${number}:${number}`): WeeklyHours => ({
  0: [{ open, close }],
  1: [{ open, close }],
  2: [{ open, close }],
  3: [{ open, close }],
  4: [{ open, close }],
  5: [{ open, close }],
  6: [{ open, close }],
});

const baseSettings: RestaurantSettings = {
  fulfillmentModes: ['takeaway'],
  paymentMethods: ['counter'],
  autoAccept: true,
  scheduledOrders: { enabled: false, slotMinutes: 15, maxDaysAhead: 0 },
  eta: { basePrepMinutes: 12, loadAdjustMinutes: 0, parallelCapacity: 2, minutesPerQueuedBatch: 5, minutesPerExtraItem: 1 },
};

const demo = (r: Omit<Restaurant, 'timezone' | 'isDemo' | 'logo' | 'cover'>): Restaurant => ({
  ...r,
  timezone: 'Europe/Paris',
  logo: null,
  cover: null,
  isDemo: true,
});

const simpleProduct = (restaurantId: string, id: string, categoryId: string, name: string, euros: number, description: string): Product => ({
  id,
  restaurantId,
  categoryId,
  externalRef: null,
  name,
  description,
  image: null,
  basePrice: eurosToCents(euros),
  isAvailable: true,
  labels: [],
  allergens: [],
  allergensKnown: false,
  extraPrepMinutes: 0,
  isCombo: false,
  allowsNote: true,
  modifierGroups: [],
});

export const demoTacos = demo({
  id: 'rest_demo_tacos',
  slug: 'demo-tacos-house',
  name: 'Tacos House (démo)',
  tagline: 'Tacos gratinés et sauces maison',
  discoveryCategoryIds: ['tacos', 'chicken'],
  cuisineLabel: 'Tacos',
  brandColor: '#F2A93B',
  address: { line1: 'Rue de démonstration', postalCode: '54400', city: 'Longwy' },
  location: { latitude: 49.5312, longitude: 5.7671 },
  openingHours: everyDay('11:00', '23:30'),
  isPaused: false,
  settings: { ...baseSettings, paymentMethods: ['counter', 'card'] },
  loyaltyEnabled: false,
  popularity: 74,
  activeOrders: 9,
});

export const demoWok = demo({
  id: 'rest_demo_wok',
  slug: 'demo-wok-street',
  name: 'Wok Street (démo)',
  tagline: 'Nouilles sautées minute',
  discoveryCategoryIds: ['asian'],
  cuisineLabel: 'Asiatique',
  brandColor: '#E5484D',
  address: { line1: 'Avenue de démonstration', postalCode: '54350', city: 'Mont-Saint-Martin' },
  location: { latitude: 49.5409, longitude: 5.7795 },
  openingHours: everyDay('18:00', '22:00'),
  isPaused: false,
  settings: { ...baseSettings, fulfillmentModes: ['dine_in', 'takeaway'] },
  loyaltyEnabled: true,
  popularity: 61,
  activeOrders: 1,
});

export const demoPizza = demo({
  id: 'rest_demo_pizza',
  slug: 'demo-pizza-forno',
  name: 'Forno 54 (démo)',
  tagline: 'Pizzas napolitaines au feu de bois',
  discoveryCategoryIds: ['pizza', 'dessert'],
  cuisineLabel: 'Pizza',
  brandColor: '#2F9E6B',
  address: { line1: 'Place de démonstration', postalCode: '54190', city: 'Villerupt' },
  location: { latitude: 49.4686, longitude: 5.9289 },
  openingHours: everyDay('11:30', '22:30'),
  isPaused: true,
  settings: baseSettings,
  loyaltyEnabled: false,
  popularity: 83,
  activeOrders: 0,
});

const menu = (restaurant: Restaurant, categories: [string, string][], products: Product[]): RestaurantMenu => ({
  restaurant,
  categories: categories.map(([id, name], i) => ({ id, restaurantId: restaurant.id, name, position: i + 1 })),
  products,
});

export const demoMenus: RestaurantMenu[] = [
  menu(demoTacos, [['t_tacos', 'Tacos'], ['t_sides', 'À côté']], [
    simpleProduct(demoTacos.id, 'p_t_m', 't_tacos', 'Tacos M', 7.5, '1 viande, frites, sauce fromagère'),
    simpleProduct(demoTacos.id, 'p_t_l', 't_tacos', 'Tacos L', 9.5, '2 viandes, frites, sauce fromagère'),
    simpleProduct(demoTacos.id, 'p_t_frites', 't_sides', 'Frites', 3, ''),
  ]),
  menu(demoWok, [['w_woks', 'Woks']], [
    simpleProduct(demoWok.id, 'p_w_poulet', 'w_woks', 'Wok poulet', 11, 'Nouilles, poulet, légumes croquants'),
    simpleProduct(demoWok.id, 'p_w_veg', 'w_woks', 'Wok légumes', 10, 'Nouilles, légumes de saison'),
  ]),
  menu(demoPizza, [['pz_pizzas', 'Pizzas']], [
    simpleProduct(demoPizza.id, 'p_pz_marg', 'pz_pizzas', 'Margherita', 9, 'Tomate, mozzarella, basilic'),
  ]),
];
