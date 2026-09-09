import test from "node:test";
import assert from "node:assert/strict";
import {
  CB,
  FRITES_SAUCES,
  TWISTER_SUPPS,
  FRITES_SUPPS,
  LOADED_RETRAITS,
  LOADED_SUPPS,
} from "../src/data/products.js";
import {
  optionImage,
  compositionProductImage,
} from "../src/data/kioskCompositionImages.js";

test("every ingredient and sauce has a centralized photography slot", () => {
  for (const option of [
    ...CB.sauces,
    ...CB.retraits,
    ...CB.supps,
    ...FRITES_SAUCES,
    ...TWISTER_SUPPS,
    ...FRITES_SUPPS,
    ...LOADED_RETRAITS,
    ...LOADED_SUPPS,
  ]) {
    const label = typeof option === "string" ? option : option.l;
    assert.ok(optionImage(label)?.startsWith("/products/"), label);
  }
});
test("equivalent ingredient labels share a photo, sauce Chicken stays distinct", () => {
  assert.equal(optionImage("Algérienne"), optionImage("Algerienne"));
  assert.equal(optionImage("Sans fromage"), optionImage("Supp. Cheddar"));
  assert.equal(
    optionImage("Oignons frits"),
    optionImage("Supp. Oignon Crispy"),
  );
  assert.equal(
    optionImage("Sans chicken"),
    optionImage("Supp. Crispy Chicken"),
  );
  assert.notEqual(optionImage("Chicken"), optionImage("Supp. Chicken"));
});
test("existing product photographs remain preferred over future files", () => {
  assert.equal(
    compositionProductImage("b-orig"),
    "/burger_classic_pickles_bacon.png",
  );
  assert.equal(compositionProductImage("lo-cana"), "/onion_rings_twister.png");
  assert.equal(compositionProductImage("dr-coca"), "/products/dr-coca.jpg");
});
