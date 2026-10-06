// Envoi des notifications "la carte a change" vers Apple (APNs).
//
// Pour Apple Wallet, le jeton de l'appareil est celui recu a l'enregistrement,
// le "topic" est l'identifiant du type de pass, et le corps est un JSON vide.
// L'authentification se fait par certificat client : celui du Pass Type ID
// (le meme que celui qui signe les cartes).

const http2 = require('node:http2');

const APNS_HOST = 'https://api.push.apple.com';

// Renvoie un resultat par jeton : { token, status, reason }.
// status 200 = accepte ; 410 / BadDeviceToken = carte supprimee de l'iPhone.
function sendWalletPushes(tokens, { topic, cert, key, host = APNS_HOST, timeoutMs = 8000, connect = http2.connect }) {
  const unique = [...new Set(tokens.filter(Boolean))];
  if (!unique.length) return Promise.resolve([]);

  return new Promise(resolve => {
    const results = [];
    let client;
    let done = false;

    const finish = failureReason => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      for (const token of unique) {
        if (!results.some(r => r.token === token)) {
          results.push({ token, status: 0, reason: failureReason || 'NoResponse' });
        }
      }
      try { client && client.close(); } catch (e) { /* deja ferme */ }
      resolve(results);
    };

    const timer = setTimeout(() => finish('Timeout'), timeoutMs);

    try {
      client = connect(host, { cert, key });
    } catch (e) {
      return finish(e.message);
    }
    client.on('error', err => finish(err.message));

    for (const token of unique) {
      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${token}`,
        'apns-topic': topic,
        'content-type': 'application/json'
      });
      let status = 0;
      let body = '';
      req.on('response', headers => { status = headers[':status']; });
      req.on('data', chunk => { body += chunk; });
      req.on('error', err => {
        results.push({ token, status: 0, reason: err.message });
        if (results.length === unique.length) finish();
      });
      req.on('end', () => {
        let reason = null;
        try { reason = body ? JSON.parse(body).reason : null; } catch (e) { reason = body || null; }
        results.push({ token, status, reason });
        if (results.length === unique.length) finish();
      });
      req.end('{}');
    }
  });
}

// L'appareil a supprime la carte (ou jeton invalide) : on arrete d'y ecrire.
function isDeadToken(result) {
  return result.status === 410 || ['BadDeviceToken', 'Unregistered', 'DeviceTokenNotForTopic'].includes(result.reason);
}

module.exports = { sendWalletPushes, isDeadToken, APNS_HOST };
