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
    .select('id, statut, uid_nfc, customer_id, customers(id, prenom, nom, points_balance, total_depense, nombre_visites, loyalty_tiers(nom))')
    .eq('restaurant_id', restaurantId)
    .eq('uid_nfc', code)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 'inconnue' };
  if (data.statut !== 'active') return { status: data.statut, card: data };
  return { status: 'active', card: data, customer: data.customers };
}

// La caisse ne fait pas confiance au contenu du broadcast Realtime.
// Elle relit la carte et le client sous RLS avant de les rattacher.
export async function fetchScannedCustomer(restaurantId, cardId, customerId) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('id, statut, customer_id, customers(id, prenom, nom, telephone, points_balance, total_depense, nombre_visites, loyalty_tiers(nom))')
    .eq('restaurant_id', restaurantId)
    .eq('id', cardId)
    .eq('customer_id', customerId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.statut !== 'active' || !data.customers) throw new Error('Carte fidélité invalide');
  return { customer: data.customers, cardId: data.id };
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

// ── Relais entre la page /scan (telephone du serveur) et la caisse ──
//
// Ecrit dans une vraie table (loyalty_scan_events) plutot qu'un simple
// "broadcast" Realtime ephemere : un scan envoye avant que la caisse
// ne soit ouverte/connectee n'est plus perdu, elle peut le relire au
// demarrage (fenetre de rattrapage de 90s) en plus de le recevoir en
// direct si elle est deja connectee.
const SCAN_EVENT_CATCHUP_MS = 90 * 1000;

// Cote caisse : rattrape un scan recent au demarrage, puis ecoute les
// nouveaux en direct. Renvoie une fonction de cleanup.
export function subscribeLoyaltyScans(restaurantId, onScan) {
  let cancelled = false;

  function consume(row) {
    if (cancelled || !row) return;
    onScan({ customerId: row.customer_id, cardId: row.card_id });
    // Best-effort : evite qu'un rechargement ulterieur ne rattache le
    // meme client une seconde fois.
    supabase.from('loyalty_scan_events').delete().eq('id', row.id).then(() => {});
  }

  const since = new Date(Date.now() - SCAN_EVENT_CATCHUP_MS).toISOString();
  supabase
    .from('loyalty_scan_events')
    .select('id, customer_id, card_id, cree_le')
    .eq('restaurant_id', restaurantId)
    .gte('cree_le', since)
    .order('cree_le', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => consume(data));

  const channel = supabase
    .channel(`loyalty-scan-events-${restaurantId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'loyalty_scan_events',
      filter: `restaurant_id=eq.${restaurantId}`
    }, payload => consume(payload.new))
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

// Cote /scan : enregistre le client identifie, la caisse le rattrapera
// (immediatement si elle ecoute deja, sinon a sa prochaine ouverture).
export async function broadcastLoyaltyScan(restaurantId, { customerId, cardId }) {
  const { error } = await supabase.from('loyalty_scan_events').insert({
    restaurant_id: restaurantId,
    customer_id: customerId,
    card_id: cardId
  });
  if (error) throw error;
}
