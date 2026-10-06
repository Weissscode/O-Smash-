// Service PassKit appele directement par l'iPhone (pas par notre application) :
// enregistrement de la carte, liste des cartes modifiees, derniere version.
// URL de base annoncee dans chaque carte : <domaine>/api/wallet
// Logique dans api/_lib/walletService.js ; ici, uniquement l'adaptation Vercel.

const { createClient } = require('@supabase/supabase-js');
const { handleWalletRequest } = require('../_lib/walletService');
const { createWalletStore } = require('../_lib/walletStore');
const { PASS_TYPE_ID, buildPassBuffer, walletCerts, webServiceFor } = require('../_lib/walletPass');

function routeSegments(req) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const marker = '/api/wallet/';
  const at = pathname.indexOf(marker);
  if (at >= 0) {
    return pathname.slice(at + marker.length).split('/').filter(Boolean).map(decodeURIComponent);
  }
  // Repli : parametre de route dynamique fourni par Vercel.
  return [].concat((req.query && req.query.path) || []).filter(Boolean);
}

module.exports = async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY, WALLET_AUTH_SECRET } = process.env;
  const certs = walletCerts();
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !WALLET_AUTH_SECRET || !certs) {
    res.status(503).end();
    return;
  }

  try {
    const store = createWalletStore(createClient(SUPABASE_URL, SUPABASE_SECRET_KEY));
    const result = await handleWalletRequest(
      {
        method: req.method,
        segments: routeSegments(req),
        query: Object.fromEntries(new URL(req.url, 'http://localhost').searchParams),
        headers: req.headers,
        body: req.body
      },
      {
        store,
        secret: WALLET_AUTH_SECRET,
        passTypeId: PASS_TYPE_ID,
        log: (...args) => console.log(...args),
        buildPass: (card, rewards) => buildPassBuffer({
          serial: card.serial,
          customer: card.customer,
          rewards,
          certs,
          webService: webServiceFor(card.serial, { host: req.headers.host })
        })
      }
    );

    Object.entries(result.headers || {}).forEach(([name, value]) => res.setHeader(name, value));
    res.status(result.status);
    if (result.buffer) res.send(result.buffer);
    else if (result.json !== undefined) res.json(result.json);
    else res.end();
  } catch (error) {
    console.error('Erreur service Wallet', error);
    res.status(500).end();
  }
};
