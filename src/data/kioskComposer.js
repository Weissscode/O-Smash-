import {
  CB,
  TWISTER_SUPPS,
  FRITES_SUPPS,
  LOADED_SUPPS,
  DRINKS,
  SIDES,
} from "./products.js";

const round = (n) => Math.round(n * 100) / 100;
const sum = (labels = [], catalogue) =>
  labels.reduce(
    (n, label) => n + (catalogue.find((p) => p.l === label)?.p || 0),
    0,
  );
export function createBurgerDraft(initial = {}, inMenu = false) {
  return {
    sauces: [],
    retraits: [],
    supplements: [],
    version: "",
    note: "",
    twisterSauce: initial.fritesSauce || "",
    twisterSupps: initial.fritesSupps || [],
    drink: "",
    ...initial,
    inMenu,
    extraIds: [],
    extraOptions: {},
  };
}
export function composerSteps(inMenu) {
  return [
    "mode",
    "sauce",
    "retraits",
    "supplements",
    ...(inMenu ? ["fritesSauce", "fritesSupps", "drink"] : []),
    "extras",
    "recap",
  ];
}
export function burgerLine(product, draft, qty = 1) {
  const unit = round(
    product.price +
      sum(draft.supplements, CB.supps) +
      (draft.inMenu ? 3 + sum(draft.twisterSupps, TWISTER_SUPPS) : 0),
  );
  const cust = {
    retraits: draft.retraits,
    supplements: draft.supplements,
    sauces: draft.sauces,
    version: draft.version,
    note: draft.note,
    twisterSauce: draft.inMenu ? draft.twisterSauce : "",
    twisterSupps: draft.inMenu ? draft.twisterSupps : [],
    ...(draft.inMenu
      ? {
          inMenu: true,
          drink: draft.drink,
          fritesSauce: draft.twisterSauce,
          fritesSupps: draft.twisterSupps,
        }
      : {}),
  };
  return {
    pid: product.id,
    name: product.name + (draft.inMenu ? " (en menu)" : ""),
    unit,
    qty,
    total: round(unit * qty),
    cust,
  };
}
export function extraLine(product, options = {}) {
  const loaded = product.id.startsWith("lo-");
  const cust = loaded
    ? {
        retraits: options.retraits || [],
        supplements: options.supplements || [],
        note: options.note || "",
      }
    : product.hasSauce
      ? { sauce: options.sauce || "", supps: options.supps || [] }
      : null;
  const unit = round(
    product.price +
      (loaded
        ? sum(cust.supplements, LOADED_SUPPS)
        : product.hasSauce
          ? sum(cust.supps, FRITES_SUPPS)
          : 0),
  );
  return {
    pid: product.id,
    name: product.name,
    unit,
    qty: 1,
    total: unit,
    cust,
  };
}
export function composerLines(product, draft, qty = 1) {
  return [
    burgerLine(product, draft, qty),
    ...draft.extraIds.map((id) => {
      const p = SIDES.find((p) => p.id === id);
      if (!p) throw new Error("Cet extra n'est plus disponible.");
      return extraLine(p, draft.extraOptions[id]);
    }),
  ];
}
export function composerError(product, draft, stockOut = []) {
  if (stockOut.includes(product.id))
    return "Ce produit est maintenant indisponible.";
  if (draft.inMenu) {
    const drink = DRINKS.find((p) => p.name === draft.drink);
    if (!drink) return "Choisissez la boisson de votre menu.";
    if (stockOut.includes(drink.id))
      return "Cette boisson est indisponible. Choisissez-en une autre.";
  }
  if (
    draft.extraIds.some(
      (id) => stockOut.includes(id) || !SIDES.some((p) => p.id === id),
    )
  )
    return "Un extra est indisponible. Retirez-le ou remplacez-le.";
  return "";
}
