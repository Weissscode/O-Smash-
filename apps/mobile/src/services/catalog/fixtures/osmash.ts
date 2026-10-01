import { eurosToCents } from '@/lib/money';
import type { ModifierGroup, ModifierOption, Product, Restaurant, RestaurantMenu, WeeklyHours } from '@/types/domain';

/**
 * Fixture O'SMASH — DONNÉES DE DÉMONSTRATION de la phase 1.
 *
 * Reprend les vrais PID (externalRef), noms et prix de la caisse
 * (src/data/products.js à la racine du dépôt) pour valider le modèle de
 * catalogue relationnel sur un cas réel. En phase 2, ces données seront
 * importées en base (staging) par migration et ce fichier ne servira plus
 * qu'aux tests. Horaires et coordonnées : À CONFIRMER par le restaurant.
 */

const RID = 'rest_osmash';
const img = {
  original: require('@/assets/fixtures/osmash/original.webp'),
  chicken: require('@/assets/fixtures/osmash/chicken.webp'),
  british: require('@/assets/fixtures/osmash/british.webp'),
  spicy: require('@/assets/fixtures/osmash/spicy.webp'),
  smoke: require('@/assets/fixtures/osmash/smoke.webp'),
  frenchy: require('@/assets/fixtures/osmash/frenchy.webp'),
  bao: require('@/assets/fixtures/osmash/bao.webp'),
  wrap: require('@/assets/fixtures/osmash/wrap.webp'),
  riz: require('@/assets/fixtures/osmash/riz.webp'),
  frites: require('@/assets/fixtures/osmash/frites.webp'),
  mac: require('@/assets/fixtures/osmash/mac.webp'),
  milkshake: require('@/assets/fixtures/osmash/milkshake.webp'),
  boisson: require('@/assets/fixtures/osmash/boisson.webp'),
  cover: require('@/assets/fixtures/osmash/cover.webp'),
  logo: require('@/assets/fixtures/osmash/logo.webp'),
};

const hours: WeeklyHours = {
  0: [{ open: '18:00', close: '23:00' }],
  1: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  2: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  3: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  4: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  5: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '00:30' }],
  6: [{ open: '11:30', close: '00:30' }],
};

export const osmash: Restaurant = {
  id: RID,
  slug: 'osmash',
  name: "O'SMASH",
  tagline: 'Smash burgers, bao & crousty box',
  discoveryCategoryIds: ['burger', 'chicken', 'asian', 'dessert'],
  cuisineLabel: 'Smash burger',
  logo: img.logo,
  cover: img.cover,
  brandColor: '#B9A3F0',
  address: { line1: '14 Rue Victor Hugo', postalCode: '54400', city: 'Longwy' },
  location: { latitude: 49.5197, longitude: 5.7614 },
  timezone: 'Europe/Paris',
  openingHours: hours,
  isPaused: false,
  settings: {
    fulfillmentModes: ['dine_in', 'takeaway'],
    paymentMethods: ['counter', 'card', 'apple_pay'],
    autoAccept: false,
    scheduledOrders: { enabled: true, slotMinutes: 15, maxDaysAhead: 1 },
    eta: { basePrepMinutes: 10, loadAdjustMinutes: 0, parallelCapacity: 3, minutesPerQueuedBatch: 4, minutesPerExtraItem: 1 },
  },
  loyaltyEnabled: true,
  popularity: 92,
  activeOrders: 4,
};

// ── Groupes d'options réutilisables (issus de CB dans products.js) ──────────
const opt = (id: string, name: string, euros = 0, extra: Partial<ModifierOption> = {}): ModifierOption => ({
  id,
  name,
  priceDelta: eurosToCents(euros),
  isAvailable: true,
  ...extra,
});

const burgerRemovals: ModifierGroup = {
  id: 'grp_burger_removals',
  name: 'Retirer',
  kind: 'removal',
  minSelect: 0,
  maxSelect: 7,
  options: ['salade', 'tomate', 'oignon', 'cornichon', 'sauce', 'fromage', 'bacon'].map((i) => opt(`rm_${i}`, `Sans ${i}`)),
};

const burgerSupplements: ModifierGroup = {
  id: 'grp_burger_supps',
  name: 'Suppléments',
  kind: 'supplement',
  minSelect: 0,
  maxSelect: 5,
  options: [
    opt('sup_cheddar', 'Supp. Cheddar', 1),
    opt('sup_oignon', 'Supp. Oignon Crispy', 0.5),
    opt('sup_oeuf', 'Supp. Œuf', 1),
    opt('sup_bacon', 'Supp. Bacon', 1),
    opt('sup_chicken', 'Supp. Crispy Chicken', 2),
    opt('sup_steak', 'Supp. Steak Smashé', 2.5),
    opt('sup_halloumi', 'Supp. Fonte Halloumi', 2, { isAvailable: false }),
  ],
};

const sauces = (max: number): ModifierGroup => ({
  id: `grp_sauces_${max}`,
  name: 'Sauces',
  kind: 'sauce',
  minSelect: 0,
  maxSelect: max,
  options: ['Algérienne', 'Andalouse', 'Biggy', 'Smoke', 'Ketchup', 'Mayonnaise', 'BBQ', 'Honey', 'Spicy'].map((s) =>
    opt(`sauce_${s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}`, s),
  ),
});

const versions: ModifierGroup = {
  id: 'grp_version',
  name: 'Version',
  kind: 'variant',
  minSelect: 1,
  maxSelect: 1,
  options: [opt('ver_boeuf', 'Bœuf', 0, { isDefault: true }), opt('ver_chicken', 'Chicken')],
};

const drinks: ModifierGroup = {
  id: 'grp_drink',
  name: 'Boisson',
  kind: 'combo_item',
  minSelect: 1,
  maxSelect: 1,
  options: [
    opt('cdr_coca', 'Coca-Cola 33cl', 0, { productRef: 'p_dr_coca' }),
    opt('cdr_zero', 'Coca Zero 33cl', 0, { productRef: 'p_dr_zero' }),
    opt('cdr_fanta', 'Fanta Exotique 33cl', 0),
    opt('cdr_icetea', 'Ice Tea Peach 33cl', 0),
    opt('cdr_eau', 'Eau 50cl', 0),
  ],
};

type P = Omit<Product, 'restaurantId' | 'allergens' | 'allergensKnown' | 'isAvailable' | 'extraPrepMinutes' | 'isCombo' | 'allowsNote' | 'labels'> &
  Partial<Pick<Product, 'isAvailable' | 'extraPrepMinutes' | 'isCombo' | 'allowsNote' | 'labels'>>;

const product = (p: P): Product => ({
  restaurantId: RID,
  allergens: [],
  allergensKnown: false,
  isAvailable: true,
  extraPrepMinutes: 0,
  isCombo: false,
  allowsNote: true,
  labels: [],
  ...p,
});

const burger = (id: string, ref: string, name: string, euros: number, desc: string, image: number, extra: Partial<P> = {}) =>
  product({
    id,
    categoryId: 'cat_burgers',
    externalRef: ref,
    name,
    description: desc,
    image,
    basePrice: eurosToCents(euros),
    modifierGroups: [burgerRemovals, burgerSupplements, sauces(2)],
    ...extra,
  });

const products: Product[] = [
  burger('p_b_orig', 'b-orig', "O'Smash Original", 6.5, 'Double steak, cheddar, oignon crispy, cornichon', img.original, { isPopular: true }),
  burger('p_b_chik', 'b-chik', "O'Smash Chicken", 6.5, 'Double crispy chicken, cheddar, oignon, salade, tomate', img.chicken),
  burger('p_b_veg', 'b-veg', "O'Smash Veggy", 6.5, 'Steak veggy, cheddar, oignon, salade, tomate', img.original, { labels: ['vegetarian'] }),
  burger('p_b_smoke', 'b-smoke', "O'Smash Smoke", 8.5, 'Double steak, cheddar, oignon, bacon, sauce smoke', img.smoke, { labels: ['signature'], isPopular: true }),
  burger('p_b_fren', 'b-fren', "O'Smash Frenchy", 9.9, 'Double steak, cheddar, oignon crispy, raclette', img.frenchy, { labels: ['signature'] }),
  burger('p_b_brit', 'b-brit', "O'Smash British", 9.9, 'Double steak, cheddar, oignon, salade, tomate, bacon, œuf', img.british, { labels: ['signature'] }),
  burger('p_b_spicy', 'b-spicy', "O'Smash Spicy", 9.5, 'Double steak, cheddar, oignon crispy, bacon, jalapeños', img.spicy, {
    labels: ['signature', 'spicy'],
    modifierGroups: [versions, burgerRemovals, burgerSupplements, sauces(2)],
  }),
  burger('p_b_truf', 'b-truf', "O'Smash Truffe", 10.5, 'Double steak, cheddar, raclette, bacon, parmesan', img.frenchy, {
    labels: ['signature'],
    isAvailable: false,
    modifierGroups: [versions, burgerRemovals, burgerSupplements, sauces(2)],
  }),
  product({
    id: 'p_f_etud',
    categoryId: 'cat_formules',
    externalRef: 'f-etud',
    name: 'Menu Étudiant',
    description: 'Smash simple OU Wrap OU Riz + frite + boisson',
    image: img.wrap,
    basePrice: eurosToCents(8),
    isCombo: true,
    extraPrepMinutes: 2,
    isPopular: true,
    modifierGroups: [
      {
        id: 'grp_etud_main',
        name: 'Ton plat',
        kind: 'combo_item',
        minSelect: 1,
        maxSelect: 1,
        options: [
          opt('etud_orig', "O'Smash Original", 0, { productRef: 'p_b_orig' }),
          opt('etud_chik', "O'Smash Chicken", 0, { productRef: 'p_b_chik' }),
          opt('etud_veg', "O'Smash Veggy", 0, { productRef: 'p_b_veg' }),
          opt('etud_wrap', 'Wrap Chicken', 0, { productRef: 'p_b_wrap' }),
          opt('etud_riz', 'Riz Crousty', 0, { productRef: 'p_r_riz' }),
        ],
      },
      drinks,
      sauces(1),
    ],
  }),
  product({
    id: 'p_f_duo_g',
    categoryId: 'cat_formules',
    externalRef: 'f-duo-g',
    name: 'Duo Signature',
    description: '2 smash (simple ou signature) + frites + boisson',
    image: img.smoke,
    basePrice: eurosToCents(16.9),
    isCombo: true,
    extraPrepMinutes: 4,
    modifierGroups: [
      {
        id: 'grp_duo_burgers',
        name: 'Tes 2 smash',
        kind: 'combo_item',
        minSelect: 2,
        maxSelect: 2,
        options: [
          opt('duo_orig', "O'Smash Original", 0, { productRef: 'p_b_orig' }),
          opt('duo_chik', "O'Smash Chicken", 0, { productRef: 'p_b_chik' }),
          opt('duo_smoke', "O'Smash Smoke", 0, { productRef: 'p_b_smoke' }),
          opt('duo_fren', "O'Smash Frenchy", 0, { productRef: 'p_b_fren' }),
          opt('duo_brit', "O'Smash British", 0, { productRef: 'p_b_brit' }),
        ],
      },
      drinks,
    ],
  }),
  product({
    id: 'p_bao_orig',
    categoryId: 'cat_bao',
    externalRef: 'bao-orig',
    name: 'BAO Original',
    description: 'Bao, double steak smashé, cheddar, oignon crispy, cornichon, sauce moutarde ketchup ou biggy',
    image: img.bao,
    basePrice: eurosToCents(8.5),
    modifierGroups: [burgerRemovals, burgerSupplements],
  }),
  product({
    id: 'p_b_wrap',
    categoryId: 'cat_bao',
    externalRef: 'b-wrap',
    name: 'Wrap Chicken',
    description: 'Tortillas, crispy chicken, cheddar, salade, tomate',
    image: img.wrap,
    basePrice: eurosToCents(6.5),
    modifierGroups: [burgerRemovals, sauces(2)],
  }),
  product({
    id: 'p_r_riz',
    categoryId: 'cat_riz',
    externalRef: 'r-riz',
    name: 'Riz Crousty',
    description: 'Riz, sauce thaï, oignon crispy, persil, crispy chicken',
    image: img.riz,
    basePrice: eurosToCents(9),
    extraPrepMinutes: 2,
    isPopular: true,
    modifierGroups: [
      { id: 'grp_riz_type', name: 'Sauce', kind: 'choice', minSelect: 1, maxSelect: 1, options: [opt('riz_sucre', 'Sucrée'), opt('riz_spicy', 'Piquante')] },
      {
        id: 'grp_riz_removals',
        name: 'Retirer',
        kind: 'removal',
        minSelect: 0,
        maxSelect: 4,
        options: [opt('rr_chili', 'Sans sauce chili thaï'), opt('rr_oignon', 'Sans oignons crispy'), opt('rr_persil', 'Sans persil'), opt('rr_blanche', 'Sans sauce blanche')],
      },
    ],
  }),
  product({
    id: 'p_si_frit',
    categoryId: 'cat_sides',
    externalRef: 'si-frit',
    name: 'Frites Twister',
    description: 'Sauce au choix',
    image: img.frites,
    basePrice: eurosToCents(3),
    modifierGroups: [
      { ...sauces(1), id: 'grp_frites_sauce', minSelect: 1 },
      {
        id: 'grp_frites_supps',
        name: 'Suppléments',
        kind: 'supplement',
        minSelect: 0,
        maxSelect: 3,
        options: [opt('fs_bacon', 'Bacon', 1), opt('fs_oignon', 'Oignons frits', 0.5), opt('fs_cheddar', 'Cheddar', 1)],
      },
    ],
  }),
  product({
    id: 'p_si_mnch',
    categoryId: 'cat_sides',
    externalRef: 'si-mnch',
    name: 'Mac n Cheese',
    description: 'Mac n cheese maison',
    image: img.mac,
    basePrice: eurosToCents(4.5),
    labels: ['vegetarian'],
    modifierGroups: [],
  }),
  product({
    id: 'p_mk_nut',
    categoryId: 'cat_desserts',
    externalRef: 'mk-nut',
    name: 'Milkshake Nutella',
    description: '',
    image: img.milkshake,
    basePrice: eurosToCents(5.5),
    modifierGroups: [
      { id: 'grp_tops', name: 'Toppings', kind: 'supplement', minSelect: 0, maxSelect: 3, options: [opt('top_oreo', 'Oreo', 0.5), opt('top_cacahuete', 'Cacahuète', 0.5), opt('top_pistache', 'Éclats pistache', 0.5)] },
    ],
  }),
  product({
    id: 'p_dr_coca',
    categoryId: 'cat_boissons',
    externalRef: 'dr-coca',
    name: 'Coca-Cola 33cl',
    description: '',
    image: img.boisson,
    basePrice: eurosToCents(2),
    allowsNote: false,
    modifierGroups: [],
  }),
  product({
    id: 'p_dr_zero',
    categoryId: 'cat_boissons',
    externalRef: 'dr-zero',
    name: 'Coca Zero 33cl',
    description: '',
    image: img.boisson,
    basePrice: eurosToCents(2),
    allowsNote: false,
    modifierGroups: [],
  }),
];

export const osmashMenu: RestaurantMenu = {
  restaurant: osmash,
  categories: [
    { id: 'cat_burgers', restaurantId: RID, name: 'Smash Burgers', position: 1 },
    { id: 'cat_formules', restaurantId: RID, name: 'Formules', position: 2 },
    { id: 'cat_bao', restaurantId: RID, name: 'BAO & Wraps', position: 3 },
    { id: 'cat_riz', restaurantId: RID, name: 'Riz Crousty', position: 4 },
    { id: 'cat_sides', restaurantId: RID, name: 'Sides', position: 5 },
    { id: 'cat_desserts', restaurantId: RID, name: 'Desserts', position: 6 },
    { id: 'cat_boissons', restaurantId: RID, name: 'Boissons', position: 7 },
  ],
  products,
};
