// Appele par l'application (caisse / scan) juste apres une transaction de
// fidelite : previent les iPhone du client pour qu'ils rechargent sa carte.
//
// POST /api/wallet-notify   Authorization: Bearer <jeton de session Supabase>
// body: { customerId }
//
// Reserve au personnel connecte, et uniquement pour un client de SON restaurant.

const { createClient } = require('@supabase/supabase-js');
const { notifyCustomerWallets } = require('./_lib/walletService');
const { createWalletStore } = require('./_lib/walletStore');
const { sendWalletPushes } = require('./_lib/apns');
const { PASS_TYPE_ID, walletCerts } = require('./_lib/walletPass');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { SUPABASE_URL, SUPABASE_SECRET_KEY, WALLET_AUTH_SECRET } = process.env;
  // Fonction non activee (migration 009 / secret pas encore en place) :
  // on repond poliment pour ne pas polluer la console de la caisse.
  if (!WALLET_AUTH_SECRET) {
    res.status(200).json({ skipped: 'wallet-updates-disabled' });
    return;
  }
  const certs = walletCerts();
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !certs) {
    res.status(503).json({ error: 'Configuration Wallet incomplète.' });
    return;
  }

  const jwt = (/^Bearer\s+(\S+)$/.exec(req.headers.authorization || '') || [])[1];
  const customerId = req.body && req.body.customerId;
  if (!jwt || !customerId || !UUID.test(customerId)) {
    res.status(400).json({ error: 'Requête invalide.' });
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
    const { data: auth, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !auth.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('id', auth.user.id)
      .maybeSingle();

    const store = createWalletStore(supabase);
    const customerRestaurant = await store.getCustomerRestaurant(customerId);
    if (!profile || !customerRestaurant || profile.restaurant_id !== customerRestaurant) {
      res.status(403).json({ error: 'Accès refusé.' });
      return;
    }

    const result = await notifyCustomerWallets(customerId, {
      store,
      log: (...args) => console.warn(...args),
      sendPushes: tokens => sendWalletPushes(tokens, {
        topic: PASS_TYPE_ID, cert: certs.signerCert, key: certs.signerKey
      })
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur notification Wallet', error);
    res.status(500).json({ error: 'Notification impossible.' });
  }
};
