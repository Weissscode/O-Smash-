// Construction de la carte Apple Wallet (.pkpass) d'un client.
// Partage entre le telechargement initial (/api/wallet-pass) et les mises
// a jour demandees par l'iPhone (/api/wallet/v1/passes/...).

const path = require('node:path');
const { PKPass } = require('passkit-generator');
const { authTokenFor } = require('./walletAuth');

const PASS_TYPE_ID = 'pass.fr.osmash54.fidelite';
const MODEL_DIR = path.join(__dirname, '..', '_pass-model', 'osmash-loyalty.pass');

// Recompense atteignable la plus chere, et prochaine recompense a viser.
function rewardProgress(rewards, balance) {
  const active = (rewards || [])
    .filter(r => r.actif !== false && Number(r.cout_points) > 0)
    .sort((a, b) => a.cout_points - b.cout_points);
  const available = [...active].reverse().find(r => r.cout_points <= balance) || null;
  const next = active.find(r => r.cout_points > balance) || null;
  return { available, next, remaining: next ? next.cout_points - balance : 0 };
}

// Contenu des zones de la carte, sans dependance a Apple : testable seul.
function buildFields({ customer, rewards }) {
  const balance = Number(customer.points_balance) || 0;
  const { available, next, remaining } = rewardProgress(rewards, balance);
  const fields = { header: [], primary: [], secondary: [], auxiliary: [] };

  const tier = customer.loyalty_tiers && customer.loyalty_tiers.nom;
  if (tier) fields.header.push({ key: 'palier', label: 'PALIER', value: tier });

  fields.primary.push({
    key: 'points',
    label: 'POINTS',
    value: balance,
    changeMessage: 'Vous avez maintenant %@ points'
  });
  fields.secondary.push({ key: 'prenom', label: 'CLIENT', value: customer.prenom });
  fields.secondary.push({ key: 'visites', label: 'VISITES', value: Number(customer.nombre_visites) || 0 });

  if (available) {
    fields.auxiliary.push({ key: 'disponible', label: 'DISPONIBLE', value: available.nom });
  }
  if (next) {
    fields.auxiliary.push({ key: 'prochaine', label: 'PROCHAINE RÉCOMPENSE', value: `${next.nom} dans ${remaining} pts` });
  }
  return fields;
}

// webService = { url, token } -> la carte pourra se mettre a jour seule.
// Sans webService, on garde l'ancien comportement (carte statique).
async function createPass({ serial, customer, rewards, certs, webService }) {
  const pass = await PKPass.from(
    { model: MODEL_DIR, certificates: certs },
    {
      serialNumber: serial,
      description: `Carte de fidélité O'Smash - ${customer.prenom}`,
      ...(webService ? { webServiceURL: webService.url, authenticationToken: webService.token } : {})
    }
  );

  const fields = buildFields({ customer, rewards });
  fields.header.forEach(f => pass.headerFields.push(f));
  fields.primary.forEach(f => pass.primaryFields.push(f));
  fields.secondary.forEach(f => pass.secondaryFields.push(f));
  fields.auxiliary.forEach(f => pass.auxiliaryFields.push(f));
  pass.setBarcodes({ message: serial, format: 'PKBarcodeFormatQR', messageEncoding: 'iso-8859-1' });
  return pass;
}

async function buildPassBuffer(options) {
  return (await createPass(options)).getAsBuffer();
}

function walletCerts(env = process.env) {
  const { WALLET_WWDR_PEM, WALLET_SIGNER_CERT_PEM, WALLET_SIGNER_KEY_PEM } = env;
  if (!WALLET_WWDR_PEM || !WALLET_SIGNER_CERT_PEM || !WALLET_SIGNER_KEY_PEM) return null;
  return {
    wwdr: Buffer.from(WALLET_WWDR_PEM, 'base64'),
    signerCert: Buffer.from(WALLET_SIGNER_CERT_PEM, 'base64'),
    signerKey: Buffer.from(WALLET_SIGNER_KEY_PEM, 'base64')
  };
}

// Active la mise a jour automatique uniquement si WALLET_AUTH_SECRET est
// defini (apres application de la migration 009). L'URL doit etre celle
// de PRODUCTION : un deploiement de previsualisation Vercel est protege
// et ne repondrait pas a l'iPhone.
function webServiceFor(serial, { env = process.env, host } = {}) {
  const token = authTokenFor(serial, env.WALLET_AUTH_SECRET);
  if (!token) return null;
  const url = env.WALLET_WEB_SERVICE_URL || (host ? `https://${host}/api/wallet` : null);
  return url ? { url: url.replace(/\/+$/, ''), token } : null;
}

module.exports = { PASS_TYPE_ID, rewardProgress, buildFields, createPass, buildPassBuffer, walletCerts, webServiceFor };
