// Fonction serverless Vercel : genere a la volee la carte Apple Wallet
// (.pkpass) d'un client fidelite, a partir du code de sa carte QR.
//
// Appel : GET /api/wallet-pass?code=OSM-xxxxxxxx
//
// Variables d'environnement necessaires (a definir dans Vercel, jamais
// dans le code) :
//   SUPABASE_URL, SUPABASE_SECRET_KEY  - cle secrete Supabase (bypass RLS,
//                                        cet endpoint n'a pas de session
//                                        utilisateur ; l'autorisation se
//                                        fait par la connaissance du code,
//                                        comme decrit dans docs/fidelite-nfc.md)
//   WALLET_WWDR_PEM                    - certificat intermediaire Apple, en base64
//   WALLET_SIGNER_CERT_PEM             - certificat Pass Type ID, en base64
//   WALLET_SIGNER_KEY_PEM              - cle privee correspondante, en base64
//
// Optionnelles (mise a jour automatique de la carte, voir
// docs/wallet-auto-update.md ; migration 009 a appliquer d'abord) :
//   WALLET_AUTH_SECRET                 - secret servant a deriver le jeton de chaque carte
//   WALLET_WEB_SERVICE_URL             - ex. https://o-smash.vercel.app/api/wallet
//
// Sans WALLET_AUTH_SECRET, la carte est generee comme avant : statique.

const { createClient } = require('@supabase/supabase-js');
const { createWalletStore } = require('./_lib/walletStore');
const { buildPassBuffer, walletCerts, webServiceFor } = require('./_lib/walletPass');

module.exports = async function handler(req, res) {
  const code = (req.query.code || '').toString().trim();
  if (!code) {
    res.status(400).send('Code manquant');
    return;
  }

  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
  const certs = walletCerts();
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !certs) {
    res.status(500).send("Configuration Wallet incomplète côté serveur (variables d'environnement manquantes).");
    return;
  }

  try {
    const store = createWalletStore(createClient(SUPABASE_URL, SUPABASE_SECRET_KEY));
    const card = await store.getCardBySerial(code);

    if (!card || card.status !== 'active') {
      res.status(404).send('Carte introuvable ou inactive.');
      return;
    }

    const rewards = await store.getActiveRewards(card.restaurantId);
    const buffer = await buildPassBuffer({
      serial: card.serial,
      customer: card.customer,
      rewards,
      certs,
      webService: webServiceFor(card.serial, { host: req.headers.host })
    });

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename="osmash-fidelite.pkpass"');
    res.status(200).send(buffer);
  } catch (e) {
    console.error('Erreur génération pass Wallet', e);
    res.status(500).send('Erreur lors de la génération de la carte.');
  }
};
