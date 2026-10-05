// Jeton d'authentification propre a chaque carte Wallet.
//
// Apple renvoie ce jeton (en-tete "Authorization: ApplePass <jeton>") a
// chaque appel du service. On le DERIVE du numero de serie avec un secret
// serveur (HMAC-SHA256) : rien a stocker, et impossible a deviner sans
// posseder la carte (le numero de serie est lui-meme un UUID aleatoire).

const crypto = require('node:crypto');

function authTokenFor(serial, secret = process.env.WALLET_AUTH_SECRET) {
  if (!secret || !serial) return null;
  return crypto.createHmac('sha256', secret).update(String(serial)).digest('hex');
}

function isAuthorized(authorizationHeader, serial, secret = process.env.WALLET_AUTH_SECRET) {
  const expected = authTokenFor(serial, secret);
  if (!expected) return false;
  const match = /^ApplePass\s+(\S+)\s*$/.exec(authorizationHeader || '');
  if (!match) return false;
  const given = Buffer.from(match[1]);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted);
}

module.exports = { authTokenFor, isAuthorized };
