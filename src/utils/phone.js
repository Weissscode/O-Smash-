export function isPhoneNumber(str) {
  if (!str) return false;
  var d = str.replace(/[^0-9]/g, '');
  return d.length >= 3;
}

// Indicatifs internationaux connus, du plus long au plus court pour un
// matching correct (352 doit etre teste avant 33/32 par exemple).
const COUNTRY_CODES = ['352', '33', '32', '41', '49', '39', '34', '44', '1'].sort((a, b) => b.length - a.length);

// Formatage purement visuel : groupe les chiffres par 2, sans jamais
// decouper l'indicatif international (+33, +32, +352...). La valeur
// brute stockee en base ne doit jamais passer par cette fonction.
export function formatPhoneDisplay(raw) {
  if (!raw) return raw;
  const isIntl = raw.trim().startsWith('+');
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return raw;
  if (isIntl) {
    const code = COUNTRY_CODES.find(c => digits.startsWith(c));
    const ccLen = code ? code.length : 2;
    const cc = digits.slice(0, ccLen);
    const rest = digits.slice(ccLen);
    const groups = rest.match(/.{1,2}/g) || [];
    return '+' + cc + (groups.length ? '-' + groups.join('-') : '');
  }
  const groups = digits.match(/.{1,2}/g) || [];
  return groups.join('-');
}
