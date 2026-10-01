import { supabase } from '../supabaseClient.js';
import { backendMessage } from './environment.js';

// Fine couche au-dessus des RPC de la migration 008. Toute la logique
// (verrous, ledger, clotures) vit dans PostgreSQL : ici, simples appels.
async function rpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    const e = new Error(backendMessage(error));
    e.code = error.code;
    throw e;
  }
  return data;
}

export const fiscalStatus = () => rpc('fiscal_status');
export const setEnvironment = env => rpc('set_restaurant_environment', { p_env: env });
export const activateFiscalFr = confirm => rpc('activate_fiscal_fr', { p_confirm: confirm });
export const closeDay = date => rpc('fiscal_close_day', { p_date: date || null });
export const closePeriod = (kind, year, month) =>
  rpc('fiscal_close_period', { p_kind: kind, p_year: year, p_month: month || null });
export const verifyChain = () => rpc('fiscal_verify_chain');
export const archivePeriod = (start, end) => rpc('fiscal_archive_period', { p_start: start, p_end: end });
export const cancelFiscalOrder = (orderId, reason) =>
  rpc('fiscal_cancel_order', { p_order_id: orderId, p_reason: reason });

export async function fetchClosings(restaurantId, limit = 30) {
  const { data, error } = await supabase
    .from('fiscal_closings')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('period_start', { ascending: false })
    .limit(limit);
  if (error) throw new Error(backendMessage(error));
  return data || [];
}
