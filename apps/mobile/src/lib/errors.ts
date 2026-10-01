/**
 * Erreurs applicatives normalisées. Règle produit : on n'avale jamais une
 * erreur réseau ou de paiement en silence — chaque écran affiche un état
 * d'erreur clair avec une action ("Réessayer").
 */
export type AppErrorKind = 'network' | 'not_found' | 'unauthorized' | 'not_configured' | 'unknown';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  constructor(kind: AppErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AppError';
    this.kind = kind;
  }
}

const NETWORK_HINTS = ['network request failed', 'failed to fetch', 'networkerror', 'timeout', 'fetch failed'];

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (NETWORK_HINTS.some((h) => message.toLowerCase().includes(h))) {
    return new AppError('network', 'Connexion impossible. Vérifie ton réseau.', { cause: error });
  }
  return new AppError('unknown', 'Une erreur inattendue est survenue.', { cause: error });
}

export function userMessage(error: unknown): { title: string; description: string } {
  const e = toAppError(error);
  switch (e.kind) {
    case 'network':
      return { title: 'Pas de connexion', description: 'Vérifie ton réseau puis réessaie.' };
    case 'not_found':
      return { title: 'Introuvable', description: e.message };
    case 'unauthorized':
      return { title: 'Connexion requise', description: 'Connecte-toi pour continuer.' };
    case 'not_configured':
      return { title: 'Service indisponible', description: e.message };
    default:
      return { title: 'Oups', description: e.message };
  }
}
