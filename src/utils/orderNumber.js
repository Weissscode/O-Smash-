import { LS } from './storage.js';
import { fdy } from './format.js';
import { supabase } from '../supabaseClient.js';

// Ancien compteur 100% local : ne garantit PAS l'unicite entre plusieurs
// appareils (tablette / PC / telephone peuvent calculer le meme numero en
// meme temps). Conserve uniquement comme filet de secours hors-ligne.
export function getNextOrderNum() {
  const today = fdy(new Date());
  const saved = LS.get('osm7-counter', {
    date: '',
    num: 0
  });
  let num = saved.date === today ? saved.num + 1 : 1;
  LS.set('osm7-counter', {
    date: today,
    num
  });
  return num;
}

// Source de verite : compteur atomique cote Supabase (fonction
// next_order_num, voir supabase/migration_006_order_counter.sql). Deux
// appareils qui valident au meme instant ne peuvent jamais recevoir le
// meme numero, contrairement au calcul local ci-dessus.
// Si l'appel echoue (hors-ligne, pas de reseau...), on retombe sur le
// compteur local pour ne pas bloquer la prise de commande.
export async function getNextOrderNumRemote(restaurantId) {
  try {
    const { data, error } = await supabase.rpc('next_order_num', {
      p_restaurant_id: restaurantId
    });
    if (error) throw error;
    return { num: data, offline: false };
  } catch (e) {
    return { num: getNextOrderNum(), offline: true };
  }
}
