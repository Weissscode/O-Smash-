import { MAX_LINE_QUANTITY, selectItemCount, selectSubtotal, useCartStore, type AddLineInput } from '@/store/cart-store';

const osmash = { id: 'rest_osmash', name: "O'SMASH", slug: 'osmash' };
const tacos = { id: 'rest_demo_tacos', name: 'Tacos House', slug: 'demo-tacos-house' };

const line = (over: Partial<AddLineInput> = {}): AddLineInput => ({
  productId: 'p_b_orig',
  name: "O'Smash Original",
  image: null,
  unitPrice: 650,
  quantity: 1,
  selections: {},
  summary: [],
  note: null,
  ...over,
});

beforeEach(() => useCartStore.getState().clear());

describe('panier mono-restaurant', () => {
  it('ajoute un article et mémorise le restaurant', () => {
    expect(useCartStore.getState().addLine(osmash, line())).toEqual({ status: 'added' });
    const s = useCartStore.getState();
    expect(s.restaurantId).toBe('rest_osmash');
    expect(s.restaurantSlug).toBe('osmash');
    expect(selectItemCount(s)).toBe(1);
  });

  it("refuse un produit d'un autre restaurant et ne modifie rien", () => {
    useCartStore.getState().addLine(osmash, line());
    const result = useCartStore.getState().addLine(tacos, line({ productId: 'p_t_m' }));
    expect(result).toEqual({ status: 'conflict', currentRestaurantName: "O'SMASH" });
    expect(useCartStore.getState().restaurantId).toBe('rest_osmash');
    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it('remplace le panier si le client le confirme', () => {
    useCartStore.getState().addLine(osmash, line());
    useCartStore.getState().setFulfillment('dine_in');
    useCartStore.getState().addLine(tacos, line({ productId: 'p_t_m', unitPrice: 750 }), { replaceCart: true });
    const s = useCartStore.getState();
    expect(s.restaurantId).toBe('rest_demo_tacos');
    expect(s.lines.map((l) => l.productId)).toEqual(['p_t_m']);
    expect(s.fulfillment).toBeNull();
  });

  it('fusionne deux ajouts identiques, sépare les configurations différentes', () => {
    const { addLine } = useCartStore.getState();
    addLine(osmash, line());
    addLine(osmash, line({ quantity: 2 }));
    addLine(osmash, line({ selections: { grp_burger_removals: ['rm_oignon'] } }));
    const s = useCartStore.getState();
    expect(s.lines).toHaveLength(2);
    expect(s.lines[0].quantity).toBe(3);
    expect(selectSubtotal(s)).toBe(650 * 4);
  });

  it('plafonne la quantité et supprime la ligne à 0', () => {
    useCartStore.getState().addLine(osmash, line());
    const id = useCartStore.getState().lines[0].lineId;
    useCartStore.getState().updateQuantity(id, 999);
    expect(useCartStore.getState().lines[0].quantity).toBe(MAX_LINE_QUANTITY);
    useCartStore.getState().updateQuantity(id, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
    expect(useCartStore.getState().restaurantId).toBeNull();
  });

  it('un panier vidé accepte un autre restaurant sans conflit', () => {
    useCartStore.getState().addLine(osmash, line());
    useCartStore.getState().removeLine(useCartStore.getState().lines[0].lineId);
    expect(useCartStore.getState().addLine(tacos, line({ productId: 'p_t_m' }))).toEqual({ status: 'added' });
  });
});
