import React from 'react';
import { T } from '../data/theme.js';
import { btn } from '../utils/styles.js';
import { fd } from '../utils/format.js';
import { LS } from '../utils/storage.js';
import { fetchOrders, updateOrder, deleteOrder, deleteOrdersForDate } from '../utils/ordersApi.js';
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
      fetchOrders(restaurantId, 90).then(o => { if (!cancelled) setAllOrders(o); }).finally(() => { if (!cancelled) setLoaded(true); });
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [restaurantId]);

  const orders = allOrders.filter(o => o.status !== 'en attente');

  return /*#__PURE__*/React.createElement('div', {
    style: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bgGradient }
  },
    /*#__PURE__*/React.createElement('div', {
      className: 'osm-manager-header',
      style: {
        background: 'linear-gradient(160deg, #4C3A7C 0%, #5F4A9B 55%, #3A2C63 100%)',
        padding: '12px 20px',
        flexShrink: 0,
        boxShadow: '0 6px 20px rgba(30,15,55,0.3)'
      }
    },
      /*#__PURE__*/React.createElement('div', { className: 'osm-header-left' }),
      /*#__PURE__*/React.createElement('div', { className: 'osm-header-center' },
        /*#__PURE__*/React.createElement(ViceCodeLogo, { scale: 0.55 }),
        /*#__PURE__*/React.createElement('div', {
          style: { color: '#fff', fontWeight: 700, fontSize: 15, maxWidth: '50vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }, restaurantName || '')
      ),
      /*#__PURE__*/React.createElement('div', { className: 'osm-header-right' },
        /*#__PURE__*/React.createElement('button', {
          className: 'osm-btn-premium',
          onClick: () => signOut(),
          style: btn('rgba(255,255,255,0.16)', '#fff', { padding: '8px 14px', fontSize: 12, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' })
        }, 'Déconnexion')
      )
    ),
    !loaded
      ? /*#__PURE__*/React.createElement('div', {
          style: { textAlign: 'center', padding: 60, color: T.txtSub, fontSize: 14 }
        }, 'Chargement des commandes...')
      : /*#__PURE__*/React.createElement(Dash, {
          orders,
          onReset: async () => {
            if (window.confirm('Reset toutes les commandes du jour ?')) {
              const today = fd(new Date());
              setAllOrders(p => p.filter(o => fd(o.date) !== today));
              await deleteOrdersForDate(restaurantId, today);
              LS.set('osm7-counter', { date: '', num: 0 });
            }
          },
          onUpdateOrder: async (id, updates) => {
            await updateOrder(id, updates);
            setAllOrders(p => p.map(o => o.id === id ? { ...o, ...updates } : o));
          },
          onDeleteOrder: async id => {
            await deleteOrder(id);
            setAllOrders(p => p.filter(o => o.id !== id));
          }
        })
  );
}
