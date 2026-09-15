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

const POINTS_PAR_EURO = 1;

// Enregistre les points gagnes pour une commande : ecrit la ligne de
// ledger (source de verite) puis met a jour le solde cache du client.
// Ne doit jamais faire echouer la vente si ca plante : a appeler apres
// coup, dans un try/catch, sans bloquer l'encaissement.
export async function recordOrderPoints(restaurantId, { orderId, customerId, cardId, total, staffId }) {
  const points = Math.floor(total * POINTS_PAR_EURO);
  if (points <= 0 || !customerId) return null;

  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('points_balance, total_depense, nombre_visites')
    .eq('id', customerId)
    .single();
  if (fetchError) throw fetchError;

  const newBalance = customer.points_balance + points;

  const { error: txError } = await supabase.from('loyalty_transactions').insert({
    restaurant_id: restaurantId,
    customer_id: customerId,
    card_id: cardId || null,
    order_id: orderId,
    type: 'gain',
    points_delta: points,
    solde_apres: newBalance,
    cree_par: staffId || null
  });
  if (txError) throw txError;

  const { error: custError } = await supabase
    .from('customers')
    .update({
      points_balance: newBalance,
      total_depense: customer.total_depense + total,
      nombre_visites: customer.nombre_visites + 1,
      derniere_visite_le: new Date().toISOString()
    })
    .eq('id', customerId);
  if (custError) throw custError;

  return { points, newBalance };
}

// Liste des clients fidelite d'un restaurant, pour l'ecran admin
// (Dashboard > Fidelite). Plus recents en premier.
export async function fetchCustomers(restaurantId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*, loyalty_tiers(nom), loyalty_cards(uid_nfc, statut)')
    .eq('restaurant_id', restaurantId)
    .eq('anonymise', false)
    .order('cree_le', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Historique des mouvements de points d'un client (ledger), pour sa
// fiche detail cote admin.
export async function fetchCustomerTransactions(customerId) {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('cree_le', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

// ── Catalogue de recompenses ──────────────────────────────────

// Recompenses actives d'un restaurant, triees par cout croissant -
// utilise cote caisse (/scan) pour savoir lesquelles proposer au client.
export async function fetchActiveRewards(restaurantId) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('actif', true)
    .order('cout_points', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Toutes les recompenses (actives ou non), pour l'ecran admin.
export async function fetchAllRewards(restaurantId) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('cout_points', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createReward(restaurantId, { nom, description, coutPoints, type, valeur }) {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      restaurant_id: restaurantId,
      nom,
      description: description || null,
      cout_points: coutPoints,
      type,
      valeur: valeur || null
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setRewardActive(rewardId, actif) {
  const { error } = await supabase.from('rewards').update({ actif }).eq('id', rewardId);
  if (error) throw error;
}

// Utilisation d'une recompense par un client : deduit ses points
// (ledger + solde cache) et trace la recompense obtenue/utilisee.
// Verifie le solde juste avant de deduire pour eviter de passer en negatif.
export async function redeemReward(restaurantId, { customerId, cardId, reward, staffId }) {
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('points_balance')
    .eq('id', customerId)
    .single();
  if (fetchError) throw fetchError;

  if (customer.points_balance < reward.cout_points) {
    throw new Error('Solde de points insuffisant');
  }

  const newBalance = customer.points_balance - reward.cout_points;

  const { error: txError } = await supabase.from('loyalty_transactions').insert({
    restaurant_id: restaurantId,
    customer_id: customerId,
    card_id: cardId || null,
    type: 'utilisation_recompense',
    points_delta: -reward.cout_points,
    solde_apres: newBalance,
    description: reward.nom,
    cree_par: staffId || null
  });
  if (txError) throw txError;

  const { error: custError } = await supabase
    .from('customers')
    .update({ points_balance: newBalance })
    .eq('id', customerId);
  if (custError) throw custError;

  const now = new Date().toISOString();
  const { error: rewardError } = await supabase.from('customer_rewards').insert({
    restaurant_id: restaurantId,
    customer_id: customerId,
    reward_id: reward.id,
    statut: 'utilisee',
    obtenue_le: now,
    utilisee_le: now
  });
  if (rewardError) throw rewardError;

  return { newBalance };
}

// ── Relais temps reel entre la page /scan (telephone du serveur) et la
// caisse : canal Supabase Realtime "broadcast", sans table dediee.
function loyaltyChannelName(restaurantId) {
  return `fidelite-${restaurantId}`;
}

// Cote caisse : ecoute les scans effectues depuis /scan et rattache le
// client trouve a la commande en cours. Renvoie une fonction de cleanup.
export function subscribeLoyaltyScans(restaurantId, onScan) {
  const channel = supabase.channel(loyaltyChannelName(restaurantId));
  channel.on('broadcast', { event: 'scan' }, ({ payload }) => onScan(payload));
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

let sendChannel = null;
let sendChannelKey = null;

// Cote /scan : diffuse le client identifie vers la caisse abonnee.
export function broadcastLoyaltyScan(restaurantId, payload) {
  if (sendChannel && sendChannelKey !== restaurantId) {
    supabase.removeChannel(sendChannel);
    sendChannel = null;
  }
  if (!sendChannel) {
    sendChannel = supabase.channel(loyaltyChannelName(restaurantId));
    sendChannel.subscribe();
    sendChannelKey = restaurantId;
  }
  return sendChannel.send({ type: 'broadcast', event: 'scan', payload });
}
