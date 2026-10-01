/**
 * Modèle de domaine Vice Go (côté client).
 *
 * Ces types décrivent le catalogue RELATIONNEL multi-restaurants qui sera
 * créé en base en phase 2 (tables restaurants / menu_categories / products /
 * modifier_groups / modifier_options...). La couche services/catalog fait la
 * traduction entre les lignes Supabase et ces types : les écrans ne
 * connaissent jamais le schéma SQL.
 *
 * Règles :
 * - Tous les montants sont en CENTIMES (entiers) pour éviter les erreurs
 *   d'arrondi. Le prix affiché n'est qu'indicatif : le total fait foi
 *   uniquement après recalcul côté serveur (phase 5).
 * - Aucune donnée n'est spécifique à O'SMASH.
 */

export type ID = string;
export type Cents = number;

/** URL distante (Supabase Storage) ou asset local (fixtures de démo). */
export type ImageRef = string | number;

export type LatLng = { latitude: number; longitude: number };

/** "HH:MM" en heure locale du restaurant. */
export type TimeOfDay = `${number}:${number}`;

export type TimeRange = { open: TimeOfDay; close: TimeOfDay };

/** Index 0 = dimanche ... 6 = samedi (convention Date.getDay()). */
export type WeeklyHours = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, TimeRange[]>;

export type FulfillmentMode = 'dine_in' | 'takeaway';
export type PaymentMethod = 'counter' | 'card' | 'apple_pay';

export type EtaSettings = {
  /** Délai de base d'une commande simple, à vide (minutes). */
  basePrepMinutes: number;
  /** Ajustement manuel du restaurateur en période chargée (minutes). */
  loadAdjustMinutes: number;
  /** Nombre de commandes préparées en parallèle. */
  parallelCapacity: number;
  /** Minutes ajoutées par "vague" de commandes en attente. */
  minutesPerQueuedBatch: number;
  /** Minutes ajoutées par article au-delà du 2e. */
  minutesPerExtraItem: number;
};

export type RestaurantSettings = {
  fulfillmentModes: FulfillmentMode[];
  paymentMethods: PaymentMethod[];
  autoAccept: boolean;
  scheduledOrders: { enabled: boolean; slotMinutes: number; maxDaysAhead: number };
  eta: EtaSettings;
};

/** Catégorie transverse de découverte (accueil), commune à tous les restaurants. */
export type DiscoveryCategory = {
  id: ID;
  label: string;
  /** Nom de symbole (SF Symbols iOS / Material Android-web). */
  icon: { ios: string; material: string };
};

export type Restaurant = {
  id: ID;
  slug: string;
  name: string;
  tagline: string;
  discoveryCategoryIds: ID[];
  cuisineLabel: string;
  logo: ImageRef | null;
  cover: ImageRef | null;
  /** Couleur de marque du restaurant, utilisée en touche (jamais en fond plein). */
  brandColor: string;
  address: { line1: string; postalCode: string; city: string };
  location: LatLng;
  timezone: string;
  openingHours: WeeklyHours;
  /** Pause manuelle par le restaurateur (indépendante des horaires). */
  isPaused: boolean;
  settings: RestaurantSettings;
  loyaltyEnabled: boolean;
  /** Score de popularité calculé côté serveur (0..100). */
  popularity: number;
  /** Commandes actives à l'instant (alimente l'estimation du délai). */
  activeOrders: number;
  /** Données de démonstration : jamais affichées en production. */
  isDemo?: boolean;
};

export type DietaryLabel = 'vegetarian' | 'vegan' | 'halal' | 'spicy' | 'new' | 'signature' | 'gluten_free';

export type ModifierKind =
  /** Variante exclusive qui change le produit (ex. version bœuf / chicken). */
  | 'variant'
  /** Choix générique (ex. type de sauce du riz). */
  | 'choice'
  | 'sauce'
  | 'supplement'
  /** Retrait d'ingrédient (gratuit). */
  | 'removal'
  /** Élément d'un menu / formule renvoyant vers un autre produit. */
  | 'combo_item';

export type ModifierOption = {
  id: ID;
  name: string;
  priceDelta: Cents;
  isAvailable: boolean;
  /** Pour les formules : produit du catalogue représenté par cette option. */
  productRef?: ID;
  isDefault?: boolean;
};

export type ModifierGroup = {
  id: ID;
  name: string;
  kind: ModifierKind;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
};

export type Product = {
  id: ID;
  restaurantId: ID;
  categoryId: ID;
  /** Identifiant historique côté caisse (ex. "b-orig") : stock, tickets, stats. */
  externalRef: string | null;
  name: string;
  description: string;
  image: ImageRef | null;
  basePrice: Cents;
  isAvailable: boolean;
  labels: DietaryLabel[];
  /** Liste d'allergènes (vide = non renseigné, à ne pas confondre avec "aucun"). */
  allergens: string[];
  allergensKnown: boolean;
  /** Minutes de préparation supplémentaires liées à la complexité. */
  extraPrepMinutes: number;
  isCombo: boolean;
  allowsNote: boolean;
  modifierGroups: ModifierGroup[];
  isPopular?: boolean;
};

export type MenuCategory = {
  id: ID;
  restaurantId: ID;
  name: string;
  position: number;
};

export type RestaurantMenu = {
  restaurant: Restaurant;
  categories: MenuCategory[];
  products: Product[];
};

/** Sélection d'options pour une ligne : groupId -> optionIds. */
export type Selections = Record<ID, ID[]>;

export type CartLine = {
  lineId: ID;
  productId: ID;
  name: string;
  image: ImageRef | null;
  unitPrice: Cents;
  quantity: number;
  selections: Selections;
  summary: string[];
  note: string | null;
};

export type Cart = {
  restaurantId: ID | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
  lines: CartLine[];
  fulfillment: FulfillmentMode | null;
};
