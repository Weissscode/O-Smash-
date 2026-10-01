import type { Cents } from '@/types/domain';

const NBSP = ' ';

/** 650 -> "6,50 €". Formatage déterministe (indépendant du support Intl de Hermes). */
export function formatPrice(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  const grouped = String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${grouped},${rest}${NBSP}€`;
}

/** Variante "+1,00 €" pour les suppléments ; chaîne vide si gratuit. */
export function formatPriceDelta(cents: Cents): string {
  if (cents === 0) return '';
  return cents > 0 ? `+${formatPrice(cents)}` : formatPrice(cents);
}

/** Conversion euros (format caisse historique, flottant) -> centimes. */
export function eurosToCents(euros: number): Cents {
  return Math.round(euros * 100);
}
