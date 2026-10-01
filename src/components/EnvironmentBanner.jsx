import React from 'react';
import { T } from '../data/theme.js';

// Bandeau d'information (aucune protection ici : voir migration 008).
export function EnvironmentBanner({ envInfo }) {
  if (!envInfo) return null;
  if (envInfo.isTest) {
    return <div role="status" style={{
      background: T.warnL, color: T.warn, borderBottom: `1px solid ${T.warn}`,
      padding: '6px 16px', fontSize: 12, fontWeight: 700, textAlign: 'center', flexShrink: 0
    }}>MODE TEST — données de test (table orders_test) · Fiscalité : OFF · aucune vente réelle</div>;
  }
  if (envInfo.fiscalActive) {
    return <div role="status" style={{
      background: T.okL, color: T.ok, padding: '3px 16px', fontSize: 11,
      fontWeight: 700, textAlign: 'center', flexShrink: 0
    }}>PRODUCTION · Profil fiscal FR actif — ventes verrouillées et journalisées</div>;
  }
  return null;
}
