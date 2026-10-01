import type { Cents, ModifierGroup, Product, Selections } from '@/types/domain';

/**
 * Logique de personnalisation d'un produit, indépendante de l'UI.
 * Le serveur refera exactement ces contrôles (phase 5) : le client ne fait
 * que guider l'utilisateur, il n'est jamais la source de vérité du prix.
 */

export function initialSelections(product: Product): Selections {
  const selections: Selections = {};
  for (const group of product.modifierGroups) {
    selections[group.id] = group.options.filter((o) => o.isDefault && o.isAvailable).map((o) => o.id);
  }
  return selections;
}

/** Bascule une option en respectant maxSelect (remplacement si choix unique). */
export function toggleOption(selections: Selections, group: ModifierGroup, optionId: string): Selections {
  const option = group.options.find((o) => o.id === optionId);
  if (!option || !option.isAvailable) return selections;
  const current = selections[group.id] ?? [];
  let next: string[];
  if (current.includes(optionId)) {
    next = current.filter((id) => id !== optionId);
  } else if (group.maxSelect === 1) {
    next = [optionId];
  } else if (current.length >= group.maxSelect) {
    return selections;
  } else {
    next = [...current, optionId];
  }
  return { ...selections, [group.id]: next };
}

export type GroupValidation = { groupId: string; message: string };

export function validateSelections(product: Product, selections: Selections): GroupValidation[] {
  const errors: GroupValidation[] = [];
  for (const group of product.modifierGroups) {
    const chosen = (selections[group.id] ?? []).filter((id) => group.options.some((o) => o.id === id && o.isAvailable));
    if (chosen.length < group.minSelect) {
      errors.push({
        groupId: group.id,
        message: group.minSelect === 1 ? 'Choix obligatoire' : `Choisis au moins ${group.minSelect} options`,
      });
    } else if (chosen.length > group.maxSelect) {
      errors.push({ groupId: group.id, message: `${group.maxSelect} choix maximum` });
    }
  }
  return errors;
}

export function computeUnitPrice(product: Product, selections: Selections): Cents {
  let price = product.basePrice;
  for (const group of product.modifierGroups) {
    for (const id of selections[group.id] ?? []) {
      const option = group.options.find((o) => o.id === id);
      if (option?.isAvailable) price += option.priceDelta;
    }
  }
  return price;
}

/** Lignes de résumé lisibles, dans l'ordre des groupes (ex. "Sans oignon", "Supp. Bacon"). */
export function summarizeSelections(product: Product, selections: Selections): string[] {
  const lines: string[] = [];
  for (const group of product.modifierGroups) {
    const names = (selections[group.id] ?? [])
      .map((id) => group.options.find((o) => o.id === id)?.name)
      .filter((n): n is string => !!n);
    if (names.length === 0) continue;
    lines.push(group.kind === 'removal' || group.kind === 'supplement' ? names.join(', ') : `${group.name} : ${names.join(', ')}`);
  }
  return lines;
}

export function describeGroupRule(group: ModifierGroup): string {
  if (group.minSelect === 0) return group.maxSelect === 1 ? 'Facultatif' : `Facultatif · ${group.maxSelect} max`;
  if (group.minSelect === group.maxSelect) return group.minSelect === 1 ? 'Obligatoire' : `Obligatoire · ${group.minSelect} choix`;
  return `Obligatoire · ${group.minSelect} à ${group.maxSelect}`;
}
