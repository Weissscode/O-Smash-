import test from "node:test";
import assert from "node:assert/strict";
import { BURGERS, SIDES, BAO } from "../src/data/products.js";
import {
  createBurgerDraft,
  composerSteps,
  composerLines,
  composerError,
  burgerLine,
} from "../src/data/kioskComposer.js";
const product = BURGERS.find((p) => p.id === "b-orig");

test("burger and menu expose only their applicable steps", () => {
  assert.deepEqual(composerSteps(false), [
    "mode",
    "sauce",
    "retraits",
    "supplements",
    "extras",
    "recap",
  ]);
  assert.deepEqual(composerSteps(true), [
    "mode",
    "sauce",
    "retraits",
    "supplements",
    "fritesSauce",
    "fritesSupps",
    "drink",
    "extras",
    "recap",
  ]);
});
test("menu and customized extras produce the existing cart/ticket fields and exact total", () => {
  const draft = {
    ...createBurgerDraft({}, true),
    sauces: ["Biggy"],
    retraits: ["Sans oignon"],
    supplements: ["Supp. Cheddar"],
    twisterSauce: "BBQ",
    twisterSupps: ["Bacon"],
    drink: "Coca-Cola 33cl",
    extraIds: ["lo-cana", "si-frit"],
    extraOptions: {
      "lo-cana": { retraits: ["Sans chicken"], supplements: ["Supp. Bacon"] },
      "si-frit": { sauce: "Ketchup", supps: ["Cheddar"] },
    },
  };
  const lines = composerLines(product, draft);
  assert.equal(lines[0].unit, 11.5);
  assert.equal(lines[0].cust.fritesSauce, "BBQ");
  assert.deepEqual(lines[0].cust.fritesSupps, ["Bacon"]);
  assert.equal(lines[0].cust.drink, "Coca-Cola 33cl");
  assert.equal(lines[0].cust.inMenu, true);
  assert.equal(lines[0].pid, product.id);
  assert.equal(lines[1].unit, 8.9);
  assert.equal(lines[2].unit, 4);
  assert.equal(
    lines.reduce((s, p) => s + p.total, 0),
    24.4,
  );
});
test("switching to burger removes menu charges and ticket fields without losing the draft", () => {
  const draft = {
    ...createBurgerDraft({}, true),
    twisterSupps: ["Bacon"],
    twisterSauce: "BBQ",
    drink: "Coca-Cola 33cl",
  };
  const burger = burgerLine(product, { ...draft, inMenu: false }, 2);
  assert.equal(burger.unit, 6.5);
  assert.equal(burger.total, 13);
  assert.equal(burger.cust.drink, undefined);
  assert.deepEqual(burger.cust.twisterSupps, []);
  assert.equal(burgerLine(product, draft).unit, 10.5);
  assert.equal(draft.drink, "Coca-Cola 33cl");
});
test("editing restores old aliases and quantity while keeping extras separate", () => {
  const initial = {
    inMenu: true,
    fritesSauce: "BBQ",
    fritesSupps: ["Cheddar"],
    drink: "Coca-Cola 33cl",
    supplements: ["Supp. Cheddar"],
  };
  const draft = createBurgerDraft(initial, true);
  const line = burgerLine(product, draft, 3);
  assert.equal(line.unit, 11.5);
  assert.equal(line.total, 34.5);
  assert.equal(line.qty, 3);
  assert.deepEqual(draft.extraIds, []);
  assert.equal(initial.twisterSauce, undefined);
});
test("validation rejects missing drink, unavailable drink, main product and extras", () => {
  const draft = createBurgerDraft({}, true);
  assert.ok(composerError(product, draft));
  draft.drink = "Coca-Cola 33cl";
  assert.equal(composerError(product, draft), "");
  assert.ok(composerError(product, draft, ["dr-coca"]));
  assert.ok(composerError(product, draft, [product.id]));
  draft.extraIds = ["si-tend"];
  assert.ok(composerError(product, draft, ["si-tend"]));
});
test("BAO uses the current base price and plain extras do not alter their schema", () => {
  const p = BAO[0],
    draft = { ...createBurgerDraft(), extraIds: ["si-tend"] };
  const lines = composerLines(p, draft);
  assert.equal(lines[0].unit, p.price);
  assert.equal(lines[1].unit, SIDES.find((p) => p.id === "si-tend").price);
  assert.equal(lines[1].cust, null);
});
