import React from 'react';
import { T } from '../data/theme.js';
import { btn } from '../utils/styles.js';
import { fd } from '../utils/format.js';
import { LS } from '../utils/storage.js';
import { fetchOrders, deleteOrdersForDate } from '../utils/ordersApi.js';
import { signOut } from '../utils/auth.js';
import { Dash } from './Dash.jsx';
import { ViceCodeLogo } from './ViceCodeLogo.jsx';

const REFRESH_MS = 20000;

export function ManagerDash({ restaurantId, restaurantName }) {
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
    !loaded
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
