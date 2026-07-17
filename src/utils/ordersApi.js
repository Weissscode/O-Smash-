import { supabase } from '../supabaseClient.js';
import { LS } from './storage.js';

const QUEUE_KEY = 'osm7-sync-queue';

function rowToOrder(row) {
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
    splitOf: row.split_of
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
    split_of: order.splitOf || null
  };
}

function getQueue() {
  return LS.get(QUEUE_KEY, []);
}

function setQueue(q) {
  LS.set(QUEUE_KEY, q);
}

function enqueue(mutation) {
  setQueue([...getQueue(), mutation]);
}

export async function fetchOrders(restaurantId) {
  const since = new Date();
  since.setDate(since.getDate() - 2);
  const { data, error } = await supabase
    .from('orders')
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
    const { data, error } = await supabase.from('orders').insert(row).select().single();
    if (error) throw error;
    return { order: rowToOrder(data), offline: false };
  } catch (e) {
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
  if (id.toString().startsWith('local_')) {
    enqueue({ type: 'update-local', localId: id, row });
    return { offline: true };
  }
  try {
    const { error } = await supabase.from('orders').update(row).eq('id', id);
    if (error) throw error;
    return { offline: false };
  } catch (e) {
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
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return { offline: false };
  } catch (e) {
    enqueue({ type: 'delete', id });
    return { offline: true };
  }
}

export async function deleteOrdersForDate(restaurantId, dateStr) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, cree_le')
      .eq('restaurant_id', restaurantId);
    if (error) throw error;
    const ids = (data || [])
      .filter(r => new Date(r.cree_le).toLocaleDateString('fr-FR') === dateStr)
      .map(r => r.id);
    if (ids.length) {
      await supabase.from('orders').delete().in('id', ids);
    }
    return { offline: false };
  } catch (e) {
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
      if (m.type === 'insert') {
        await supabase.from('orders').insert(m.row);
      } else if (m.type === 'update') {
        await supabase.from('orders').update(m.row).eq('id', m.id);
      } else if (m.type === 'delete') {
        await supabase.from('orders').delete().eq('id', m.id);
      }
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
