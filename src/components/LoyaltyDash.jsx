import React from 'react';
import { T } from '../data/theme.js';
import { fp, fd } from '../utils/format.js';
import { fetchCustomers, fetchCustomerTransactions, fetchAllRewards, createReward, setRewardActive } from '../utils/loyaltyApi.js';

const STATUT_LABELS = {
  active: 'Active',
  bloquee: 'Bloquée',
  perdue: 'Perdue',
  remplacee: 'Remplacée',
  disponible: 'Non assignée',
  desactivee: 'Désactivée'
};

const STATUT_COLORS = {
  active: { bg: T.okL, fg: T.ok },
  bloquee: { bg: T.noL, fg: T.no },
  perdue: { bg: T.noL, fg: T.no },
  remplacee: { bg: T.warnL, fg: T.warn },
  disponible: { bg: T.brdL, fg: T.txtSub },
  desactivee: { bg: T.brdL, fg: T.txtSub }
};

function StatutBadge({ statut }) {
  const c = STATUT_COLORS[statut] || STATUT_COLORS.disponible;
  return /*#__PURE__*/React.createElement('span', {
    style: {
      background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700,
      padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap'
    }
  }, STATUT_LABELS[statut] || statut);
}

function TransactionRow({ tx }) {
  const positif = tx.points_delta >= 0;
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: `1px solid ${T.brdL}`, fontSize: 13
    }
  },
    /*#__PURE__*/React.createElement('div', null,
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, color: T.txt } }, tx.type),
      /*#__PURE__*/React.createElement('div', { style: { color: T.txtMuted, fontSize: 11 } }, fd(tx.cree_le))
    ),
    /*#__PURE__*/React.createElement('div', {
      style: { fontWeight: 800, color: positif ? T.ok : T.no }
    }, `${positif ? '+' : ''}${tx.points_delta} pts`)
  );
}

function CustomerDetail({ customer, onClose }) {
  const [tx, setTx] = React.useState(null);

  React.useEffect(() => {
    fetchCustomerTransactions(customer.id).then(setTx).catch(() => setTx([]));
  }, [customer.id]);

  const card = (customer.loyalty_cards || []).find(c => c.statut === 'active') || (customer.loyalty_cards || [])[0];

  return /*#__PURE__*/React.createElement('div', {
    style: {
      position: 'fixed', inset: 0, background: 'rgba(20,10,35,0.4)', zIndex: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    },
    onClick: onClose
  },
    /*#__PURE__*/React.createElement('div', {
      style: { background: T.bgCard, borderRadius: 20, padding: 24, maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: T.shSoft },
      onClick: e => e.stopPropagation()
    },
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
        /*#__PURE__*/React.createElement('div', null,
          /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 19 } }, `${customer.prenom} ${customer.nom || ''}`),
          /*#__PURE__*/React.createElement('div', { style: { color: T.txtSub, fontSize: 13, marginTop: 2 } }, customer.telephone || 'Pas de téléphone')
        ),
        /*#__PURE__*/React.createElement('button', {
          onClick: onClose,
          style: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: T.txtSub }
        }, '✕')
      ),
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 16 } },
        /*#__PURE__*/React.createElement('div', { style: { flex: 1, background: T.gradViolet, borderRadius: 12, padding: 12, textAlign: 'center' } },
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: T.primaryD } }, customer.points_balance),
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, color: T.primaryD } }, 'points')
        ),
        /*#__PURE__*/React.createElement('div', { style: { flex: 1, background: T.gradGreen, borderRadius: 12, padding: 12, textAlign: 'center' } },
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: T.ok } }, customer.nombre_visites),
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, color: T.ok } }, 'visites')
        ),
        /*#__PURE__*/React.createElement('div', { style: { flex: 1, background: T.gradOrange, borderRadius: 12, padding: 12, textAlign: 'center' } },
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: T.warn } }, fp(customer.total_depense || 0)),
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, color: T.warn } }, 'dépensés')
        )
      ),
      card && /*#__PURE__*/React.createElement('div', { style: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 } },
        /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, color: T.txtSub } }, 'Carte :'),
        /*#__PURE__*/React.createElement(StatutBadge, { statut: card.statut })
      ),
      /*#__PURE__*/React.createElement('div', { style: { marginTop: 20, fontWeight: 700, fontSize: 13, color: T.txtSub } }, 'Historique des points'),
      tx === null && /*#__PURE__*/React.createElement('div', { style: { color: T.txtMuted, fontSize: 13, marginTop: 8 } }, 'Chargement...'),
      tx && tx.length === 0 && /*#__PURE__*/React.createElement('div', { style: { color: T.txtMuted, fontSize: 13, marginTop: 8 } }, 'Aucun mouvement pour l’instant.'),
      tx && tx.length > 0 && /*#__PURE__*/React.createElement('div', { style: { marginTop: 6 } }, tx.map(t => /*#__PURE__*/React.createElement(TransactionRow, { key: t.id, tx: t })))
    )
  );
}

const REWARD_TYPES = [
  { value: 'produit_offert', label: 'Produit offert' },
  { value: 'reduction_pourcent', label: 'Réduction %' },
  { value: 'reduction_montant', label: 'Réduction €' },
  { value: 'cadeau', label: 'Cadeau' }
];

function RewardForm({ onCreated }) {
  const [nom, setNom] = React.useState('');
  const [coutPoints, setCoutPoints] = React.useState('');
  const [type, setType] = React.useState('produit_offert');
  const [valeur, setValeur] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!nom.trim() || !coutPoints) return;
    setSaving(true);
    try {
      const reward = await createReward(onCreated.restaurantId, {
        nom: nom.trim(),
        coutPoints: parseInt(coutPoints, 10),
        type,
        valeur: valeur ? parseFloat(valeur) : null
      });
      onCreated.callback(reward);
      setNom(''); setCoutPoints(''); setValeur('');
    } catch (e2) {
      window.alert('Erreur lors de la création de la récompense.');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    padding: '9px 12px', borderRadius: 10, border: `1px solid ${T.brd}`, fontSize: 13, boxSizing: 'border-box'
  };

  return /*#__PURE__*/React.createElement('form', {
    onSubmit: submit,
    style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: T.bgCard, padding: 16, borderRadius: 16, boxShadow: T.sh, marginBottom: 16 }
  },
    /*#__PURE__*/React.createElement('input', { placeholder: 'Nom (ex: Frites offertes)', value: nom, onChange: e => setNom(e.target.value), style: { ...inputStyle, flex: '1 1 180px' } }),
    /*#__PURE__*/React.createElement('input', { placeholder: 'Coût en points', type: 'number', value: coutPoints, onChange: e => setCoutPoints(e.target.value), style: { ...inputStyle, width: 130 } }),
    /*#__PURE__*/React.createElement('select', { value: type, onChange: e => setType(e.target.value), style: { ...inputStyle, width: 160 } },
      REWARD_TYPES.map(t => /*#__PURE__*/React.createElement('option', { key: t.value, value: t.value }, t.label))
    ),
    /*#__PURE__*/React.createElement('input', { placeholder: 'Valeur (optionnel)', type: 'number', value: valeur, onChange: e => setValeur(e.target.value), style: { ...inputStyle, width: 130 } }),
    /*#__PURE__*/React.createElement('button', {
      type: 'submit', disabled: saving || !nom.trim() || !coutPoints,
      style: { padding: '10px 18px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }
    }, saving ? '...' : '+ Ajouter')
  );
}

function RewardsAdmin({ restaurantId }) {
  const [rewards, setRewards] = React.useState(null);

  const load = React.useCallback(() => {
    fetchAllRewards(restaurantId).then(setRewards).catch(() => setRewards([]));
  }, [restaurantId]);

  React.useEffect(() => { load(); }, [load]);

  async function toggle(reward) {
    await setRewardActive(reward.id, !reward.actif).catch(() => {});
    load();
  }

  return /*#__PURE__*/React.createElement('div', null,
    /*#__PURE__*/React.createElement(RewardForm, { onCreated: { restaurantId, callback: load } }),
    rewards === null && /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: 40, color: T.txtSub } }, 'Chargement...'),
    rewards && rewards.length === 0 && /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: 40, color: T.txtSub } }, 'Aucune récompense pour l’instant.'),
    rewards && rewards.length > 0 && /*#__PURE__*/React.createElement('div', { style: { background: T.bgCard, borderRadius: 16, boxShadow: T.sh, overflow: 'hidden' } },
      rewards.map((r, i) => /*#__PURE__*/React.createElement('div', {
        key: r.id,
        style: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
          borderBottom: i < rewards.length - 1 ? `1px solid ${T.brdL}` : 'none'
        }
      },
        /*#__PURE__*/React.createElement('div', null,
          /*#__PURE__*/React.createElement('div', { style: { fontWeight: 700, fontSize: 14 } }, r.nom),
          /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub } }, `${r.cout_points} pts · ${REWARD_TYPES.find(t => t.value === r.type)?.label || r.type}`)
        ),
        /*#__PURE__*/React.createElement('button', {
          onClick: () => toggle(r),
          style: {
            padding: '6px 14px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            background: r.actif ? T.okL : T.brdL, color: r.actif ? T.ok : T.txtSub
          }
        }, r.actif ? 'Active' : 'Désactivée')
      ))
    )
  );
}

export function LoyaltyDash({ restaurantId }) {
  const [subTab, setSubTab] = React.useState('clients');
  const [customers, setCustomers] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    if (!restaurantId) return;
    fetchCustomers(restaurantId).then(setCustomers).catch(() => setCustomers([]));
  }, [restaurantId]);

  const filtered = (customers || []).filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (c.prenom || '').toLowerCase().includes(q)
      || (c.nom || '').toLowerCase().includes(q)
      || (c.telephone || '').includes(q);
  });

  return /*#__PURE__*/React.createElement('div', { style: { padding: '16px 20px 40px' } },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
      ['clients', 'recompenses'].map(k => /*#__PURE__*/React.createElement('button', {
        key: k,
        onClick: () => setSubTab(k),
        style: {
          padding: '8px 16px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          background: subTab === k ? T.primary : T.bgCard, color: subTab === k ? '#fff' : T.txtSub, boxShadow: T.sh
        }
      }, k === 'clients' ? 'Clients' : 'Récompenses'))
    ),

    subTab === 'recompenses' && /*#__PURE__*/React.createElement(RewardsAdmin, { restaurantId }),

    subTab === 'clients' && /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement('input', {
      placeholder: 'Rechercher un client (nom, téléphone)...',
      value: search,
      onChange: e => setSearch(e.target.value),
      style: {
        width: '100%', maxWidth: 360, padding: '10px 14px', borderRadius: 12,
        border: `1px solid ${T.brd}`, fontSize: 14, marginBottom: 16, boxSizing: 'border-box'
      }
    }),

    customers === null && /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: 40, color: T.txtSub } }, 'Chargement...'),
    customers && customers.length === 0 && /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', padding: 40, color: T.txtSub } }, 'Aucun client fidélité pour l’instant — les inscriptions se font depuis /scan.'),

    customers && customers.length > 0 && /*#__PURE__*/React.createElement('div', {
      style: { overflowX: 'auto', background: T.bgCard, borderRadius: 16, boxShadow: T.sh }
    },
      /*#__PURE__*/React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 } },
        /*#__PURE__*/React.createElement('thead', null,
          /*#__PURE__*/React.createElement('tr', { style: { textAlign: 'left', color: T.txtSub, fontSize: 11, textTransform: 'uppercase' } },
            ['Client', 'Téléphone', 'Palier', 'Points', 'Visites', 'Dépensé', 'Carte', 'Depuis'].map(h =>
              /*#__PURE__*/React.createElement('th', { key: h, style: { padding: '10px 14px', borderBottom: `1px solid ${T.brd}` } }, h)
            )
          )
        ),
        /*#__PURE__*/React.createElement('tbody', null,
          filtered.map(c => {
            const card = (c.loyalty_cards || []).find(x => x.statut === 'active') || (c.loyalty_cards || [])[0];
            return /*#__PURE__*/React.createElement('tr', {
              key: c.id,
              onClick: () => setSelected(c),
              style: { cursor: 'pointer', borderBottom: `1px solid ${T.brdL}` }
            },
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', fontWeight: 700 } }, `${c.prenom} ${c.nom || ''}`),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', color: T.txtSub } }, c.telephone || '—'),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', color: T.txtSub } }, c.loyalty_tiers ? c.loyalty_tiers.nom : '—'),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', fontWeight: 800, color: T.primaryD } }, c.points_balance),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', color: T.txtSub } }, c.nombre_visites),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', color: T.txtSub } }, fp(c.total_depense || 0)),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px' } }, card ? /*#__PURE__*/React.createElement(StatutBadge, { statut: card.statut }) : '—'),
              /*#__PURE__*/React.createElement('td', { style: { padding: '10px 14px', color: T.txtMuted } }, fd(c.cree_le))
            );
          })
        )
      )
    ),

    selected && /*#__PURE__*/React.createElement(CustomerDetail, { customer: selected, onClose: () => setSelected(null) })
    )
  );
}
