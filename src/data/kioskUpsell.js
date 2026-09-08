import { SIDES, LOADED, DRINKS, DESS } from './products.js';

// Suggestions d'extras de la borne ("Un extra avec ca ?"), affichees juste
// avant l'ajout au panier d'un plat principal. Uniquement des produits et
// des prix du catalogue (products.js) : on ne fait que citer des ids.
//
// Pour changer les recommandations, modifier les listes ci-dessous. L'ordre
// est celui de l'affichage ; au plus UPSELL_MAX produits sont montres, et
// les produits en rupture sont retires automatiquement.

export const UPSELL_MAX = 4;

export const UPSELL_RULES = {
  // Burger seul : loaded premium, tenders, frites
  burger: ['lo-cana', 'lo-spic', 'si-tend', 'si-frit'],
  // Burger en menu ou formule (frites deja incluses) : sides premium
  menu: ['lo-cana', 'lo-wing', 'si-tend', 'si-chil'],
  // Riz Crousty seul : une boisson + sides adaptes + un dessert
  riz: ['dr-coca', 'si-frit', 'si-nugg', 'de-ore'],
  // Riz + boisson (boisson deja incluse) : sides + dessert
  rizBoisson: ['si-frit', 'si-nugg', 'si-tend', 'de-ore']
};

// Quel jeu de regles s'applique a un article qui vient d'etre configure.
// null = pas d'upsell (boisson, dessert, side, milkshake, crepe, loaded...).
export function upsellTriggerFor(item) {
  const pid = item.pid || '';
  const cust = item.cust || {};
  if (pid.startsWith('b-')) return cust.inMenu ? 'menu' : 'burger';
  if (pid.startsWith('f-')) return 'menu';
  if (pid === 'r-rizb' || (pid.startsWith('r-') && cust.drink)) return 'rizBoisson';
  if (pid.startsWith('r-')) return 'riz';
  return null;
}

const CATALOG = [...SIDES, ...LOADED, ...DRINKS, ...DESS];

export function kioskUpsellFor(item, stockOut = []) {
  const trigger = upsellTriggerFor(item);
  if (!trigger) return [];
  return (UPSELL_RULES[trigger] || [])
    .map(id => CATALOG.find(p => p.id === id))
    .filter(p => p && !stockOut.includes(p.id))
    .slice(0, UPSELL_MAX);
}
