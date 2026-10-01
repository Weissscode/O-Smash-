import fs from 'node:fs';
import path from 'node:path';

import { icons } from '@/components/ui/icon';
import { demoMenus } from '@/services/catalog/fixtures/demo-restaurants';
import { discoveryCategories } from '@/services/catalog/fixtures/discovery';
import { osmashMenu } from '@/services/catalog/fixtures/osmash';
import { createMockCatalogRepository } from '@/services/catalog/mock-repository';

const menus = [osmashMenu, ...demoMenus];

describe('intégrité du catalogue de démonstration', () => {
  it('identifiants uniques (produits, groupes par produit, options par groupe)', () => {
    const ids = menus.flatMap((m) => m.products.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of menus.flatMap((m) => m.products)) {
      const groupIds = p.modifierGroups.map((g) => g.id);
      expect(new Set(groupIds).size).toBe(groupIds.length);
      for (const g of p.modifierGroups) {
        const optionIds = g.options.map((o) => o.id);
        expect(new Set(optionIds).size).toBe(optionIds.length);
        expect(g.minSelect).toBeLessThanOrEqual(g.maxSelect);
        expect(g.maxSelect).toBeLessThanOrEqual(g.options.length);
      }
    }
  });

  it('chaque produit appartient à une catégorie de son restaurant', () => {
    for (const m of menus) {
      const cats = new Set(m.categories.map((c) => c.id));
      for (const p of m.products) {
        expect(p.restaurantId).toBe(m.restaurant.id);
        expect(cats.has(p.categoryId)).toBe(true);
      }
    }
  });

  it('les options de formule renvoient vers des produits existants', () => {
    const ids = new Set(osmashMenu.products.map((p) => p.id));
    const refs = osmashMenu.products.flatMap((p) => p.modifierGroups.flatMap((g) => g.options.map((o) => o.productRef).filter(Boolean)));
    for (const ref of refs) expect(ids.has(ref as string)).toBe(true);
  });

  it('les PID O’SMASH (externalRef) existent bien dans le catalogue de la caisse', () => {
    // Garantit qu'on conserve les identifiants historiques (stock, tickets, stats).
    const posCatalog = fs.readFileSync(path.resolve(__dirname, '../../../../src/data/products.js'), 'utf8');
    const posIds = new Set([...posCatalog.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]));
    const refs = osmashMenu.products.map((p) => p.externalRef).filter((r): r is string => !!r);
    expect(refs.length).toBeGreaterThan(10);
    for (const ref of refs) expect(posIds.has(ref)).toBe(true);
  });

  it('aucun restaurant de démonstration ne se fait passer pour un vrai', () => {
    for (const m of demoMenus) {
      expect(m.restaurant.isDemo).toBe(true);
      expect(m.restaurant.name).toMatch(/\(démo\)/);
    }
  });

  it('les icônes Material référencées existent (Android / web)', () => {
    const symbols = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../node_modules/expo-symbols/build/android/symbols.json'), 'utf8')) as Record<string, number>;
    const names = [...Object.values(icons).map((i) => i.material), ...discoveryCategories.map((c) => c.icon.material)];
    for (const n of names) expect(symbols[n]).toBeDefined();
  });
});

describe('repository de démonstration', () => {
  const repo = createMockCatalogRepository();

  it('renvoie une erreur "not_found" explicite pour un slug inconnu', async () => {
    await expect(repo.getRestaurantMenu('inconnu')).rejects.toMatchObject({ kind: 'not_found' });
  });

  it('retrouve un produit et son restaurant', async () => {
    const { product, restaurant } = await repo.getProduct('p_r_riz');
    expect(product.externalRef).toBe('r-riz');
    expect(restaurant.slug).toBe('osmash');
  });
});
