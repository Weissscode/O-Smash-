import { computeUnitPrice, describeGroupRule, initialSelections, summarizeSelections, toggleOption, validateSelections } from '@/features/product/selection';
import { osmashMenu } from '@/services/catalog/fixtures/osmash';
import type { Product } from '@/types/domain';

const find = (id: string): Product => {
  const p = osmashMenu.products.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};

describe('personnalisation produit', () => {
  const menuEtudiant = find('p_f_etud');
  const spicy = find('p_b_spicy');
  const original = find('p_b_orig');

  it('pré-sélectionne les options par défaut (version bœuf)', () => {
    expect(initialSelections(spicy).grp_version).toEqual(['ver_boeuf']);
  });

  it('bloque la validation tant que les choix obligatoires manquent', () => {
    const errors = validateSelections(menuEtudiant, initialSelections(menuEtudiant));
    expect(errors.map((e) => e.groupId)).toEqual(['grp_etud_main', 'grp_drink']);
    expect(errors[0].message).toBe('Choix obligatoire');
  });

  it('valide une fois les choix faits', () => {
    let s = initialSelections(menuEtudiant);
    s = toggleOption(s, menuEtudiant.modifierGroups[0], 'etud_riz');
    s = toggleOption(s, menuEtudiant.modifierGroups[1], 'cdr_coca');
    expect(validateSelections(menuEtudiant, s)).toEqual([]);
  });

  it('choix unique : sélectionner une autre option remplace la précédente', () => {
    const group = menuEtudiant.modifierGroups[0];
    let s = toggleOption({}, group, 'etud_orig');
    s = toggleOption(s, group, 'etud_wrap');
    expect(s[group.id]).toEqual(['etud_wrap']);
  });

  it('choix multiple : respecte le maximum', () => {
    const sauces = original.modifierGroups.find((g) => g.kind === 'sauce')!;
    let s = toggleOption({}, sauces, 'sauce_biggy');
    s = toggleOption(s, sauces, 'sauce_bbq');
    s = toggleOption(s, sauces, 'sauce_ketchup');
    expect(s[sauces.id]).toEqual(['sauce_biggy', 'sauce_bbq']);
  });

  it("refuse une option épuisée", () => {
    const supps = original.modifierGroups.find((g) => g.kind === 'supplement')!;
    expect(toggleOption({}, supps, 'sup_halloumi')).toEqual({});
  });

  it('exige 2 choix pour le Duo', () => {
    const duo = find('p_f_duo_g');
    const g = duo.modifierGroups[0];
    const s = toggleOption({ grp_drink: ['cdr_eau'] }, g, 'duo_orig');
    expect(validateSelections(duo, s)[0]).toMatchObject({ groupId: g.id, message: 'Choisis au moins 2 options' });
    expect(describeGroupRule(g)).toBe('Obligatoire · 2 choix');
  });

  it('calcule le prix en temps réel avec les suppléments', () => {
    const supps = original.modifierGroups.find((g) => g.kind === 'supplement')!;
    let s = toggleOption({}, supps, 'sup_bacon'); // +1,00
    s = toggleOption(s, supps, 'sup_steak'); // +2,50
    expect(computeUnitPrice(original, s)).toBe(650 + 100 + 250);
  });

  it("ignore le prix d'une option devenue indisponible", () => {
    expect(computeUnitPrice(original, { grp_burger_supps: ['sup_halloumi'] })).toBe(650);
  });

  it('résume les choix lisiblement', () => {
    const s = { grp_burger_removals: ['rm_oignon'], grp_burger_supps: ['sup_bacon'], grp_sauces_2: ['sauce_biggy'] };
    expect(summarizeSelections(original, s)).toEqual(['Sans oignon', 'Supp. Bacon', 'Sauces : Biggy']);
  });
});
