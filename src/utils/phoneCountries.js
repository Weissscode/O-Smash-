// Selection volontairement restreinte aux pays les plus frequents pour
// un snack proche de la zone des 3 Frontieres (France/Suisse/Allemagne),
// plus quelques voisins europeens courants. "Autre" reste disponible
// pour un indicatif libre.
export const PHONE_COUNTRIES = [
  { code: 'FR', dial: '+33', flag: '🇫🇷', label: 'France' },
  { code: 'CH', dial: '+41', flag: '🇨🇭', label: 'Suisse' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', label: 'Allemagne' },
  { code: 'BE', dial: '+32', flag: '🇧🇪', label: 'Belgique' },
  { code: 'LU', dial: '+352', flag: '🇱🇺', label: 'Luxembourg' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', label: 'Italie' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', label: 'Espagne' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', label: 'Royaume-Uni' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', label: 'Portugal' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', label: 'Maroc' },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', label: 'Algérie' },
  { code: 'TR', dial: '+90', flag: '🇹🇷', label: 'Turquie' }
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0]; // France

// Combine indicatif + numero saisi en E.164 (ex: +33 06 12 34 56 78 -> +33612345678).
// Normalisation simple (retire les zeros/espaces/points de tete) - pas
// une validation complete par pays, suffisant pour eviter les doublons
// et les erreurs de prefixe les plus courantes.
export function toE164(dial, rawNumber) {
  const digits = (rawNumber || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return null;
  return `${dial}${digits}`;
}
