export function isPhoneNumber(str) {
  if (!str) return false;
  var d = str.replace(/[^0-9]/g, '');
  return d.length >= 3;
}
