import React from 'react';
import { LoyaltyDash } from './LoyaltyDash.jsx';
import { PosIcon } from './PosIcon.jsx';

const customers = [
  {
    id: 'preview-1',
    prenom: 'Ouaïss',
    nom: 'Client',
    telephone: '06 •• •• •• 12',
    points_balance: 47,
    nombre_visites: 8,
    total_depense: 126.4,
    loyalty_tiers: { nom: 'Standard' },
    loyalty_cards: [{ statut: 'active' }]
  },
  {
    id: 'preview-2',
    prenom: 'Samira',
    nom: 'Martin',
    telephone: '06 •• •• •• 34',
    points_balance: 82,
    nombre_visites: 13,
    total_depense: 219.8,
    loyalty_tiers: { nom: 'Or' },
    loyalty_cards: [{ statut: 'active' }]
  }
];

const rewards = [
  { id: 'reward-1', nom: 'Frites offertes', cout_points: 25, type: 'produit_offert', actif: true },
  { id: 'reward-2', nom: 'Canadian Cheddar', cout_points: 50, type: 'produit_offert', actif: true },
  { id: 'reward-3', nom: 'Menu offert', cout_points: 100, type: 'produit_offert', actif: false }
];

const transactions = [
  { id: 'tx-1', type: 'gain', description: 'Commande #184', points_delta: 13, cree_le: '2026-09-16T12:00:00Z' },
  { id: 'tx-2', type: 'utilisation_recompense', description: 'Canadian Cheddar offert', points_delta: -50, cree_le: '2026-09-14T12:00:00Z' }
];

const previewDataSource = {
  fetchCustomers: async () => customers,
  fetchCustomerTransactions: async () => transactions,
  fetchAllRewards: async () => rewards,
  createReward: async () => ({ id: 'preview' }),
  setRewardActive: async () => undefined
};

export function LoyaltyPreview() {
  return <div className="osm-manager-shell" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f6f6f4' }}>
    <p style={{ margin: 0, padding: 6, background: '#f0edf2', color: '#62666b', font: '400 12px Roboto, sans-serif', textAlign: 'center' }}>Aperçu local, données de démonstration</p>
    <header className="osm-manager-header" style={{ background: '#fff', padding: '12px 20px' }}>
      <div className="osm-header-left" />
      <div className="osm-header-center">
        <img src="/osmash-logo.png" alt="O’SMASH" width="52" height="52" style={{ objectFit: 'contain' }} />
        <span style={{ font: '500 15px Roboto, sans-serif' }}>O’SMASH</span>
      </div>
      <div className="osm-header-right" />
    </header>
    <nav className="osm-manager-tabs" style={{ display: 'flex', gap: 4, margin: '12px 20px 0', padding: 4, border: '1px solid #e1dfdb', borderRadius: 6, background: '#fff' }}>
      {['dashboard', 'analytics', 'fidelite', 'scan'].map(item => <button key={item} type="button" aria-current={item === 'fidelite' ? 'page' : undefined} style={{ flex: 1, minHeight: 44, border: 0, borderRadius: 6, background: item === 'fidelite' ? '#e8ecf3' : 'transparent', color: item === 'fidelite' ? '#24292e' : '#62666b', font: '500 13px Roboto, sans-serif' }}>
        <span className="mr-manager-tab-icon"><PosIcon name={item} /></span>{item === 'fidelite' ? 'Fidélité' : item === 'scan' ? 'Scan' : item[0].toUpperCase() + item.slice(1)}
      </button>)}
    </nav>
    <LoyaltyDash restaurantId="preview" dataSource={previewDataSource} />
  </div>;
}
