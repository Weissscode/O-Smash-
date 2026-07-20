import { supabase } from '../supabaseClient.js';
import { LS } from './storage.js';

const QUEUE_KEY = 'osm7-stock-sync-queue';

function getQueue() {
  return LS.get(QUEUE_KEY, []);
}

function setQueue(q) {
  LS.set(QUEUE_KEY, q);
}

function enqueue(mutation) {
  setQueue([...getQueue(), mutation]);
}

export async function fetchStockOut(restaurantId) {
  const { data, error } = await supabase
    .from('product_stock')
    .select('product_id, en_rupture')
    .eq('restaurant_id', restaurantId)
    .eq('en_rupture', true);
  if (error) throw error;
  return (data || []).map(r => r.product_id);
}

// Marque un produit en rupture ou de nouveau disponible.
export async function setStockStatus(restaurantId, productId, enRupture) {
  try {
    const { error } = await supabase
      .from('product_stock')
      .upsert({ restaurant_id: restaurantId, product_id: productId, en_rupture: enRupture, maj_le: new Date().toISOString() });
    if (error) throw error;
    return { offline: false };
  } catch (e) {
    enqueue({ restaurantId, productId, enRupture });
    return { offline: true };
  }
}

export async function resetStock(restaurantId) {
  try {
    const { error } = await supabase.from('product_stock').delete().eq('restaurant_id', restaurantId);
    if (error) throw error;
    return { offline: false };
  } catch (e) {
    return { offline: true };
  }
}

export async function flushStockQueue() {
  const queue = getQueue();
  if (queue.length === 0) return;
  const remaining = [];
  for (const m of queue) {
    try {
      await supabase.from('product_stock').upsert({
        restaurant_id: m.restaurantId,
        product_id: m.productId,
        en_rupture: m.enRupture,
        maj_le: new Date().toISOString()
      });
    } catch (e) {
      remaining.push(m);
    }
  }
  setQueue(remaining);
}

export function hasPendingStockSync() {
  return getQueue().length > 0;
}
