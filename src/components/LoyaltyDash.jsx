import React from 'react';
import { T } from '../data/theme.js';
import { fp, fd } from '../utils/format.js';
import { fetchCustomers, fetchCustomerTransactions } from '../utils/loyaltyApi.js';

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

export function LoyaltyDash({ restaurantId }) {
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
  );
}
