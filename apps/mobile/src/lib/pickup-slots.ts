import type { WeeklyHours } from '@/types/domain';

import { toMinutes, zonedNow } from './opening-hours';

export type PickupSlot = { dayOffset: number; minutes: number; label: string };

const pad = (n: number) => String(n).padStart(2, '0');
const label = (dayOffset: number, minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const time = `${pad(h)}:${pad(minutes % 60)}`;
  return dayOffset === 0 ? `Aujourd'hui ${time}` : dayOffset === 1 ? `Demain ${time}` : time;
};

/**
 * Créneaux de retrait programmables : alignés sur slotMinutes, au plus tôt
 * après le délai de préparation estimé, et uniquement pendant les horaires.
 * Le serveur revalidera le créneau (capacité réelle) à la commande.
 */
export function buildPickupSlots(
  hours: WeeklyHours,
  timeZone: string,
  now: Date,
  { slotMinutes, maxDaysAhead, leadMinutes, limit = 12 }: { slotMinutes: number; maxDaysAhead: number; leadMinutes: number; limit?: number },
): PickupSlot[] {
  const { day, minutes } = zonedNow(now, timeZone);
  const earliest = minutes + leadMinutes;
  const slots: PickupSlot[] = [];
  for (let offset = 0; offset <= maxDaysAhead && slots.length < limit; offset++) {
    const d = ((day + offset) % 7) as keyof WeeklyHours;
    const ranges = [...(hours[d] ?? [])].sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    for (const range of ranges) {
      const open = toMinutes(range.open);
      let close = toMinutes(range.close);
      if (close <= open) close += 24 * 60;
      let t = Math.ceil(open / slotMinutes) * slotMinutes;
      if (offset === 0) t = Math.max(t, Math.ceil(earliest / slotMinutes) * slotMinutes);
      // le dernier créneau laisse le temps de préparer avant la fermeture
      for (; t <= close - slotMinutes && slots.length < limit; t += slotMinutes) {
        slots.push({ dayOffset: offset + Math.floor(t / (24 * 60)), minutes: t % (24 * 60), label: label(offset + Math.floor(t / (24 * 60)), t % (24 * 60)) });
      }
    }
  }
  return slots;
}
