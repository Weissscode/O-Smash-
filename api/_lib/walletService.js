// Logique des endpoints PassKit Web Service + notification, sans HTTP :
// les fonctions recoivent une requete simplifiee et renvoient
// { status, json?, buffer?, headers? }. Les fichiers api/ ne font que
// l'adaptation Vercel (lecture de la requete, ecriture de la reponse).
//
// Specification Apple (Wallet Passes > Updating a Pass) :
//   POST   /v1/devices/:device/registrations/:passType/:serial   enregistre l'appareil
//   DELETE /v1/devices/:device/registrations/:passType/:serial   le desenregistre
//   GET    /v1/devices/:device/registrations/:passType?passesUpdatedSince=TAG
//   GET    /v1/passes/:passType/:serial                          derniere version de la carte
//   POST   /v1/log                                               erreurs remontees par l'iPhone

const { isAuthorized } = require('./walletAuth');
const { isDeadToken } = require('./apns');

const json = (status, body) => ({ status, json: body });
const empty = status => ({ status });

// deps : { store, buildPass(card, rewards) -> Buffer, secret, passTypeId, log }
async function handleWalletRequest({ method, segments, query = {}, headers = {}, body }, deps) {
  const { store, buildPass, secret, passTypeId, log = () => {} } = deps;
  const auth = headers.authorization || headers.Authorization;
  const [version, kind] = segments;
  if (version !== 'v1') return empty(404);

  // POST /v1/log
  if (kind === 'log' && segments.length === 2) {
    if (method !== 'POST') return empty(405);
    const logs = body && Array.isArray(body.logs) ? body.logs : [];
    logs.forEach(line => log('[Apple Wallet]', line));
    return empty(200);
  }

  // /v1/devices/:device/registrations/:passType[/:serial]
  if (kind === 'devices' && segments[3] === 'registrations') {
    const [, , deviceId, , requestedType, serial] = segments;
    if (requestedType !== passTypeId) return empty(404);

    if (segments.length === 5) {
      if (method !== 'GET') return empty(405);
      const sinceMs = query.passesUpdatedSince !== undefined && query.passesUpdatedSince !== ''
        ? Number(query.passesUpdatedSince)
        : null;
      const updated = await store.listUpdatedSerials({
        deviceId, passTypeId, sinceMs: Number.isFinite(sinceMs) ? sinceMs : null
      });
      if (!updated.length) return empty(204);
      // +1 ms : l'etiquette doit etre STRICTEMENT superieure a l'horodatage
      // le plus recent, sinon la meme carte serait re-listee en boucle.
      const lastUpdated = String(Math.max(...updated.map(u => u.updatedMs)) + 1);
      return json(200, { serialNumbers: updated.map(u => u.serial), lastUpdated });
    }

    if (segments.length === 6) {
      if (!isAuthorized(auth, serial, secret)) return empty(401);
      if (method === 'POST') {
        const pushToken = body && body.pushToken;
        if (!pushToken || typeof pushToken !== 'string') return empty(400);
        const card = await store.getCardBySerial(serial);
        if (!card) return empty(404);
        const outcome = await store.upsertRegistration({ deviceId, passTypeId, serial, pushToken });
        return empty(outcome === 'created' ? 201 : 200);
      }
      if (method === 'DELETE') {
        await store.deleteRegistration({ deviceId, passTypeId, serial });
        return empty(200);
      }
      return empty(405);
    }
    return empty(404);
  }

  // GET /v1/passes/:passType/:serial
  if (kind === 'passes' && segments.length === 4) {
    if (method !== 'GET') return empty(405);
    const [, , requestedType, serial] = segments;
    if (requestedType !== passTypeId) return empty(404);
    if (!isAuthorized(auth, serial, secret)) return empty(401);

    const card = await store.getCardBySerial(serial, { withTimestamp: true });
    if (!card || card.status !== 'active') return empty(404);
    const rewards = await store.getActiveRewards(card.restaurantId);
    const buffer = await buildPass(card, rewards);
    // Pas de gestion du 304 (If-Modified-Since, precision a la seconde) :
    // une mise a jour dans la meme seconde que la derniere lecture serait
    // ratee. Renvoyer la carte a chaque demande est sans risque.
    return {
      status: 200,
      buffer,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Last-Modified': new Date(card.updatedMs).toUTCString()
      }
    };
  }

  return empty(404);
}

// Previent les iPhone qui detiennent une carte de ce client.
// deps : { store, sendPushes(tokens) -> [{token,status,reason}], log }
async function notifyCustomerWallets(customerId, deps) {
  const { store, sendPushes, log = () => {} } = deps;
  const registrations = await store.getRegistrationsForCustomer(customerId);
  const tokens = [...new Set(registrations.map(r => r.pushToken))];
  if (!tokens.length) return { devices: 0, sent: 0, removed: 0, failed: 0 };

  const results = await sendPushes(tokens);
  const dead = results.filter(isDeadToken).map(r => r.token);
  if (dead.length) await store.deleteRegistrationsByTokens(dead);

  const sent = results.filter(r => r.status === 200).length;
  const failed = results.filter(r => r.status !== 200 && !isDeadToken(r));
  failed.forEach(r => log('[Apple Wallet] push refusé', r.status, r.reason));
  return { devices: tokens.length, sent, removed: dead.length, failed: failed.length };
}

module.exports = { handleWalletRequest, notifyCustomerWallets };
