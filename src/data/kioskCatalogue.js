import { CATS, BURGERS, FORMULES, SIDES, LOADED, PMAP } from "./products.js";

// BAO catalogue copied without price changes from main, commit 0dbc55c.
export const BAO = [
  {
    id: "bao-orig",
    name: "BAO Original",
    price: 8.5,
    tag: "BAO",
    desc: "Bao, double steak smashé, cheddar, oignon crispy, cornichon, sauce moutarde ketchup ou biggy",
  },
  {
    id: "bao-spicy",
    name: "BAO Spicy",
    price: 10.9,
    tag: "BAO",
    desc: "Bao, double steak smashé, cheddar, salade, tomate, oignon crispy, bacon, jalapeños, sauce spicy",
  },
  {
    id: "bao-chick",
    name: "BAO Chicken",
    price: 8.5,
    tag: "BAO",
    desc: "Bao, double crispy chicken, cheddar, oignon, salade, tomate, sauce chicken",
  },
  {
    id: "bao-cara",
    name: "BAO Caramel",
    price: 11.5,
    tag: "BAO",
    desc: "Bao, double steak smashé, cheddar, salade, tomate, oignon caramélisé, sauce honey barbecue",
  },
  {
    id: "bao-mnc",
    name: "Mac n Chicken Cheese Burger",
    price: 9.0,
    tag: "BAO",
    desc: "Mac n cheese, crispy chicken, sauce cheddar, oignon crispy, persil",
  },
  {
    id: "bao-mncb",
    name: "Mac n Cheese Beef Burger",
    price: 10.0,
    tag: "BAO",
    desc: "Potato buns, double steak smashé, cheddar, oignon crispy, sauce biggy ou spicy",
  },
];

export const PRODUCT_IMAGES = {
  "b-orig": "burger_classic_pickles_bacon.png",
  "b-chik": "burger_chicken_double_crispy.png",
  "b-smoke": "burger_cheddar_bacon_classic.png",
  "b-fren": "burger_crispy_onion_double.png",
  "b-brit": "burger_egg_bacon.png",
  "b-spicy": "burger_brioche_bacon_jalapeno.png",
  "b-wrap": "wrap_poulet_crousty.png",
  "bao-orig": "burger_black_bun_double_jalapeno.png",
  "bao-spicy": "burger_black_bun_bacon_double.png",
  "bao-chick": "burger_chicken_crispy_cheddar.png",
  "bao-cara": "burger_bao_style.png",
  "r-riz": "mac_n_cheese_gratin_bis.png",
  "r-rizb": "mac_n_cheese_gratin_bis.png",
  "lo-cana": "onion_rings_twister.png",
  "si-frit": "curly_fries.png",
};
export const MENU_IMAGES = {
  "b-orig": "_ORIGINAL MENU .png",
  "b-chik": "CHICKEN MENU .png",
  "b-smoke": "SMOKE  MENU .png",
  "b-fren": "FRENCHY  MENU .png",
  "b-brit": "BRITISH MENU .png",
  "b-spicy": "SPICY MENU .png",
  "b-truf": "TRUFFEMENU .png",
  "b-wrap": "WRAP MENU .png",
  "bao-orig": "BAO ORIGINAL MENU .png",
  "bao-spicy": "BAO SPICY MENU .png",
  "bao-chick": "BAO CHICKEN MENU .png",
  "bao-cara": "BAO CARAMEL MENU .png",
};
export const CATEGORY_IMAGES = {
  burger: PRODUCT_IMAGES["b-orig"],
  menus: MENU_IMAGES["b-chik"],
  bao: PRODUCT_IMAGES["bao-orig"],
  riz: PRODUCT_IMAGES["r-riz"],
  petite: PRODUCT_IMAGES["lo-cana"],
  boissons: "boisson .png",
  milkshake: "milkshake .png",
};
export const imageUrl = (file) =>
  file ? "/" + encodeURIComponent(file) : null;
export function productImage(id, inMenu = false) {
  return imageUrl((inMenu && MENU_IMAGES[id]) || PRODUCT_IMAGES[id]);
}

// Presentation categories retain the source category required by handleProd.
export function kioskCatalogue(customProducts = []) {
  const source = (products, category) =>
    products.map((p) => ({ ...p, sourceCategory: category }));
  const menuProducts = [...BURGERS, ...BAO].map((p) => ({
    ...p,
    name: "Menu " + p.name,
    price: p.price + 3,
    menuProduct: p,
    sourceCategory: "burger",
    image: productImage(p.id, true),
  }));
  const cats = [
    { id: "burger", name: "Burgers" },
    { id: "menus", name: "Menus" },
    { id: "bao", name: "BAO" },
    { id: "riz", name: "Riz Crousty" },
    { id: "petite", name: "Petite faim" },
    ...CATS.filter((c) =>
      ["desserts", "boissons", "milkshake", "crepes"].includes(c.id),
    ),
  ];
  const products = {
    ...PMAP,
    burger: source(BURGERS, "burger"),
    menus: [...menuProducts, ...source(FORMULES, "formule")],
    bao: source(BAO, "bao"),
    petite: [...source(SIDES, "sides"), ...source(LOADED, "loaded")],
  };
  // Show supplied photography first without removing unavailable visual entries.
  for (const key of ['burger', 'menus', 'bao', 'petite']) {
    products[key].sort((a, b) => Number(!!(b.image || productImage(b.id))) - Number(!!(a.image || productImage(a.id))));
  }
  if (customProducts.length) {
    cats.push({ id: "divers", name: "Divers" });
    products.divers = source(customProducts, "divers");
  }
  return { cats, products };
}
