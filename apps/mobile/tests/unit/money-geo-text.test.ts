import { distanceKm, formatDistance } from '@/lib/geo';
import { eurosToCents, formatPrice, formatPriceDelta } from '@/lib/money';
import { normalizeSearch } from '@/lib/text';

describe('formatPrice', () => {
  it('formate en euros avec virgule et espace insécable', () => {
    expect(formatPrice(650)).toBe('6,50 €');
    expect(formatPrice(5)).toBe('0,05 €');
    expect(formatPrice(123456)).toBe('1 234,56 €');
    expect(formatPrice(-250)).toBe('-2,50 €');
  });
  it('affiche les suppléments avec un +, rien si gratuit', () => {
    expect(formatPriceDelta(100)).toBe('+1,00 €');
    expect(formatPriceDelta(0)).toBe('');
  });
  it("convertit les prix caisse (euros flottants) sans erreur d'arrondi", () => {
    expect(eurosToCents(9.9)).toBe(990);
    expect(eurosToCents(16.9)).toBe(1690);
    expect(eurosToCents(0.1 + 0.2)).toBe(30);
  });
});

describe('distance', () => {
  it('calcule une distance réaliste (Longwy → Mont-Saint-Martin ≈ 3 km)', () => {
    const d = distanceKm({ latitude: 49.5197, longitude: 5.7614 }, { latitude: 49.5409, longitude: 5.7795 });
    expect(d).toBeGreaterThan(2.3);
    expect(d).toBeLessThan(3.2);
  });
  it('vaut 0 pour un même point', () => {
    expect(distanceKm({ latitude: 48.85, longitude: 2.35 }, { latitude: 48.85, longitude: 2.35 })).toBe(0);
  });
  it('formate en mètres puis kilomètres', () => {
    expect(formatDistance(0.42)).toBe('400 m');
    expect(formatDistance(0.01)).toBe('50 m');
    expect(formatDistance(3.26)).toBe('3,3 km');
    expect(formatDistance(14.8)).toBe('15 km');
  });
});

describe('normalizeSearch', () => {
  it('ignore accents, casse, apostrophes et espaces multiples', () => {
    expect(normalizeSearch("  O’Smash   Spécial ")).toBe('osmash special');
  });
});
