import React from 'react';
import { T } from '../data/theme.js';
import { btn } from '../utils/styles.js';
import { fd } from '../utils/format.js';
import { LS } from '../utils/storage.js';
import { fetchOrders, deleteOrdersForDate } from '../utils/ordersApi.js';
import { signOut } from '../utils/auth.js';
import { Dash } from './Dash.jsx';
import { LoyaltyDash } from './LoyaltyDash.jsx';
import { ViceCodeLogo } from './ViceCodeLogo.jsx';

const REFRESH_MS = 20000;

const MANAGER_TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'fidelite', label: 'Fidélité' }
];

function ManagerTabSwitch({ tab, setTab }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex', gap: 4, margin: '12px 20px 0',
      background: T.bgSide, padding: 4, borderRadius: 15,
      border: `1px solid ${T.brd}`, flexShrink: 0
    }
  },
    MANAGER_TABS.map(t => /*#__PURE__*/React.createElement('button', {
      key: t.key,
      onClick: () => setTab(t.key),
      style: {
        flex: 1, padding: '10px 0', borderRadius: 11, border: 'none',
        background: tab === t.key ? T.bgCard : 'transparent',
        color: tab === t.key ? T.primaryD : T.txtSub,
        fontWeight: 700, fontSize: 14, cursor: 'pointer',
        boxShadow: tab === t.key ? T.sh : 'none'
      }
    }, t.label))
  );
}

export function ManagerDash({ restaurantId, restaurantName }) {
  const [tab, setTab] = React.useState('dashboard');
  const [allOrders, setAllOrders] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchOrders(restaurantId).then(o => { if (!cancelled) setAllOrders(o); }).finally(() => { if (!cancelled) setLoaded(true); });
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [restaurantId]);

  const orders = allOrders.filter(o => o.status !== 'en attente');
  const phoneOrders = allOrders.filter(o => o.status === 'en attente');

  return /*#__PURE__*/React.createElement('div', {
    style: { minHeight: '100vh', background: T.bg }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        background: T.txt,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }
    },
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
        /*#__PURE__*/React.createElement(ViceCodeLogo, { scale: 0.4 }),
        /*#__PURE__*/React.createElement('div', { style: { color: '#fff', fontWeight: 700, fontSize: 14 } }, restaurantName || '')
      ),
      /*#__PURE__*/React.createElement('button', {
        onClick: () => signOut(),
        style: btn('rgba(255,255,255,0.12)', '#fff', { padding: '8px 14px', fontSize: 12 })
      }, 'Déconnexion')
    ),
    /*#__PURE__*/React.createElement(ManagerTabSwitch, { tab, setTab }),
    tab === 'fidelite'
      ? /*#__PURE__*/React.createElement(LoyaltyDash, { restaurantId })
      : !loaded
      ? /*#__PURE__*/React.createElement('div', {
          style: { textAlign: 'center', padding: 60, color: T.txtSub, fontSize: 14 }
        }, 'Chargement des commandes...')
      : /*#__PURE__*/React.createElement(Dash, {
          orders,
          phoneOrders,
          onReset: async () => {
            if (window.confirm('Reset toutes les commandes du jour ?')) {
              const today = fd(new Date());
              setAllOrders(p => p.filter(o => fd(o.date) !== today));
              await deleteOrdersForDate(restaurantId, today);
              LS.set('osm7-counter', { date: '', num: 0 });
            }
          }
        })
  );
}
