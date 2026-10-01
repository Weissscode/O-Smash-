import { estimatePrepTime, formatEtaRange } from '@/lib/eta';
import { buildPickupSlots } from '@/lib/pickup-slots';
import type { EtaSettings, WeeklyHours } from '@/types/domain';

const settings: EtaSettings = { basePrepMinutes: 10, loadAdjustMinutes: 0, parallelCapacity: 3, minutesPerQueuedBatch: 4, minutesPerExtraItem: 1 };

describe('estimatePrepTime', () => {
  it('restaurant vide, commande simple : délai de base arrondi', () => {
    const r = estimatePrepTime({ settings, activeOrders: 0 });
    expect(r.minutes).toBe(10);
    expect(r.range).toEqual([10, 15]);
  });

  it('additionne file d’attente, articles, complexité et ajustement manuel', () => {
    const r = estimatePrepTime({ settings: { ...settings, loadAdjustMinutes: 5 }, activeOrders: 7, itemCount: 5, complexityMinutes: 2 });
    // 10 base + 5 manuel + ceil(7/3)=3 vagues × 4 = 12 + (5-2)×1 = 3 + 2 = 32 → 35
    expect(r.breakdown).toEqual({ base: 10, manual: 5, queue: 12, items: 3, complexity: 2 });
    expect(r.minutes).toBe(35);
    expect(formatEtaRange(r.range)).toBe('35–40 min');
  });

  it('ne casse pas avec des réglages incohérents (capacité 0, valeurs négatives)', () => {
    const r = estimatePrepTime({ settings: { ...settings, parallelCapacity: 0, basePrepMinutes: -3 }, activeOrders: -2 });
    expect(r.minutes).toBe(5);
  });

  it('plus de commandes actives ⇒ délai jamais plus court', () => {
    const values = [0, 1, 3, 4, 9, 20].map((n) => estimatePrepTime({ settings, activeOrders: n }).minutes);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

describe('buildPickupSlots', () => {
  const hours: WeeklyHours = { 0: [], 1: [], 2: [], 3: [], 4: [{ open: '18:00', close: '20:00' }], 5: [{ open: '11:30', close: '13:00' }], 6: [] };
  const opts = { slotMinutes: 15, maxDaysAhead: 1, leadMinutes: 20 };

  it('propose des créneaux alignés après le délai de préparation', () => {
    const slots = buildPickupSlots(hours, 'Europe/Paris', new Date('2026-10-01T18:10:00+02:00'), opts);
    expect(slots[0].label).toBe("Aujourd'hui 18:30");
    // dernier créneau du jour : 19:45 (laisse un créneau avant la fermeture)
    expect(slots.filter((s) => s.dayOffset === 0).at(-1)?.label).toBe("Aujourd'hui 19:45");
  });

  it('bascule sur le lendemain quand le jour est terminé', () => {
    const slots = buildPickupSlots(hours, 'Europe/Paris', new Date('2026-10-01T21:00:00+02:00'), opts);
    expect(slots[0].label).toBe('Demain 11:30');
    expect(slots.every((s) => s.dayOffset === 1)).toBe(true);
  });

  it('respecte la limite', () => {
    expect(buildPickupSlots(hours, 'Europe/Paris', new Date('2026-10-01T17:00:00+02:00'), { ...opts, limit: 3 })).toHaveLength(3);
  });
});
