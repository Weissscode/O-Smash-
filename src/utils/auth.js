import { supabase } from '../supabaseClient.js';

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpRestaurant(nomRestaurant, email, password) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return { error: authError };

  const user = authData.user;
  const session = authData.session;
  if (!user || !session) {
    return { needsEmailConfirmation: true };
  }

  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .insert({ nom: nomRestaurant, email_contact: email })
    .select()
    .single();
  if (restError) return { error: restError };

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: user.id, restaurant_id: restaurant.id, email, role: 'gerant' });
  if (profileError) return { error: profileError };

  return { data: { user, restaurant } };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getProfile(userId) {
  return supabase
    .from('profiles')
    .select('*, restaurants(*)')
    .eq('id', userId)
    .single();
}
