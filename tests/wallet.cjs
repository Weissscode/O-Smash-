// Tests de la mise a jour automatique des cartes Apple Wallet.
// Aucun acces reseau, aucune base, aucun identifiant reel : base en memoire,
// serveur APNs factice en local, certificats jetables generes a la volee.
//   npm run test:wallet
const assert = require('node:assert/strict');
const http2 = require('node:http2');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { authTokenFor, isAuthorized } = require('../api/_lib/walletAuth');
const { rewardProgress, buildFields, createPass, webServiceFor } = require('../api/_lib/walletPass');
const { handleWalletRequest, notifyCustomerWallets } = require('../api/_lib/walletService');
const { sendWalletPushes, isDeadToken } = require('../api/_lib/apns');

const SECRET = 'secret-de-test-0123456789abcdef0123456789';
const TYPE = 'pass.fr.osmash54.fidelite';
const SERIAL = 'OSM-11111111-2222-3333-4444-555555555555';
const OTHER = 'OSM-99999999-2222-3333-4444-555555555555';
const authFor = serial => `ApplePass ${authTokenFor(serial, SECRET)}`;

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log('  ok   ' + name);
  } catch (error) {
    console.error('  FAIL ' + name + '\n', error);
    process.exitCode = 1;
  }
}

// ---- base en memoire, meme interface que walletStore -----------------
function memoryStore({ cards, rewards = [] }) {
  const registrations = [];
  return {
    registrations,
    async getCardBySerial(serial) { return cards[serial] || null; },
    async getActiveRewards() { return rewards; },
    async upsertRegistration({ deviceId, passTypeId, serial, pushToken }) {
      const found = registrations.find(r => r.deviceId === deviceId && r.serial === serial);
      if (found) { found.pushToken = pushToken; return 'updated'; }
      registrations.push({ deviceId, passTypeId, serial, pushToken });
      return 'created';
    },
    async deleteRegistration({ deviceId, serial }) {
      const at = registrations.findIndex(r => r.deviceId === deviceId && r.serial === serial);
      if (at >= 0) registrations.splice(at, 1);
    },
    async listUpdatedSerials({ deviceId, sinceMs }) {
      return registrations
        .filter(r => r.deviceId === deviceId)
        .map(r => ({ serial: r.serial, updatedMs: cards[r.serial].updatedMs }))
        .filter(c => sinceMs == null || c.updatedMs > sinceMs);
    },
    async getRegistrationsForCustomer(customerId) {
      return registrations
        .filter(r => cards[r.serial].customer.id === customerId)
        .map(r => ({ pushToken: r.pushToken, serial: r.serial }));
    },
    async deleteRegistrationsByTokens(tokens) {
      for (let i = registrations.length - 1; i >= 0; i -= 1) {
        if (tokens.includes(registrations[i].pushToken)) registrations.splice(i, 1);
      }
    }
  };
}

const card = (extra = {}) => ({
  serial: SERIAL, restaurantId: 'r1', status: 'active', updatedMs: 1_700_000_000_000,
  customer: { id: 'c1', prenom: 'Karim', points_balance: 120, nombre_visites: 7, loyalty_tiers: null },
  ...extra
});

function service(cards, extraDeps = {}) {
  const store = memoryStore({ cards, rewards: [] });
  const deps = {
    store, secret: SECRET, passTypeId: TYPE,
    buildPass: async () => Buffer.from('pkpass-factice'),
    log: () => {},
    ...extraDeps
  };
  const call = req => handleWalletRequest({ query: {}, headers: {}, ...req }, deps);
  return { store, call };
}

(async () => {
  console.log('Authentification par carte');
  await test('le jeton est stable, propre a la carte et au secret', () => {
    assert.equal(authTokenFor(SERIAL, SECRET), authTokenFor(SERIAL, SECRET));
    assert.notEqual(authTokenFor(SERIAL, SECRET), authTokenFor(OTHER, SECRET));
    assert.notEqual(authTokenFor(SERIAL, SECRET), authTokenFor(SERIAL, SECRET + 'x'));
    assert.ok(authTokenFor(SERIAL, SECRET).length >= 16);
    assert.equal(authTokenFor(SERIAL, ''), null);
  });
  await test("l'en-tête Authorization est vérifié strictement", () => {
    assert.equal(isAuthorized(authFor(SERIAL), SERIAL, SECRET), true);
    assert.equal(isAuthorized(authFor(OTHER), SERIAL, SECRET), false, 'jeton d’une autre carte');
    assert.equal(isAuthorized('ApplePass nimportequoi', SERIAL, SECRET), false);
    assert.equal(isAuthorized('Bearer ' + authTokenFor(SERIAL, SECRET), SERIAL, SECRET), false, 'mauvais schéma');
    assert.equal(isAuthorized(undefined, SERIAL, SECRET), false);
    assert.equal(isAuthorized(authFor(SERIAL), SERIAL, ''), false, 'sans secret serveur, tout est refusé');
  });

  console.log('Contenu de la carte');
  await test('progression vers la prochaine récompense', () => {
    const rewards = [
      { nom: 'Frites', cout_points: 50, actif: true },
      { nom: 'Menu', cout_points: 150, actif: true },
      { nom: 'Désactivée', cout_points: 10, actif: false }
    ];
    assert.deepEqual(rewardProgress(rewards, 0).next.nom, 'Frites');
    const mid = rewardProgress(rewards, 120);
    assert.equal(mid.available.nom, 'Frites');
    assert.equal(mid.next.nom, 'Menu');
    assert.equal(mid.remaining, 30);
    const top = rewardProgress(rewards, 500);
    assert.equal(top.available.nom, 'Menu');
    assert.equal(top.next, null);
    assert.deepEqual(rewardProgress([], 10), { available: null, next: null, remaining: 0 });
  });
  await test('champs : points, visites, palier, récompenses', () => {
    const rewards = [{ nom: 'Menu', cout_points: 150, actif: true }];
    const f = buildFields({ customer: { prenom: 'Karim', points_balance: 120, nombre_visites: 7, loyalty_tiers: { nom: 'Or' } }, rewards });
    assert.equal(f.primary[0].value, 120);
    assert.match(f.primary[0].changeMessage, /%@/);
    assert.equal(f.header[0].value, 'Or');
    assert.deepEqual(f.secondary.map(x => x.value), ['Karim', 7]);
    assert.equal(f.auxiliary[0].value, 'Menu dans 30 pts');
    const noTier = buildFields({ customer: { prenom: 'A', points_balance: 0, nombre_visites: 0, loyalty_tiers: null }, rewards: [] });
    assert.equal(noTier.header.length, 0);
    assert.equal(noTier.auxiliary.length, 0);
  });
  await test('mise à jour auto activée seulement avec WALLET_AUTH_SECRET', () => {
    assert.equal(webServiceFor(SERIAL, { env: {}, host: 'x.vercel.app' }), null);
    const on = webServiceFor(SERIAL, { env: { WALLET_AUTH_SECRET: SECRET }, host: 'x.vercel.app' });
    assert.equal(on.url, 'https://x.vercel.app/api/wallet');
    assert.equal(on.token, authTokenFor(SERIAL, SECRET));
    const forced = webServiceFor(SERIAL, { env: { WALLET_AUTH_SECRET: SECRET, WALLET_WEB_SERVICE_URL: 'https://o-smash.vercel.app/api/wallet/' }, host: 'preview.vercel.app' });
    assert.equal(forced.url, 'https://o-smash.vercel.app/api/wallet', 'URL de production prioritaire, sans slash final');
  });

  console.log('Service PassKit');
  await test('enregistrement : jeton exigé, 201 puis 200, mauvaises entrées refusées', async () => {
    const { store, call } = service({ [SERIAL]: card() });
    const path = ['v1', 'devices', 'dev1', 'registrations', TYPE, SERIAL];
    const body = { pushToken: 'tok1' };
    assert.equal((await call({ method: 'POST', segments: path, body })).status, 401, 'sans jeton');
    assert.equal((await call({ method: 'POST', segments: path, body, headers: { authorization: authFor(OTHER) } })).status, 401, 'jeton d’une autre carte');
    assert.equal((await call({ method: 'POST', segments: path, body: {}, headers: { authorization: authFor(SERIAL) } })).status, 400, 'sans pushToken');
    assert.equal((await call({ method: 'POST', segments: path, body, headers: { authorization: authFor(SERIAL) } })).status, 201);
    assert.equal((await call({ method: 'POST', segments: path, body: { pushToken: 'tok2' }, headers: { authorization: authFor(SERIAL) } })).status, 200);
    assert.equal(store.registrations.length, 1);
    assert.equal(store.registrations[0].pushToken, 'tok2', 'le jeton est mis à jour');
    const unknown = ['v1', 'devices', 'dev1', 'registrations', TYPE, OTHER];
    assert.equal((await call({ method: 'POST', segments: unknown, body, headers: { authorization: authFor(OTHER) } })).status, 404, 'carte inconnue');
    const wrongType = ['v1', 'devices', 'dev1', 'registrations', 'pass.autre', SERIAL];
    assert.equal((await call({ method: 'POST', segments: wrongType, body, headers: { authorization: authFor(SERIAL) } })).status, 404);
  });
  await test('liste des cartes modifiées : 204, puis 200, puis 204 avec la nouvelle étiquette', async () => {
    const { call } = service({ [SERIAL]: card({ updatedMs: 5_000 }) });
    const list = query => call({ method: 'GET', segments: ['v1', 'devices', 'dev1', 'registrations', TYPE], query });
    assert.equal((await list({})).status, 204, 'appareil sans carte');
    await call({ method: 'POST', segments: ['v1', 'devices', 'dev1', 'registrations', TYPE, SERIAL], body: { pushToken: 't' }, headers: { authorization: authFor(SERIAL) } });
    const first = await list({});
    assert.equal(first.status, 200);
    assert.deepEqual(first.json.serialNumbers, [SERIAL]);
    assert.equal(first.json.lastUpdated, '5001', 'étiquette strictement supérieure à la dernière modification');
    assert.equal((await list({ passesUpdatedSince: first.json.lastUpdated })).status, 204, 'rien de nouveau : pas de boucle');
    assert.equal((await list({ passesUpdatedSince: '4000' })).status, 200);
    assert.equal((await call({ method: 'GET', segments: ['v1', 'devices', 'autre', 'registrations', TYPE] })).status, 204, 'autre appareil');
  });
  await test('dernière version de la carte : jeton exigé, carte inactive refusée', async () => {
    const { call } = service({ [SERIAL]: card(), [OTHER]: card({ serial: OTHER, status: 'bloquee' }) });
    const get = (serial, headers) => call({ method: 'GET', segments: ['v1', 'passes', TYPE, serial], headers });
    assert.equal((await get(SERIAL)).status, 401);
    const ok = await get(SERIAL, { authorization: authFor(SERIAL) });
    assert.equal(ok.status, 200);
    assert.equal(ok.headers['Content-Type'], 'application/vnd.apple.pkpass');
    assert.ok(Buffer.isBuffer(ok.buffer));
    assert.equal((await get(OTHER, { authorization: authFor(OTHER) })).status, 404, 'carte bloquée');
  });
  await test('désenregistrement et journal', async () => {
    const { store, call } = service({ [SERIAL]: card() });
    const path = ['v1', 'devices', 'dev1', 'registrations', TYPE, SERIAL];
    await call({ method: 'POST', segments: path, body: { pushToken: 't' }, headers: { authorization: authFor(SERIAL) } });
    assert.equal((await call({ method: 'DELETE', segments: path })).status, 401);
    assert.equal((await call({ method: 'DELETE', segments: path, headers: { authorization: authFor(SERIAL) } })).status, 200);
    assert.equal(store.registrations.length, 0);
    const logged = [];
    const logService = service({}, { log: (...a) => logged.push(a.join(' ')) });
    assert.equal((await logService.call({ method: 'POST', segments: ['v1', 'log'], body: { logs: ['erreur A'] } })).status, 200);
    assert.match(logged[0], /erreur A/);
    assert.equal((await logService.call({ method: 'GET', segments: ['v2', 'log'] })).status, 404);
  });

  console.log('Notification');
  await test('notifie chaque appareil du client, retire les jetons morts', async () => {
    const { store, call } = service({ [SERIAL]: card(), [OTHER]: card({ serial: OTHER, customer: { id: 'c2', prenom: 'Z', points_balance: 0, nombre_visites: 0 } }) });
    for (const [serial, device, token] of [[SERIAL, 'd1', 'tokA'], [SERIAL, 'd2', 'tokDead'], [OTHER, 'd3', 'tokAutreClient']]) {
      await call({ method: 'POST', segments: ['v1', 'devices', device, 'registrations', TYPE, serial], body: { pushToken: token }, headers: { authorization: authFor(serial) } });
    }
    const sentTo = [];
    const result = await notifyCustomerWallets('c1', {
      store,
      sendPushes: async tokens => { sentTo.push(...tokens); return [{ token: 'tokA', status: 200 }, { token: 'tokDead', status: 410, reason: 'Unregistered' }]; }
    });
    assert.deepEqual(sentTo.sort(), ['tokA', 'tokDead'], 'jamais les appareils d’un autre client');
    assert.deepEqual(result, { devices: 2, sent: 1, removed: 1, failed: 0 });
    assert.deepEqual(store.registrations.map(r => r.pushToken).sort(), ['tokA', 'tokAutreClient']);
    const none = await notifyCustomerWallets('inconnu', { store, sendPushes: async () => { throw new Error('ne doit pas être appelé'); } });
    assert.equal(none.devices, 0);
  });
  await test('un refus APNs non définitif est compté mais ne supprime rien', async () => {
    const { store, call } = service({ [SERIAL]: card() });
    await call({ method: 'POST', segments: ['v1', 'devices', 'd1', 'registrations', TYPE, SERIAL], body: { pushToken: 'tokA' }, headers: { authorization: authFor(SERIAL) } });
    const logs = [];
    const result = await notifyCustomerWallets('c1', { store, log: (...a) => logs.push(a.join(' ')), sendPushes: async () => [{ token: 'tokA', status: 503, reason: 'ServiceUnavailable' }] });
    assert.deepEqual(result, { devices: 1, sent: 0, removed: 0, failed: 1 });
    assert.equal(store.registrations.length, 1);
    assert.match(logs[0], /ServiceUnavailable/);
    assert.equal(isDeadToken({ status: 400, reason: 'BadDeviceToken' }), true);
    assert.equal(isDeadToken({ status: 503, reason: 'ServiceUnavailable' }), false);
  });
  await test('envoi APNs : topic, chemin, corps vide, statuts par jeton (serveur HTTP/2 local)', async () => {
    const seen = [];
    const server = http2.createServer();
    server.on('stream', (stream, headers) => {
      let body = '';
      stream.on('data', c => { body += c; });
      stream.on('end', () => {
        seen.push({ path: headers[':path'], topic: headers['apns-topic'], body });
        const dead = headers[':path'].endsWith('/mort');
        stream.respond({ ':status': dead ? 410 : 200 });
        stream.end(dead ? JSON.stringify({ reason: 'Unregistered' }) : '');
      });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const results = await sendWalletPushes(['vivant', 'mort', 'vivant'], { topic: TYPE, host: `http://127.0.0.1:${server.address().port}` });
      assert.equal(results.length, 2, 'jetons dédoublonnés');
      assert.equal(results.find(r => r.token === 'vivant').status, 200);
      const dead = results.find(r => r.token === 'mort');
      assert.equal(dead.status, 410);
      assert.equal(dead.reason, 'Unregistered');
      assert.ok(seen.every(r => r.topic === TYPE && r.body === '{}'));
      assert.deepEqual(seen.map(r => r.path).sort(), ['/3/device/mort', '/3/device/vivant']);
    } finally {
      server.close();
    }
    const unreachable = await sendWalletPushes(['x'], { topic: TYPE, host: 'http://127.0.0.1:1', timeoutMs: 2000 });
    assert.equal(unreachable[0].status, 0, 'serveur injoignable : échec propre, pas d’exception');
    assert.deepEqual(await sendWalletPushes([], { topic: TYPE }), []);
  });

  console.log('Fichier .pkpass');
  let opensslOk = true;
  try { execFileSync('openssl', ['version'], { stdio: 'ignore' }); } catch (e) { opensslOk = false; }
  if (!opensslOk) {
    console.log('  skip génération du .pkpass (openssl introuvable)');
  } else {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wallet-test-'));
    const make = name => {
      execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-subj', `/CN=${name}`,
        '-keyout', path.join(dir, name + '.key'), '-out', path.join(dir, name + '.pem')], { stdio: 'ignore' });
      return { cert: fs.readFileSync(path.join(dir, name + '.pem')), key: fs.readFileSync(path.join(dir, name + '.key')) };
    };
    const signer = make('signer');
    const wwdr = make('wwdr');
    const certs = { wwdr: wwdr.cert, signerCert: signer.cert, signerKey: signer.key };
    const customer = { prenom: 'Karim', points_balance: 120, nombre_visites: 7, loyalty_tiers: null };
    const rewards = [{ nom: 'Menu', cout_points: 150, actif: true }];
    const readPass = async webService => {
      const pass = await createPass({ serial: SERIAL, customer, rewards, certs, webService });
      return JSON.parse(pass.getAsRaw()['pass.json'].toString());
    };

    await test('la carte annonce le service de mise à jour et contient les bonnes valeurs', async () => {
      const json = await readPass({ url: 'https://o-smash.vercel.app/api/wallet', token: authTokenFor(SERIAL, SECRET) });
      assert.equal(json.webServiceURL, 'https://o-smash.vercel.app/api/wallet');
      assert.equal(json.authenticationToken, authTokenFor(SERIAL, SECRET));
      assert.equal(json.serialNumber, SERIAL);
      assert.equal(json.passTypeIdentifier, TYPE);
      const flat = Object.values(json.storeCard).flat();
      assert.equal(flat.find(f => f.key === 'points').value, 120);
      assert.equal(flat.find(f => f.key === 'visites').value, 7);
      assert.equal(json.barcodes[0].message, SERIAL);
    });
    await test('sans service, la carte reste statique comme avant', async () => {
      const json = await readPass(null);
      assert.equal(json.webServiceURL, undefined);
      assert.equal(json.authenticationToken, undefined);
    });
    fs.rmSync(dir, { recursive: true, force: true });
  }

  console.log(`\n${passed} tests passés${process.exitCode ? ' — ÉCHECS ci-dessus' : ''}`);
})();
