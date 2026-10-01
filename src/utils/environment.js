// Environment Router : decide, a partir de l'etat du restaurant lu cote
// Supabase, dans quelle table vont les commandes (TEST ou PRODUCTION) et si
// le moteur fiscal est actif. Un seul code metier ; seule la cible change.
//
// IMPORTANT : ce module ne PROTEGE rien. La separation TEST/PRODUCTION et le
// verrou fiscal sont imposes par PostgreSQL (migration 008 : RLS + triggers).
// Cote React on ne fait que choisir la bonne table et informer l'utilisateur.

export const ENVIRONMENTS = { TEST: 'test', PRODUCTION: 'production' };

export function ordersTable(environment) {
  return environment === ENVIRONMENTS.TEST ? 'orders_test' : 'orders';
}

// Valeur de repli si la migration 008 n'est pas encore appliquee (colonnes
// absentes) : on conserve le comportement historique (production, sans fiscalite).
export function describeEnvironment(restaurant) {
  const environment = restaurant && restaurant.environment === ENVIRONMENTS.TEST
    ? ENVIRONMENTS.TEST
    : ENVIRONMENTS.PRODUCTION;
  const fiscalProfile = restaurant && restaurant.fiscal_profile === 'FR' ? 'FR' : 'NONE';
  return {
    environment,
    fiscalProfile,
    isTest: environment === ENVIRONMENTS.TEST,
    fiscalActive: environment === ENVIRONMENTS.PRODUCTION && fiscalProfile === 'FR',
    table: ordersTable(environment)
  };
}

// Erreur renvoyee par PostgreSQL (SQLSTATE a 5 caracteres : FS001, 42501...)
// = refus du backend, a ne JAMAIS rejouer. Une coupure reseau n'a pas de code.
export function isBackendRejection(error) {
  return !!(error && typeof error.code === 'string' && /^[0-9A-Z]{5}$/.test(error.code));
}

// "FISCAL_LOCKED: message" -> "message" (affichable a l'utilisateur).
export function backendMessage(error) {
  const raw = (error && error.message) || 'Operation refusee';
  return raw.replace(/^FISCAL_[A-Z_]+:\s*/, '');
}
