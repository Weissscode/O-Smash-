import { BURGERS, BAO, FORMULES, PMAP } from './products.js';

// Structure des categories de la borne. Les ids reprennent ceux du
// catalogue (products.js) pour que handleProd et les modales existantes
// s'appliquent tels quels ; seuls les libelles changent (Sides et Loaded
// sont deja fusionnes dans 'sides' : ici on l'appelle "Petite faim").
// 'menus' est propre a la borne : chaque burger / BAO "en menu" y est
// presente comme un produit a part entiere, plus les formules.

// Meme supplement que "En menu (+3€)" dans BurgerStartModal / App.jsx.
export const MENU_EXTRA = 3;

export const KIOSK_CATS = [
  { id: 'burger', name: 'Burgers' },
  { id: 'menus', name: 'Menus' },
  { id: 'bao', name: 'BAO' },
  { id: 'riz', name: 'Riz Crousty' },
  { id: 'sides', name: 'Petite faim' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'boissons', name: 'Boissons' },
  { id: 'milkshake', name: 'Milkshakes' },
  { id: 'crepes', name: 'Crêpes' }
];

const menuName = p => 'Menu ' + p.name.replace(/^O'Smash\s+/i, '').replace(/\s+Burger$/i, '');

// Un "menu" de la borne pointe (menuOf) vers le burger ou BAO du catalogue :
// le toucher ouvre directement la personnalisation en mode menu, comme si
// le client avait choisi "En menu" a la caisse.
export const KIOSK_MENUS = [
  ...BURGERS.map(b => ({ id: 'm-' + b.id, menuOf: b.id, name: menuName(b), price: b.price + MENU_EXTRA })),
  ...BAO.map(b => ({ id: 'm-' + b.id, menuOf: b.id, name: menuName(b), price: b.price + MENU_EXTRA })),
  ...FORMULES
];

export function kioskProducts(catId, map = PMAP) {
  if (catId === 'menus') return KIOSK_MENUS;
  return map[catId] || [];
}
