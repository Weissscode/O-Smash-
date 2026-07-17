export const CATS = [{
  id: 'burger',
  name: 'Burgers',
  color: '#7C3AED'
}, {
  id: 'formule',
  name: 'Formules',
  color: '#6D28D9'
}, {
  id: 'riz',
  name: 'Riz Crousty',
  color: '#D97706'
}, {
  id: 'sides',
  name: 'Sides',
  color: '#0891B2'
}, {
  id: 'loaded',
  name: 'Loaded',
  color: '#DC2626'
}, {
  id: 'desserts',
  name: 'Desserts',
  color: '#DB2777'
}, {
  id: 'boissons',
  name: 'Boissons',
  color: '#2563EB'
}, {
  id: 'milkshake',
  name: 'Milkshakes',
  color: '#7C3AED'
}, {
  id: 'crepes',
  name: 'Crêpes',
  color: '#B45309'
}];
export const BURGERS = [{
  id: 'b-orig',
  name: "O'Smash Original",
  price: 6.5,
  tag: 'SIMPLE',
  desc: 'Double steak, cheddar, oignon crispy, cornichon'
}, {
  id: 'b-chik',
  name: "O'Smash Chicken",
  price: 6.5,
  tag: 'SIMPLE',
  desc: 'Double crispy chicken, cheddar, oignon, salade, tomate'
}, {
  id: 'b-veg',
  name: "O'Smash Veggy",
  price: 6.5,
  tag: 'VEGGY',
  desc: 'Steak veggy, cheddar, oignon, salade, tomate'
}, {
  id: 'b-smoke',
  name: "O'Smash Smoke",
  price: 8.5,
  tag: 'SIGNATURE',
  desc: 'Double steak, cheddar, oignon, bacon, sauce smoke'
}, {
  id: 'b-honey',
  name: "O'Smash Honey",
  price: 9.5,
  tag: 'SIGNATURE',
  desc: 'Double steak, chèvre, oignon crispy, salade, tomate, miel'
}, {
  id: 'b-fren',
  name: "O'Smash Frenchy",
  price: 9.9,
  tag: 'SIGNATURE',
  desc: 'Double steak, cheddar, oignon crispy, raclette'
}, {
  id: 'b-brit',
  name: "O'Smash British",
  price: 9.9,
  tag: 'SIGNATURE',
  desc: 'Double steak, cheddar, oignon, salade, tomate, bacon, œuf'
}, {
  id: 'b-spicy',
  name: "O'Smash Spicy",
  price: 9.5,
  tag: 'SIGNATURE',
  desc: 'Double steak, cheddar, oignon crispy, bacon, jalapeños',
  hasVersion: true
}, {
  id: 'b-truf',
  name: "O'Smash Truffe",
  price: 10.5,
  tag: 'SIGNATURE',
  desc: 'Double steak, cheddar, raclette, bacon, parmesan',
  hasVersion: true
}, {
  id: 'b-macc',
  name: 'Mac n Cheese Chicken Burger',
  price: 9.5,
  tag: 'SIGNATURE',
  desc: 'Burger chicken sauce mac n cheese'
}, {
  id: 'b-macb',
  name: 'Mac n Cheese Beef Burger',
  price: 9.5,
  tag: 'SIGNATURE',
  desc: 'Burger beef sauce mac n cheese'
}, {
  id: 'b-wrap',
  name: 'Wrap Chicken',
  price: 6.5,
  tag: 'WRAP',
  desc: 'Tortillas, crispy chicken, cheddar, salade, tomate'
}];
export const ETUD_CHOICES = [{
  id: 'b-orig',
  name: "O'Smash Original",
  tag: 'SIMPLE'
}, {
  id: 'b-chik',
  name: "O'Smash Chicken",
  tag: 'SIMPLE'
}, {
  id: 'b-veg',
  name: "O'Smash Veggy",
  tag: 'VEGGY'
}, {
  id: 'b-wrap',
  name: 'Wrap Chicken',
  tag: 'WRAP'
}, {
  id: 'r-riz',
  name: 'Riz Crousty',
  tag: 'RIZ'
}];
export const FORMULES = [{
  id: 'f-etud',
  name: 'Menu Étudiant',
  price: 8.0,
  isEtud: true,
  desc: 'Smash simple OU Wrap OU Riz + frite + boisson'
}, {
  id: 'f-duo-s',
  name: 'Duo Simple',
  price: 14.5,
  isDuo: true,
  duoType: 'simple',
  desc: '2 smash simple + frite + boisson'
}, {
  id: 'f-duo-g',
  name: 'Duo Signature',
  price: 16.9,
  isDuo: true,
  duoType: 'sign',
  desc: '2 smash (simple ou signature) + frites + boisson'
}];
export const RIZ = [{
  id: 'r-riz',
  name: 'Riz Crousty',
  price: 9.0,
  desc: 'Riz, sauce thaï, oignon crispy, persil, crispy chicken'
}, {
  id: 'r-rizb',
  name: 'Riz + Boisson',
  price: 10.0,
  needsDrink: true
}];
export const SIDES = [{
  id: 'si-frit',
  name: 'Frites Twister',
  price: 3.0,
  hasSauce: true,
  desc: 'Sauce au choix'
}, {
  id: 'si-chil',
  name: 'Chili Cheese x4',
  price: 3.5
}, {
  id: 'si-nugg',
  name: 'Nuggets x4',
  price: 3.5
}, {
  id: 'si-tend',
  name: 'Tenders x2',
  price: 4.0
}, {
  id: 'si-mac',
  name: 'Pates Mac n Cheese',
  price: 5.5
}];
export const LOADED = [{
  id: 'lo-wing',
  name: 'Wings x5 BBQ',
  price: 6.9
}, {
  id: 'lo-cana',
  name: 'Canadian Cheddar',
  price: 7.9,
  desc: 'Frites + oignon crispy + cheddar + chicken'
}, {
  id: 'lo-spic',
  name: 'Canadian Spicy',
  price: 7.9,
  desc: 'Frites + cheddar + oignon crispy + sauce coréenne'
}];
export const DESS = [{
  id: 'de-ore',
  name: 'Tiramisu Oreo',
  price: 3.5
}, {
  id: 'de-nut',
  name: 'Tiramisu Nutella',
  price: 3.5
}, {
  id: 'de-spe',
  name: 'Tiramisu Spéculoos',
  price: 3.5
}, {
  id: 'de-coo',
  name: 'Tiramisu Cookies',
  price: 3.5
}, {
  id: 'de-gal',
  name: 'Tiramisu Galettes Caramel',
  price: 3.5
}, {
  id: 'de-fra',
  name: 'Tiramisu Fraises',
  price: 4.0
}, {
  id: 'de-man',
  name: 'Tiramisu Mangue Passion',
  price: 4.0
}, {
  id: 'de-cb1',
  name: 'Cakebowl Fraises Choco Blanc',
  price: 9.9
}, {
  id: 'de-cb2',
  name: 'Cakebowl Framboise Pistache',
  price: 9.9
}, {
  id: 'de-cb3',
  name: 'Cakebowl Mangue Passion',
  price: 9.9
}];
export const DRINKS = [{
  id: 'dr-coca',
  name: 'Coca-Cola 33cl',
  price: 2.0
}, {
  id: 'dr-zero',
  name: 'Coca Zero 33cl',
  price: 2.0
}, {
  id: 'dr-cher',
  name: 'Coca Cherry 33cl',
  price: 2.0
}, {
  id: 'dr-fex',
  name: 'Fanta Exotique 33cl',
  price: 2.0
}, {
  id: 'dr-for',
  name: 'Fanta Orange 33cl',
  price: 2.0
}, {
  id: 'dr-itp',
  name: 'Ice Tea Peach 33cl',
  price: 2.0
}, {
  id: 'dr-itm',
  name: 'Ice Tea Menthe 33cl',
  price: 2.0
}, {
  id: 'dr-itr',
  name: 'Ice Tea Framboise 33cl',
  price: 2.0
}, {
  id: 'dr-opc',
  name: 'Oasis Pomme Cassis 33cl',
  price: 2.0
}, {
  id: 'dr-off',
  name: 'Oasis Fraise Framb. 33cl',
  price: 2.0
}, {
  id: 'dr-crp',
  name: 'Cristalline Pêche 50cl',
  price: 2.0
}, {
  id: 'dr-crf',
  name: 'Cristalline Fraise 50cl',
  price: 2.0
}, {
  id: 'dr-eau',
  name: 'Eau 50cl',
  price: 2.0
}];
export const MILKS = [{
  id: 'mk-van',
  name: 'Milkshake Vanille',
  price: 5.0
}, {
  id: 'mk-nut',
  name: 'Milkshake Nutella',
  price: 5.5
}, {
  id: 'mk-spe',
  name: 'Milkshake Spéculoos',
  price: 5.5
}, {
  id: 'mk-pis',
  name: 'Milkshake Pistache',
  price: 5.5
}, {
  id: 'mk-elm',
  name: 'Milkshake El Mojrdene',
  price: 5.5
}, {
  id: 'mk-fra',
  name: 'Milkshake Fraise',
  price: 5.5
}, {
  id: 'mk-car',
  name: 'Milkshake Caramel',
  price: 5.5
}];
export const CREP = [{
  id: 'cr-van',
  name: 'Crêpe Vanille',
  price: 5.0
}, {
  id: 'cr-nut',
  name: 'Crêpe Nutella',
  price: 5.5
}, {
  id: 'cr-spe',
  name: 'Crêpe Spéculoos',
  price: 5.5
}, {
  id: 'cr-pis',
  name: 'Crêpe Pistache',
  price: 5.5
}, {
  id: 'cr-elm',
  name: 'Crêpe El Mojrdene',
  price: 5.5
}, {
  id: 'cr-fra',
  name: 'Crêpe Fraise',
  price: 5.5
}, {
  id: 'cr-car',
  name: 'Crêpe Caramel',
  price: 5.5
}];
export const PMAP = {
  burger: BURGERS,
  formule: FORMULES,
  riz: RIZ,
  sides: SIDES,
  loaded: LOADED,
  desserts: DESS,
  boissons: DRINKS,
  milkshake: MILKS,
  crepes: CREP
};
export const CB = {
  retraits: ['Sans salade', 'Sans tomate', 'Sans oignon', 'Sans cornichon', 'Sans sauce', 'Sans fromage', 'Sans bacon'],
  supps: [{
    l: 'Supp. Cheddar',
    p: 1
  }, {
    l: 'Supp. Oignon Crispy',
    p: 0.5
  }, {
    l: 'Supp. Œuf',
    p: 1
  }, {
    l: 'Supp. Bacon',
    p: 1
  }, {
    l: 'Supp. Crispy Chicken',
    p: 2
  }, {
    l: 'Supp. Steak Smashé',
    p: 2.5
  }],
  sauces: ['Algérienne', 'Biggy', 'Smoke', 'Ketchup', 'Mayonnaise', 'BBQ', 'Honey', 'Spicy', 'Chicken', 'Truffe'],
  versions: ['Version Bœuf', 'Version Chicken']
};
export const CR = {
  types: ['Sucré', 'Spicy'],
  retraits: ['Sans sauce chili thai', 'Sans oignons crispy', 'Sans persil', 'Sans sauce blanche']
};
export const TOPS = [{
  l: 'Oreo',
  p: 0.5
}, {
  l: 'Cacahuète',
  p: 0.5
}, {
  l: 'Éclats pistache',
  p: 0.5
}];
export const FRITES_SAUCES = ['Algerienne', 'Biggy', 'Ketchup', 'Mayonnaise', 'BBQ'];
export const TWISTER_SUPPS = [{
  l: 'Bacon',
  p: 1
}, {
  l: 'Oignon frits',
  p: 0.5
}, {
  l: 'Cheddar',
  p: 1
}];
export const FRITES_SUPPS = [{
  l: 'Bacon',
  p: 1
}, {
  l: 'Oignons frits',
  p: 0.5
}, {
  l: 'Cheddar',
  p: 1
}];
export const LOADED_RETRAITS = ['Sans cheddar', 'Sans oignon crispy', 'Sans sauce', 'Sans chicken'];
export const LOADED_SUPPS = [{
  l: 'Supp. Cheddar',
  p: 1
}, {
  l: 'Supp. Bacon',
  p: 1
}, {
  l: 'Supp. Oignon Crispy',
  p: 0.5
}, {
  l: 'Supp. Chicken',
  p: 2
}];
