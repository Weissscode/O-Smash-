import { describeOpenStatus, getOpenStatus } from '@/lib/opening-hours';
import type { WeeklyHours } from '@/types/domain';

const TZ = 'Europe/Paris';
const lunchAndLate: WeeklyHours = {
  0: [],
  1: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  2: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  3: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  4: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
  5: [{ open: '18:00', close: '01:30' }],
  6: [],
};
// 2026-10-01 est un jeudi.
const at = (iso: string) => new Date(iso);

describe('getOpenStatus', () => {
  it('ouvert pendant un créneau', () => {
    const s = getOpenStatus(lunchAndLate, TZ, at('2026-10-01T12:00:00+02:00'));
    expect(s).toEqual({ state: 'open', closesAt: '14:30', closingSoon: false });
  });

  it('signale la fermeture imminente (30 min)', () => {
    const s = getOpenStatus(lunchAndLate, TZ, at('2026-10-01T14:10:00+02:00'));
    expect(s).toMatchObject({ state: 'open', closingSoon: true });
  });

  it('fermé entre deux services, avec la prochaine ouverture du jour', () => {
    const s = getOpenStatus(lunchAndLate, TZ, at('2026-10-01T15:00:00+02:00'));
    expect(s).toEqual({ state: 'closed', opensAt: { day: 4, time: '18:00' } });
    expect(describeOpenStatus(s, at('2026-10-01T15:00:00+02:00'), TZ)).toBe('Fermé · ouvre à 18h');
  });

  it("gère les créneaux qui passent minuit (vendredi 18:00 → samedi 01:30)", () => {
    const s = getOpenStatus(lunchAndLate, TZ, at('2026-10-03T00:45:00+02:00'));
    expect(s).toMatchObject({ state: 'open', closesAt: '01:30' });
  });

  it('trouve la prochaine ouverture sur un autre jour', () => {
    const now = at('2026-10-04T12:00:00+02:00'); // dimanche
    const s = getOpenStatus(lunchAndLate, TZ, now);
    expect(s).toEqual({ state: 'closed', opensAt: { day: 1, time: '11:30' } });
    expect(describeOpenStatus(s, now, TZ)).toBe('Fermé · ouvre demain à 11h30');
  });

  it('la pause manuelle du restaurateur prime sur les horaires', () => {
    const s = getOpenStatus(lunchAndLate, TZ, at('2026-10-01T12:00:00+02:00'), { isPaused: true });
    expect(s).toEqual({ state: 'paused' });
  });

  it('jamais ouvert → fermé sans date', () => {
    const never = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] } as WeeklyHours;
    expect(getOpenStatus(never, TZ, at('2026-10-01T12:00:00+02:00'))).toEqual({ state: 'closed', opensAt: null });
  });

  it('utilise le fuseau du restaurant, pas celui de l’appareil', () => {
    // 10:00 UTC = 12:00 à Paris (ouvert) ; 06:00 à New York.
    const s = getOpenStatus(lunchAndLate, TZ, new Date('2026-10-01T10:00:00Z'));
    expect(s.state).toBe('open');
  });
});
