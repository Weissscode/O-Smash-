// Résolution publique d'un restaurant pour la page fidélité.
// La lecture passe par le serveur afin de conserver les règles RLS existantes.
// Seuls le nom et le slug canonique sont renvoyés au navigateur.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function normalizeRestaurantSlug(value) {
  if (typeof value !== 'string') return '';

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return decoded
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Méthode non autorisée.' });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error('Variables Supabase absentes pour la résolution fidélité.');
    res.status(500).json({ error: 'Le service fidélité est momentanément indisponible.' });
    return;
  }

  const rawSlug = Array.isArray(req.query?.slug) ? req.query.slug[0] : req.query?.slug;
  const slug = normalizeRestaurantSlug(rawSlug);

  if (!slug) {
    res.status(400).json({ error: 'Adresse du restaurant invalide.' });
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: restaurant, error } = await supabaseAdmin
    .from('restaurants')
    .select('nom, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Échec de la résolution publique du restaurant.', {
      code: error.code,
      message: error.message
    });
    res.status(500).json({ error: 'Le service fidélité est momentanément indisponible.' });
    return;
  }

  if (!restaurant) {
    res.status(404).json({ error: 'Restaurant introuvable.' });
    return;
  }

  res.status(200).json({ nom: restaurant.nom, slug: restaurant.slug });
};
