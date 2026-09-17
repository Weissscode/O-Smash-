import { PosIcon } from './PosIcon.jsx';
import React from 'react';
import { T } from '../data/theme.js';
import { btn } from '../utils/styles.js';
import { fd } from '../utils/format.js';
import { LS } from '../utils/storage.js';
import { fetchOrders, updateOrder, deleteOrder, deleteOrdersForDate, rowToOrder } from '../utils/ordersApi.js';
import { supabase } from '../supabaseClient.js';
import { signOut } from '../utils/auth.js';
import { Dash } from './Dash.jsx';
import { Analytics } from './Analytics.jsx';
import { LoyaltyDash } from './LoyaltyDash.jsx';

const REFRESH_MS = 20000;

const MANAGER_TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'fidelite', label: 'Fidélité' },
  { key: 'scan', label: 'Scan' }
];

function ManagerInstallButton() {
  const [installPrompt, setInstallPrompt] = React.useState(null);
  const [showHelp, setShowHelp] = React.useState(false);
  const [installed, setInstalled] = React.useState(
    () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );

  React.useEffect(() => {
    const capturePrompt = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const markInstalled = () => {
      setInstalled(true);
      setShowHelp(false);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', markInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement('button', {
      className: 'mr-install-button',
      onClick: install,
      type: 'button',
      title: "Installer O'SMASH Manager"
    },
      /*#__PURE__*/React.createElement('span', { 'aria-hidden': true }, '↓'),
      /*#__PURE__*/React.createElement('span', null, 'Installer')
    ),
    showHelp && /*#__PURE__*/React.createElement('div', {
      className: 'mr-install-backdrop',
      onClick: () => setShowHelp(false)
    },
      /*#__PURE__*/React.createElement('div', {
        className: 'mr-install-sheet',
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'manager-install-title',
        onClick: event => event.stopPropagation()
      },
        /*#__PURE__*/React.createElement('div', { className: 'mr-install-handle' }),
        /*#__PURE__*/React.createElement('h2', { id: 'manager-install-title' }, "Installer O'SMASH Manager"),
        /*#__PURE__*/React.createElement('p', null, "Sur iPhone : touchez Partager, puis « Sur l'écran d'accueil »."),
        /*#__PURE__*/React.createElement('p', null, "Sur Android : ouvrez le menu du navigateur, puis « Installer l'application »."),
        /*#__PURE__*/React.createElement('button', { type: 'button', onClick: () => setShowHelp(false) }, 'Compris')
      )
    )
  );
}

function ManagerTabSwitch({ tab, setTab }) {
  return /*#__PURE__*/React.createElement('div', {
    className: 'osm-manager-tabs',
    style: {
      display: 'flex', gap: 4, margin: '12px 20px 0',
      background: T.bgCard,
      padding: 4, borderRadius: 6,
      border: `1px solid ${T.brd}`,
      boxShadow: 'none',
      flexShrink: 0
    }
  },
    MANAGER_TABS.map(t => /*#__PURE__*/React.createElement('button', {
      key: t.key,
      'aria-current': tab === t.key ? 'page' : undefined,
      className: 'osm-btn-premium',
      onClick: () => t.key === 'scan' ? window.location.assign('/gestion/scan') : setTab(t.key),
      style: {
        flex: 1, padding: '10px 0', borderRadius: 6, border: 'none',
        background: tab === t.key ? T.primaryL : 'transparent',
        color: tab === t.key ? T.primaryD : T.txtSub,
        fontWeight: 600, fontSize: 14, cursor: 'pointer',
        boxShadow: 'none'
      }
    }, <span className="mr-manager-tab-icon"><PosIcon name={t.key}/></span>, t.label))
  );
}

export function ManagerDash({ restaurantId, restaurantName }) {
  const [tab, setTab] = React.useState('dashboard');
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

  // Mise a jour instantanee (sans refresh) quand une commande est creee,
  // modifiee ou supprimee depuis n'importe quel appareil (tablette, PC,
  // telephone). Le polling ci-dessus reste actif en filet de securite si
  // un evenement Realtime est manque (ex: reconnexion reseau).
  React.useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel('dashboard-orders-' + restaurantId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, payload => {
        if (payload.eventType === 'DELETE') {
          setAllOrders(prev => prev.filter(o => o.id !== payload.old.id));
          return;
        }
        const order = rowToOrder(payload.new);
        setAllOrders(prev => prev.some(o => o.id === order.id)
          ? prev.map(o => o.id === order.id ? order : o)
          : [order, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const orders = allOrders.filter(o => o.status !== 'en attente');

  return /*#__PURE__*/React.createElement('div', {
    className: 'osm-manager-shell',
    style: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bgGradient }
  },
    /*#__PURE__*/React.createElement('div', {
      className: 'osm-manager-header',
      style: {
        background: T.bgCard,
        padding: '12px 20px',
        flexShrink: 0,
        boxShadow: 'none'
      }
    },
      /*#__PURE__*/React.createElement('div', { className: 'osm-header-left' }),
      /*#__PURE__*/React.createElement('div', { className: 'osm-header-center' },
        /*#__PURE__*/React.createElement('img', {
          src: '/osmash-logo.png', alt: 'O’SMASH',
          style: { height: 52, width: 52, objectFit: 'contain' }
        }),
        /*#__PURE__*/React.createElement('div', {
          style: { color: T.txt, fontWeight: 600, fontSize: 15, maxWidth: '50vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }, restaurantName || '')
      ),
      /*#__PURE__*/React.createElement('div', { className: 'osm-header-right' },
        /*#__PURE__*/React.createElement(ManagerInstallButton, null),
        /*#__PURE__*/React.createElement('button', {
          className: 'osm-btn-premium',
          onClick: () => signOut(),
          style: btn(T.primaryL, T.txt, { padding: '8px 14px', fontSize: 12, borderRadius: 6, boxShadow: 'none' })
        }, 'Déconnexion')
      )
    ),
    /*#__PURE__*/React.createElement(ManagerTabSwitch, { tab, setTab }),
    tab === 'fidelite'
      ? /*#__PURE__*/React.createElement(LoyaltyDash, { restaurantId })
      : !loaded
      ? /*#__PURE__*/React.createElement('div', {
          style: { textAlign: 'center', padding: 60, color: T.txtSub, fontSize: 14 }
        }, 'Chargement des commandes...')
      : tab === 'analytics'
        ? /*#__PURE__*/React.createElement(Analytics, { orders })
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

