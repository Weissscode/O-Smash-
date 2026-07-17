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

  // On genere l'id du restaurant nous-memes : tant que le profil n'existe
  // pas encore, la policy de lecture RLS empeche de relire la ligne qu'on
  // vient de creer (.select() apres insert() echouerait silencieusement).
  const restaurantId = crypto.randomUUID();
  const { error: restError } = await supabase
    .from('restaurants')
    .insert({ id: restaurantId, nom: nomRestaurant, email_contact: email });
  if (restError) return { error: restError };

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: user.id, restaurant_id: restaurantId, email, role: 'gerant' });
  if (profileError) return { error: profileError };

  return { data: { user, restaurantId } };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getProfile(userId) {
  return supabase
    .from('profiles')
    .select('*, restaurants(*)')
    .eq('id', userId)
    .maybeSingle();
}
