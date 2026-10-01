import { supabase } from '../supabaseClient.js';
import { LS } from './storage.js';
import { ordersTable, isBackendRejection, backendMessage } from './environment.js';

const QUEUE_KEY = 'osm7-sync-queue';

export function rowToOrder(row) {
  return {
    id: row.id,
    num: row.num,
    date: row.cree_le,
    items: row.items || [],
    total: row.total,
    payment: row.payment,
    service: row.service,
    phone: row.phone,
    client: row.client,
    status: row.status,
    splitOf: row.split_of,
    printRequest: row.print_request,
    printError: row.print_error,
    customerId: row.customer_id,
    cardId: row.card_id,
    pointsGagnes: row.points_gagnes,
    fiscalLocked: !!row.fiscal_locked_at
  };
}

function orderToRow(restaurantId, order) {
  return {
    restaurant_id: restaurantId,
    num: order.num,
    items: order.items,
    total: order.total,
    payment: order.payment || null,
    service: order.service || null,
    phone: order.phone || null,
    client: order.client || null,
    status: order.status,
    split_of: order.splitOf || null,
    print_request: order.printRequest || null,
    customer_id: order.customerId || null,
    card_id: order.cardId || null,
    points_gagnes: order.pointsGagnes || null
  };
}

// Table cible (TEST ou PRODUCTION), fixee par AuthGate des que le profil et
// l'etat du restaurant sont connus (Environment Router, voir environment.js).
let currentTable = 'orders';
export function configureOrdersEnvironment(environment) {
  currentTable = ordersTable(environment);
}

function rejection(e) {
  return { offline: false, rejected: true, message: backendMessage(e) };
}

function getQueue() {
  return LS.get(QUEUE_KEY, []);
}

function setQueue(q) {
  LS.set(QUEUE_KEY, q);
}

function enqueue(mutation) {
  setQueue([...getQueue(), { table: currentTable, ...mutation }]);
}

export async function fetchOrders(restaurantId, daysBack = 2) {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const { data, error } = await supabase
    .from(currentTable)
    .select('*')
    .eq('restaurant_id', restaurantId)
    .gte('cree_le', since.toISOString())
    .order('cree_le', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToOrder);
}

// Insere une commande. Si hors-ligne, renvoie un objet local (id temporaire)
// et met la creation en file d'attente pour synchro ulterieure.
export async function insertOrder(restaurantId, order) {
  const row = orderToRow(restaurantId, order);
  try {
    const { data, error } = await supabase.from(currentTable).insert(row).select().single();
    if (error) throw error;
    return { order: rowToOrder(data), offline: false };
  } catch (e) {
    // Refus du backend (RLS, regle fiscale) : inutile de rejouer, on le signale.
    if (isBackendRejection(e)) {
      return { order: { ...order, id: 'local_' + order.id }, offline: true, rejected: true, message: backendMessage(e) };
    }
    const localId = 'local_' + order.id;
    enqueue({ type: 'insert', localId, row });
    return { order: { ...order, id: localId }, offline: true };
  }
}

export async function insertOrders(restaurantId, orders) {
  const results = [];
  for (const o of orders) {
    results.push(await insertOrder(restaurantId, o));
  }
  return results;
}

export async function updateOrder(id, updates) {
  const row = {};
  if ('payment' in updates) row.payment = updates.payment;
  if ('status' in updates) row.status = updates.status;
  if ('items' in updates) row.items = updates.items;
  if ('total' in updates) row.total = updates.total;
  if ('printRequest' in updates) row.print_request = updates.printRequest;
  if ('client' in updates) row.client = updates.client;
  if ('phone' in updates) row.phone = updates.phone;
  if ('service' in updates) row.service = updates.service;
  if (id.toString().startsWith('local_')) {
    enqueue({ type: 'update-local', localId: id, row });
    return { offline: true };
  }
  try {
    const { error } = await supabase.from(currentTable).update(row).eq('id', id);
    if (error) throw error;
    return { offline: false };
  } catch (e) {
    if (isBackendRejection(e)) return rejection(e);
    enqueue({ type: 'update', id, row });
    return { offline: true };
  }
}

export async function deleteOrder(id) {
  if (id.toString().startsWith('local_')) {
    enqueue({ type: 'delete-local', localId: id });
    return { offline: true };
  }
  try {
    const { error } = await supabase.from(currentTable).delete().eq('id', id);
    if (error) throw error;
    return { offline: false };
  } catch (e) {
    if (isBackendRejection(e)) return rejection(e);
    enqueue({ type: 'delete', id });
    return { offline: true };
  }
}

export async function deleteOrdersForDate(restaurantId, dateStr) {
  try {
    const { data, error } = await supabase
      .from(currentTable)
      .select('id, cree_le')
      .eq('restaurant_id', restaurantId);
    if (error) throw error;
    const ids = (data || [])
      .filter(r => new Date(r.cree_le).toLocaleDateString('fr-FR') === dateStr)
      .map(r => r.id);
    if (ids.length) {
      // Profil fiscal FR : le backend refuse la suppression de ventes verrouillees.
      const { error: delError } = await supabase.from(currentTable).delete().in('id', ids);
      if (delError) throw delError;
    }
    return { offline: false };
  } catch (e) {
    if (isBackendRejection(e)) return rejection(e);
    return { offline: true };
  }
}

// Rejoue la file d'attente hors-ligne. A appeler au retour de connexion.
export async function flushQueue() {
  const queue = getQueue();
  if (queue.length === 0) return;
  const remaining = [];
  for (const m of queue) {
    try {
      // Les mutations en file gardent la table visee au moment de la saisie
      // (anciennes entrees sans table = production).
      const table = m.table || 'orders';
      let res = null;
      if (m.type === 'insert') {
        res = await supabase.from(table).insert(m.row);
      } else if (m.type === 'update') {
        res = await supabase.from(table).update(m.row).eq('id', m.id);
      } else if (m.type === 'delete') {
        res = await supabase.from(table).delete().eq('id', m.id);
      }
      // Refus du backend : on ne rejoue pas indefiniment. Erreur reseau : on garde.
      if (res && res.error && !isBackendRejection(res.error)) throw res.error;
      // update-local / delete-local on an order that never made it online
      // are dropped silently once the matching insert has synced elsewhere.
    } catch (e) {
      remaining.push(m);
    }
  }
  setQueue(remaining);
}

export function hasPendingSync() {
  return getQueue().length > 0;
}
