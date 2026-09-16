import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';

// Convertit un code pays ISO (ex: "FR") en emoji drapeau, sans image ni
// librairie dediee - chaque lettre devient son "regional indicator symbol"
// Unicode, que les systemes affichent comme un drapeau.
function flagEmoji(countryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const countryNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['fr'], { type: 'region' })
  : null;

function buildCountry(code) {
  return {
    code,
    dial: `+${getCountryCallingCode(code)}`,
    flag: flagEmoji(code),
    label: (countryNames && countryNames.of(code)) || code
  };
}

// Pays les plus frequents en premier dans le selecteur (zone 3
// Frontieres : beaucoup de clients suisses/allemands/belges).
const PRIORITY_CODES = ['FR', 'CH', 'DE', 'BE', 'LU', 'IT', 'ES', 'GB'];

export const PRIORITY_PHONE_COUNTRIES = PRIORITY_CODES.map(buildCountry);

// Tous les pays connus par libphonenumber-js, tries alphabetiquement -
// affiches sous les "frequents" dans le selecteur.
export const ALL_PHONE_COUNTRIES = getCountries()
  .map(buildCountry)
  .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

export const DEFAULT_PHONE_COUNTRY = PRIORITY_PHONE_COUNTRIES[0]; // France

// Combine indicatif + numero saisi en E.164. Utilise libphonenumber-js
// pour parser/valider correctement selon le pays choisi (bien plus
// fiable qu'un simple retrait des zeros de tete) ; si le numero ne
// parse pas proprement, on retombe sur une concatenation simple plutot
// que de bloquer l'inscription pour un format inhabituel.
export function toE164(dial, rawNumber, countryCode) {
  const trimmed = (rawNumber || '').trim();
  if (!trimmed) return null;

  if (countryCode) {
    const parsed = parsePhoneNumberFromString(trimmed, countryCode);
    if (parsed && parsed.isValid()) return parsed.number;
  }

  const digits = trimmed.replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return null;
  return `${dial}${digits}`;
}
