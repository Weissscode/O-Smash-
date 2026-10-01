import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Retours haptiques centralisés : un vocabulaire court et cohérent.
 * Silencieux sur le web et en cas d'échec (jamais bloquant).
 */
const run = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => undefined);
};

export const haptics = {
  /** Sélection d'une option, d'un onglet, d'une catégorie. */
  selection: () => run(() => Haptics.selectionAsync()),
  /** Appui sur un bouton principal. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Ajout au panier, action importante réussie. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Choix obligatoire manquant, action refusée. */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
