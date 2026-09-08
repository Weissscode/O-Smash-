import test from "node:test";
import assert from "node:assert/strict";
import {
  getUpsellSuggestions,
  upsellGroup,
  UPSELL_RULES,
} from "../src/data/kioskUpsell.js";
import { PMAP } from "../src/data/products.js";

test("suggestions resolve catalogue IDs, names and prices, at most four", () => {
  for (const pid of ["b-orig", "f-etud", "r-riz"]) {
    const suggestions = getUpsellSuggestions({ pid });
    assert.ok(suggestions.length > 0 && suggestions.length <= 4);
    for (const suggestion of suggestions) {
      const source = PMAP[suggestion.category].find(
        (p) => p.id === suggestion.id,
      );
      assert.equal(suggestion.name, source.name);
      assert.equal(suggestion.price, source.price);
    }
  }
  assert.equal(
    getUpsellSuggestions({ pid: "b-orig" }).find((p) => p.id === "lo-cana")
      .price,
    7.9,
  );
});
test("menu excludes included Twister, rice with drink excludes drinks", () => {
  assert.equal(upsellGroup({ pid: "b-orig", cust: { inMenu: true } }), "menu");
  assert.ok(
    !getUpsellSuggestions({ pid: "b-orig", cust: { inMenu: true } }).some(
      (p) => p.id === "si-frit",
    ),
  );
  assert.ok(
    !getUpsellSuggestions({
      pid: "r-rizb",
      cust: { drink: "Coca-Cola 33cl" },
    }).some((p) => p.category === "boissons"),
  );
});
test("no upsell after extras, beverages, dessert, milkshake or crepe", () => {
  for (const pid of [
    "si-tend",
    "lo-cana",
    "dr-coca",
    "de-ore",
    "mk-van",
    "cr-van",
  ]) {
    assert.equal(upsellGroup({ pid }), null);
    assert.deepEqual(getUpsellSuggestions({ pid }), []);
  }
});
test("unavailable products and products already in cart are excluded", () => {
  const result = getUpsellSuggestions(
    { pid: "b-orig" },
    ["lo-cana"],
    [{ pid: "si-tend" }],
  );
  assert.deepEqual(
    result.map((p) => p.id),
    ["si-frit", "si-chil"],
  );
  assert.deepEqual(
    getUpsellSuggestions({ pid: "b-orig" }, UPSELL_RULES.burger),
    [],
  );
});
test("unknown configurable IDs are ignored", () => {
  UPSELL_RULES.burger.push("does-not-exist");
  try {
    assert.equal(getUpsellSuggestions({ pid: "b-orig" }).length, 4);
  } finally {
    UPSELL_RULES.burger.pop();
  }
});
