import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { kioskCatalogue, CATEGORY_IMAGES, BAO } from '../src/data/kioskCatalogue.js';
import { BURGERS, SIDES, LOADED, FORMULES } from '../src/data/products.js';

test('Petite faim preserves each source ID, price and configuration route', () => {
  const items = kioskCatalogue().products.petite;
  assert.equal(items.length, SIDES.length);
  assert.equal(new Set(items.map(p => p.id)).size, items.length);
  for (const product of SIDES) {
    const item = items.find(p => p.id === product.id);
    assert.equal(item.price, product.price);
    assert.equal(item.sourceCategory, 'sides');
  }
});

test('BAO comes from the shared catalogue and menu Avocado uses the new price', async () => {
  const current = await import('../src/data/products.js');
  assert.equal(BAO, current.BAO);
  assert.equal(kioskCatalogue().products.menus.find(p => p.id === 'b-avoc').price, 13.5);
});
test('Menus reuse existing burger IDs and the current menu surcharge', () => {
  const menus = kioskCatalogue().products.menus;
  for (const base of [...BURGERS, ...BAO]) {
    const menu = menus.find(p => p.id === base.id);
    assert.equal(menu.menuProduct, base);
    assert.equal(menu.price, base.price + 3);
  }
  for (const offer of FORMULES) assert.equal(menus.find(p => p.id === offer.id).price, offer.price);
});
test('All seven requested category photographs exist in the imported assets', () => {
  assert.equal(Object.keys(CATEGORY_IMAGES).length, 7);
  for (const file of Object.values(CATEGORY_IMAGES)) assert.ok(existsSync(new URL('../public/' + file, import.meta.url)), file);
});
