import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, storageKeys } from '@/lib/storage';
import type { Cart, CartLine, Cents, FulfillmentMode, ID } from '@/types/domain';

/**
 * Panier local, limité à UN restaurant.
 * Persisté sur l'appareil : il survit à la connexion, à la fermeture de l'app
 * et aux coupures réseau. Il ne contient aucune donnée sensible.
 */

export type AddLineInput = Omit<CartLine, 'lineId'>;

export type AddResult = { status: 'added' } | { status: 'conflict'; currentRestaurantName: string };

type CartState = Cart & {
  addLine: (restaurant: { id: ID; name: string; slug: string }, line: AddLineInput, options?: { replaceCart?: boolean }) => AddResult;
  updateQuantity: (lineId: ID, quantity: number) => void;
  removeLine: (lineId: ID) => void;
  setFulfillment: (mode: FulfillmentMode) => void;
  clear: () => void;
};

const emptyCart: Cart = { restaurantId: null, restaurantName: null, restaurantSlug: null, lines: [], fulfillment: null };

let counter = 0;
const newLineId = () => `line_${Date.now().toString(36)}_${(counter++).toString(36)}`;

const sameConfiguration = (a: AddLineInput, b: CartLine) =>
  a.productId === b.productId && a.note === b.note && JSON.stringify(a.selections) === JSON.stringify(b.selections);

export const MAX_LINE_QUANTITY = 20;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...emptyCart,
      addLine: (restaurant, line, options = {}) => {
        const state = get();
        if (state.restaurantId && state.restaurantId !== restaurant.id && state.lines.length > 0 && !options.replaceCart) {
          return { status: 'conflict', currentRestaurantName: state.restaurantName ?? 'un autre restaurant' };
        }
        const base = state.restaurantId === restaurant.id ? state : { ...emptyCart };
        const existing = base.lines.find((l) => sameConfiguration(line, l));
        const lines = existing
          ? base.lines.map((l) =>
              l.lineId === existing.lineId ? { ...l, quantity: Math.min(MAX_LINE_QUANTITY, l.quantity + line.quantity) } : l,
            )
          : [...base.lines, { ...line, lineId: newLineId() }];
        set({ restaurantId: restaurant.id, restaurantName: restaurant.name, restaurantSlug: restaurant.slug, lines, fulfillment: base.fulfillment });
        return { status: 'added' };
      },
      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) return get().removeLine(lineId);
        set({ lines: get().lines.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.min(MAX_LINE_QUANTITY, quantity) } : l)) });
      },
      removeLine: (lineId) => {
        const lines = get().lines.filter((l) => l.lineId !== lineId);
        set(lines.length === 0 ? { ...emptyCart } : { lines });
      },
      setFulfillment: (fulfillment) => set({ fulfillment }),
      clear: () => set({ ...emptyCart }),
    }),
    {
      name: storageKeys.cart,
      storage: persistStorage,
      version: 1,
      partialize: ({ restaurantId, restaurantName, restaurantSlug, lines, fulfillment }) => ({ restaurantId, restaurantName, restaurantSlug, lines, fulfillment }),
    },
  ),
);

export const selectItemCount = (s: Cart) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const selectSubtotal = (s: Cart): Cents => s.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
