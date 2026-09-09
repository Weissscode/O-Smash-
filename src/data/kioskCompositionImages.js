import { productImage } from "./kioskCatalogue.js";

// Shared photography only: labels and catalogue/pricing data remain unchanged.
export const COMPOSITION_IMAGES = {
  sauces: Object.fromEntries(
    [
      "algerienne",
      "biggy",
      "smoke",
      "ketchup",
      "mayonnaise",
      "bbq",
      "honey",
      "spicy",
      "chicken",
      "truffe",
    ].map((id) => [id, `/products/sauce-${id}.webp`]),
  ),
  ingredients: Object.fromEntries(
    [
      "salade",
      "tomate",
      "oignon",
      "cornichon",
      "sauce",
      "cheddar",
      "bacon",
      "oignon-crispy",
      "oeuf",
      "crispy-chicken",
      "steak-smashe",
    ].map((id) => [id, `/products/ingredient-${id}.webp`]),
  ),
};
const normalize = (label) =>
  label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe");
const ingredients = {
  salade: "salade",
  tomate: "tomate",
  oignon: "oignon",
  cornichon: "cornichon",
  sauce: "sauce",
  fromage: "cheddar",
  cheddar: "cheddar",
  bacon: "bacon",
  "oignon crispy": "oignon-crispy",
  "oignon frits": "oignon-crispy",
  "oignons frits": "oignon-crispy",
  oeuf: "oeuf",
  chicken: "crispy-chicken",
  "crispy chicken": "crispy-chicken",
  "steak smashe": "steak-smashe",
};
export function optionImage(label) {
  const key = normalize(label);
  if (COMPOSITION_IMAGES.sauces[key]) return COMPOSITION_IMAGES.sauces[key];
  const ingredient = ingredients[key.replace(/^(sans |supp\. )/, "")];
  return COMPOSITION_IMAGES.ingredients[ingredient] || null;
}
export function compositionProductImage(id, inMenu = false) {
  return productImage(id, inMenu) || `/products/${id}.jpg`;
}
