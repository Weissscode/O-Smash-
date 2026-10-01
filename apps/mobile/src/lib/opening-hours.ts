import type { TimeOfDay, WeeklyHours } from '@/types/domain';

export type OpenStatus =
  | { state: 'open'; closesAt: TimeOfDay; closingSoon: boolean }
  | { state: 'closed'; opensAt: { day: number; time: TimeOfDay } | null }
  | { state: 'paused' };

type ZonedNow = { day: number; minutes: number };

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export function toMinutes(time: TimeOfDay): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Jour et minute courants dans le fuseau du restaurant.
 * Si Intl ne gère pas le fuseau sur l'appareil, on retombe sur l'heure locale
 * (les clients sont en pratique dans le même fuseau que le restaurant).
 */
export function zonedNow(date: Date, timeZone: string): ZonedNow {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const minutes = Number(get('hour')) * 60 + Number(get('minute'));
    if (day >= 0 && Number.isFinite(minutes)) return { day, minutes };
  } catch {
    // fuseau non supporté : repli ci-dessous
  }
  return { day: date.getDay(), minutes: date.getHours() * 60 + date.getMinutes() };
}

/**
 * Statut d'ouverture. Gère les créneaux qui passent minuit (ex. 18:00-01:00) :
 * la partie après minuit est rattachée au jour d'ouverture.
 */
export function getOpenStatus(
  hours: WeeklyHours,
  timeZone: string,
  now: Date,
  options: { isPaused?: boolean; closingSoonMinutes?: number } = {},
): OpenStatus {
  if (options.isPaused) return { state: 'paused' };
  const closingSoonMinutes = options.closingSoonMinutes ?? 30;
  const { day, minutes } = zonedNow(now, timeZone);

  const check = (d: number, offset: number) => {
    for (const range of hours[d as keyof WeeklyHours] ?? []) {
      const open = toMinutes(range.open);
      let close = toMinutes(range.close);
      if (close <= open) close += 24 * 60;
      const t = minutes + offset;
      if (t >= open && t < close) {
        return { state: 'open' as const, closesAt: range.close, closingSoon: close - t <= closingSoonMinutes };
      }
    }
    return null;
  };

  const today = check(day, 0) ?? check((day + 6) % 7, 24 * 60);
  if (today) return today;

  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const ranges = [...(hours[d as keyof WeeklyHours] ?? [])].sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    for (const range of ranges) {
      if (i === 0 && toMinutes(range.open) <= minutes) continue;
      return { state: 'closed', opensAt: { day: d, time: range.open } };
    }
  }
  return { state: 'closed', opensAt: null };
}

export function formatTime(time: TimeOfDay): string {
  const [h, m] = time.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** Libellé court et humain du statut. */
export function describeOpenStatus(status: OpenStatus, now: Date, timeZone: string): string {
  switch (status.state) {
    case 'paused':
      return 'Commandes en pause';
    case 'open':
      return status.closingSoon ? `Ferme bientôt · ${formatTime(status.closesAt)}` : `Ouvert · jusqu'à ${formatTime(status.closesAt)}`;
    case 'closed': {
      if (!status.opensAt) return 'Fermé';
      const { day } = zonedNow(now, timeZone);
      const when =
        status.opensAt.day === day ? '' : status.opensAt.day === (day + 1) % 7 ? 'demain ' : `${DAY_NAMES[status.opensAt.day]} `;
      return `Fermé · ouvre ${when}à ${formatTime(status.opensAt.time)}`;
    }
  }
}
