import type { EtaSettings } from '@/types/domain';

/**
 * Moteur d'estimation du délai — V1 volontairement simple et EXPLICABLE.
 *
 *   délai = base
 *         + ajustement manuel du restaurateur
 *         + vagues d'attente  (ceil(commandes actives / capacité) × min par vague)
 *         + articles en plus  (max(0, articles − 2) × min par article)
 *         + complexité        (somme des minutes propres aux produits)
 *
 * Résultat arrondi aux 5 minutes, affiché en fourchette [d, d+5].
 * Tous les coefficients viennent des réglages du restaurant (pas de constante
 * métier codée en dur). Le détail (breakdown) est renvoyé pour pouvoir
 * l'afficher, le journaliser et, plus tard, calibrer à partir de l'historique
 * réel : il suffira de remplacer cette fonction sans toucher aux écrans.
 */
export type EtaInput = {
  settings: EtaSettings;
  activeOrders: number;
  itemCount?: number;
  complexityMinutes?: number;
};

export type EtaResult = {
  minutes: number;
  range: [number, number];
  breakdown: { base: number; manual: number; queue: number; items: number; complexity: number };
};

const roundTo5 = (n: number) => Math.max(5, Math.ceil(n / 5) * 5);

export function estimatePrepTime({ settings, activeOrders, itemCount = 1, complexityMinutes = 0 }: EtaInput): EtaResult {
  const capacity = Math.max(1, settings.parallelCapacity);
  const queuedBatches = Math.ceil(Math.max(0, activeOrders) / capacity);
  const breakdown = {
    base: Math.max(0, settings.basePrepMinutes),
    manual: Math.max(0, settings.loadAdjustMinutes),
    queue: queuedBatches * Math.max(0, settings.minutesPerQueuedBatch),
    items: Math.max(0, itemCount - 2) * Math.max(0, settings.minutesPerExtraItem),
    complexity: Math.max(0, complexityMinutes),
  };
  const raw = breakdown.base + breakdown.manual + breakdown.queue + breakdown.items + breakdown.complexity;
  const minutes = roundTo5(raw);
  return { minutes, range: [minutes, minutes + 5], breakdown };
}

export function formatEtaRange([min, max]: [number, number]): string {
  return `${min}–${max} min`;
}
