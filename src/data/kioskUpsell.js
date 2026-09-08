import { PMAP } from "./products.js";

// Edit recommendation IDs here. Names and prices always come from the catalogue.
export const UPSELL_RULES = {
  burger: ["lo-cana", "si-tend", "si-frit", "si-chil"],
  menu: ["lo-cana", "si-tend", "lo-spic", "si-chil"],
  riz: ["dr-coca", "dr-zero", "si-tend", "si-chil"],
};

export function upsellGroup(item) {
  if (item.pid.startsWith("f-") || item.cust?.inMenu) return "menu";
  if (item.pid.startsWith("b-") || item.pid.startsWith("bao-")) return "burger";
  if (item.pid.startsWith("r-")) return "riz";
  return null;
}

export function getUpsellSuggestions(item, stockOut = [], cart = []) {
  const group = upsellGroup(item);
  const excluded = new Set([item.pid, ...stockOut, ...cart.map((i) => i.pid)]);
  // Menus already include Twister; rice with a drink needs no second drink.
  if (group === "menu") excluded.add("si-frit");
  return (UPSELL_RULES[group] || [])
    .flatMap((id) => {
      if (excluded.has(id) || ((item.cust?.drink || item.cust?.boisson) && id.startsWith("dr-")))
        return [];
      for (const [category, products] of Object.entries(PMAP)) {
        const product = products.find((p) => p.id === id);
        if (product) return [{ ...product, category }];
      }
      return [];
    })
    .slice(0, 4);
}
