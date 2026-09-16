// Fonction serverless Vercel : inscription publique au programme de
// fidélité (plaque NFC ou QR imprimé -> /r/<slug>/fidelite).
//
// Volontairement JAMAIS fait depuis le navigateur du client final :
// pas de session authentifiée possible pour un visiteur anonyme (RLS
// bloquerait de toute façon), et on ne veut pas non plus qu'un visiteur
// puisse deviner/énumérer des clients existants. Toute la logique
// sensible (résolution du restaurant, anti-doublon, création) passe
// ici, avec la clé secrète Supabase, jamais exposée au client.
//
// POST /api/register-customer
// body: { slug, prenom, telephone, consentementCgu, consentementMarketing }

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function generateCardCode() {
  return `OSM-${require('crypto').randomUUID()}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    res.status(500).json({ error: 'Configuration serveur incomplète.' });
    return;
  }

  const { slug, prenom, telephone, consentementCgu, consentementMarketing } = req.body || {};

  if (!slug || !prenom || !String(prenom).trim()) {
    res.status(400).json({ error: 'Prénom manquant.' });
    return;
  }
  if (!consentementCgu) {
    res.status(400).json({ error: "L'acceptation des CGU est obligatoire." });
    return;
  }
  // E.164 minimal : + suivi de 8 à 15 chiffres.
  if (telephone && !/^\+\d{8,15}$/.test(telephone)) {
    res.status(400).json({ error: 'Numéro de téléphone invalide.' });
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

  const { data: restaurant, error: restaurantError } = await supabaseAdmin
    .from('restaurants')
    .select('id, nom')
    .eq('slug', slug)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    res.status(404).json({ error: 'Restaurant introuvable.' });
    return;
  }

  // Anti-doublon : si ce numéro a déjà une carte, on ne la renvoie
  // JAMAIS directement (empêcherait quelqu'un de récupérer la carte
  // d'un tiers juste en connaissant son numéro). Un vrai parcours de
  // récupération vérifié (SMS) est prévu en prochaine étape.
  if (telephone) {
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('restaurant_id', restaurant.id)
      .eq('telephone', telephone)
      .eq('anonymise', false)
      .maybeSingle();

    if (existing) {
      res.status(200).json({ status: 'existing' });
      return;
    }
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .insert({
      restaurant_id: restaurant.id,
      prenom: String(prenom).trim(),
      telephone: telephone || null,
      consentement_cgu: true,
      consentement_marketing: !!consentementMarketing,
      consentement_rgpd: true
    })
    .select('id, prenom')
    .single();

  if (customerError) {
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
    return;
  }

  const code = generateCardCode();
  const { error: cardError } = await supabaseAdmin
    .from('loyalty_cards')
    .insert({
      restaurant_id: restaurant.id,
      uid_nfc: code,
      customer_id: customer.id,
      statut: 'active',
      activee_le: new Date().toISOString()
    });

  if (cardError) {
    res.status(500).json({ error: 'Erreur lors de la création de la carte.' });
    return;
  }

  // Reponse volontairement minimale : juste de quoi afficher le QR /
  // proposer le Wallet, jamais l'historique ou le solde d'un tiers.
  res.status(200).json({ status: 'created', prenom: customer.prenom, code });
};
