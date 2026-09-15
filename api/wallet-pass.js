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

const { createClient } = require('@supabase/supabase-js');
const { PKPass } = require('passkit-generator');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const WALLET_WWDR_PEM = process.env.WALLET_WWDR_PEM;
const WALLET_SIGNER_CERT_PEM = process.env.WALLET_SIGNER_CERT_PEM;
const WALLET_SIGNER_KEY_PEM = process.env.WALLET_SIGNER_KEY_PEM;

module.exports = async function handler(req, res) {
  const code = (req.query.code || '').toString().trim();
  if (!code) {
    res.status(400).send('Code manquant');
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !WALLET_WWDR_PEM || !WALLET_SIGNER_CERT_PEM || !WALLET_SIGNER_KEY_PEM) {
    res.status(500).send("Configuration Wallet incomplète côté serveur (variables d'environnement manquantes).");
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
  const { data: card, error } = await supabaseAdmin
    .from('loyalty_cards')
    .select('uid_nfc, statut, customers(prenom, points_balance)')
    .eq('uid_nfc', code)
    .maybeSingle();

  if (error || !card || card.statut !== 'active' || !card.customers) {
    res.status(404).send('Carte introuvable ou inactive.');
    return;
  }

  try {
    const pass = await PKPass.from(
      {
        model: path.join(__dirname, '_pass-model', 'osmash-loyalty.pass'),
        certificates: {
          wwdr: Buffer.from(WALLET_WWDR_PEM, 'base64'),
          signerCert: Buffer.from(WALLET_SIGNER_CERT_PEM, 'base64'),
          signerKey: Buffer.from(WALLET_SIGNER_KEY_PEM, 'base64')
        }
      },
      {
        serialNumber: card.uid_nfc,
        description: `Carte de fidélité O'Smash - ${card.customers.prenom}`
      }
    );

    pass.primaryFields.push({ key: 'points', label: 'POINTS', value: card.customers.points_balance });
    pass.secondaryFields.push({ key: 'prenom', label: 'CLIENT', value: card.customers.prenom });
    pass.setBarcodes({ message: card.uid_nfc, format: 'PKBarcodeFormatQR', messageEncoding: 'iso-8859-1' });

    const buffer = pass.getAsBuffer();
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename="osmash-fidelite.pkpass"');
    res.status(200).send(buffer);
  } catch (e) {
    console.error('Erreur génération pass Wallet', e);
    res.status(500).send('Erreur lors de la génération de la carte.');
  }
};
