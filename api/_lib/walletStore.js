// Acces aux donnees du service Wallet (Supabase, cle secrete : bypass RLS).
// Isole ici pour que la logique des endpoints reste testable sans base.

function createWalletStore(supabase) {
  async function getCardBySerial(serial, { withTimestamp = false } = {}) {
    const columns = 'id, restaurant_id, uid_nfc, statut, '
      + (withTimestamp ? 'wallet_updated_at, ' : '')
      + 'customers(id, prenom, nom, points_balance, nombre_visites, loyalty_tiers(nom))';
    const { data, error } = await supabase
      .from('loyalty_cards')
      .select(columns)
      .eq('uid_nfc', serial)
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.customers) return null;
    return {
      serial: data.uid_nfc,
      restaurantId: data.restaurant_id,
      status: data.statut,
      updatedMs: withTimestamp ? Date.parse(data.wallet_updated_at) : null,
      customer: data.customers
    };
  }

  async function getActiveRewards(restaurantId) {
    const { data, error } = await supabase
      .from('rewards')
      .select('id, nom, cout_points, actif')
      .eq('restaurant_id', restaurantId)
      .eq('actif', true);
    if (error) throw error;
    return data || [];
  }

  async function upsertRegistration({ deviceId, passTypeId, serial, pushToken }) {
    const { data: existing, error: readError } = await supabase
      .from('wallet_registrations')
      .select('id')
      .eq('device_library_id', deviceId)
      .eq('pass_type_id', passTypeId)
      .eq('serial_number', serial)
      .maybeSingle();
    if (readError) throw readError;

    if (existing) {
      const { error } = await supabase
        .from('wallet_registrations')
        .update({ push_token: pushToken, maj_le: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
      return 'updated';
    }
    const { error } = await supabase.from('wallet_registrations').insert({
      device_library_id: deviceId,
      pass_type_id: passTypeId,
      serial_number: serial,
      push_token: pushToken
    });
    if (error) throw error;
    return 'created';
  }

  async function deleteRegistration({ deviceId, passTypeId, serial }) {
    const { error } = await supabase
      .from('wallet_registrations')
      .delete()
      .eq('device_library_id', deviceId)
      .eq('pass_type_id', passTypeId)
      .eq('serial_number', serial);
    if (error) throw error;
  }

  // Cartes de cet appareil modifiees apres sinceMs (tout si sinceMs absent).
  async function listUpdatedSerials({ deviceId, passTypeId, sinceMs }) {
    const { data: regs, error } = await supabase
      .from('wallet_registrations')
      .select('serial_number')
      .eq('device_library_id', deviceId)
      .eq('pass_type_id', passTypeId);
    if (error) throw error;
    const serials = [...new Set((regs || []).map(r => r.serial_number))];
    if (!serials.length) return [];

    const { data: cards, error: cardsError } = await supabase
      .from('loyalty_cards')
      .select('uid_nfc, wallet_updated_at')
      .in('uid_nfc', serials);
    if (cardsError) throw cardsError;

    return (cards || [])
      .map(c => ({ serial: c.uid_nfc, updatedMs: Date.parse(c.wallet_updated_at) }))
      .filter(c => sinceMs == null || c.updatedMs > sinceMs);
  }

  async function getCustomerRestaurant(customerId) {
    const { data, error } = await supabase
      .from('customers')
      .select('restaurant_id')
      .eq('id', customerId)
      .maybeSingle();
    if (error) throw error;
    return data ? data.restaurant_id : null;
  }

  // Appareils (jetons de notification) qui detiennent une carte de ce client.
  async function getRegistrationsForCustomer(customerId) {
    const { data: cards, error } = await supabase
      .from('loyalty_cards')
      .select('uid_nfc')
      .eq('customer_id', customerId);
    if (error) throw error;
    const serials = (cards || []).map(c => c.uid_nfc);
    if (!serials.length) return [];

    const { data: regs, error: regsError } = await supabase
      .from('wallet_registrations')
      .select('id, push_token, serial_number')
      .in('serial_number', serials);
    if (regsError) throw regsError;
    return (regs || []).map(r => ({ id: r.id, pushToken: r.push_token, serial: r.serial_number }));
  }

  async function deleteRegistrationsByTokens(pushTokens) {
    if (!pushTokens.length) return;
    const { error } = await supabase.from('wallet_registrations').delete().in('push_token', pushTokens);
    if (error) throw error;
  }

  return {
    getCardBySerial, getActiveRewards, upsertRegistration, deleteRegistration,
    listUpdatedSerials, getCustomerRestaurant, getRegistrationsForCustomer, deleteRegistrationsByTokens
  };
}

module.exports = { createWalletStore };
