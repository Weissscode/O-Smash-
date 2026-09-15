import { supabase } from '../supabaseClient.js';

// Genere un identifiant de carte unique (contenu du QR). Pas de donnee
// personnelle dedans : juste un pointeur aleatoire vers le client en base.
export function generateCardCode() {
  return `OSM-${crypto.randomUUID()}`;
}

// Recherche une carte par son code (scan QR ou NFC) et renvoie, si elle
// est active, le client associe avec son palier.
export async function lookupCardByCode(restaurantId, code) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('id, statut, uid_nfc, customer_id, customers(*, loyalty_tiers(nom))')
    .eq('restaurant_id', restaurantId)
    .eq('uid_nfc', code)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 'inconnue' };
  if (data.statut !== 'active') return { status: data.statut, card: data };
  return { status: 'active', card: data, customer: data.customers };
}

// Cree un nouveau client + sa carte active, et renvoie le code genere
// (a afficher en QR pour que le client puisse la sauvegarder).
export async function createCustomerWithCard(restaurantId, { prenom, telephone }) {
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({ restaurant_id: restaurantId, prenom, telephone: telephone || null, consentement_rgpd: true })
    .select()
    .single();
  if (customerError) throw customerError;

  const code = generateCardCode();
  const { data: card, error: cardError } = await supabase
    .from('loyalty_cards')
    .insert({
      restaurant_id: restaurantId,
      uid_nfc: code,
      customer_id: customer.id,
      statut: 'active',
      activee_le: new Date().toISOString()
    })
    .select()
    .single();
  if (cardError) throw cardError;

  return { customer, card, code };
}
