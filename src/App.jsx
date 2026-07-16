import React from 'react';
import { T } from './data/theme.js';
import { BURGERS, RIZ } from './data/products.js';
import { Modal } from './components/Modal.jsx';
import { Tag } from './components/Tag.jsx';
import { Chip } from './components/Chip.jsx';
import { SL } from './components/SL.jsx';
import { Logo } from './components/Logo.jsx';
import { PinModal } from './components/PinModal.jsx';
import { BurgerCust } from './components/BurgerCust.jsx';
import { RizCust } from './components/RizCust.jsx';
import { TopModal } from './components/TopModal.jsx';
import { BarChart } from './components/BarChart.jsx';
import { AreaChart } from './components/AreaChart.jsx';
import { PieChart } from './components/PieChart.jsx';
import { InsightsCard } from './components/InsightsCard.jsx';
import { StockView } from './components/StockView.jsx';
import { Dash } from './components/Dash.jsx';

const mkOrder = (num, hour, min, items, payment, phone) => ({
  id: 'o' + num, num, date: new Date(new Date().setHours(hour, min)).toISOString(),
  items, total: items.reduce((s, i) => s + i.total, 0), payment, phone: phone || null, status: 'ok'
});
const FAKE_FULL_ORDERS = [
  mkOrder(101, 12, 15, [{ pid: 'b-orig', name: "O'Smash Original", qty: 1, total: 6.5 }, { pid: 'dr-coca', name: 'Coca-Cola 33cl', qty: 1, total: 2 }], 'Especes'),
  mkOrder(102, 12, 45, [{ pid: 'b-smoke', name: 'O\'Smash Smoke', qty: 2, total: 17 }], 'CB'),
  mkOrder(103, 19, 30, [{ pid: 'r-riz', name: 'Riz Crousty', qty: 1, total: 9.5 }, { pid: 'mk-oreo', name: 'Milkshake Oreo', qty: 1, total: 6 }], 'Especes', '0612345678'),
  mkOrder(104, 19, 50, [{ pid: 'b-orig', name: "O'Smash Original", qty: 1, total: 6.5 }], 'CB'),
  mkOrder(105, 20, 10, [{ pid: 'b-smoke', name: "O'Smash Smoke", qty: 1, total: 8.5 }, { pid: 'dr-coca', name: 'Coca-Cola 33cl', qty: 2, total: 4 }], 'Especes'),
];
const FAKE_ORDERS = FAKE_FULL_ORDERS;
const BAR_DATA = [
  { label: 'Lun', value: 120 },
  { label: 'Mar', value: 200 },
  { label: 'Mer', value: 150 },
  { label: 'Jeu', value: 260 },
  { label: 'Ven', value: 310 },
];
const PIE_DATA = [
  { label: 'Especes', value: 60, color: '#10B981' },
  { label: 'CB', value: 40, color: '#2563EB' },
];

export default function App() {
  const [showPin, setShowPin] = React.useState(false);
  const [chipActive, setChipActive] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showBurgerCust, setShowBurgerCust] = React.useState(false);
  const [showRizCust, setShowRizCust] = React.useState(false);
  const [showTopModal, setShowTopModal] = React.useState(false);
  const [showStockView, setShowStockView] = React.useState(false);
  const [stockOut, setStockOut] = React.useState([]);
  const toggleStock = id => setStockOut(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return /*#__PURE__*/React.createElement("div", {
    style: { padding: 40, fontFamily: 'sans-serif', background: T.bg, minHeight: '100vh' }
  },
    /*#__PURE__*/React.createElement(Logo, { size: 80 }),
    /*#__PURE__*/React.createElement("h1", null, "O'SMASH"),
    /*#__PURE__*/React.createElement("p", null, "Migration Vite + React en cours (Etape 1) - verification du 2e lot de composants (personnalisation produits)."),
    /*#__PURE__*/React.createElement(SL, { title: 'Composants' }),
    /*#__PURE__*/React.createElement(Tag, { label: 'demo', color: T.primary }),
    ' ',
    /*#__PURE__*/React.createElement(Chip, {
      label: 'Chip cliquable',
      active: chipActive,
      onClick: () => setChipActive(a => !a)
    }),
    /*#__PURE__*/React.createElement("div", { style: { marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' } },
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowModal(true)
      }, "Ouvrir Modal"),
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowPin(true)
      }, "Ouvrir PinModal"),
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowBurgerCust(true)
      }, "Personnaliser un Burger"),
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowRizCust(true)
      }, "Personnaliser un Riz"),
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowTopModal(true)
      }, "Choisir des Toppings"),
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowStockView(true)
      }, "Ouvrir StockView")
    ),
    /*#__PURE__*/React.createElement(SL, { title: 'Dashboard (charts & insights)' }),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 } },
      /*#__PURE__*/React.createElement("div", { style: { width: 260 } },
        /*#__PURE__*/React.createElement("p", null, "BarChart"),
        /*#__PURE__*/React.createElement(BarChart, { data: BAR_DATA, color: T.primary })
      ),
      /*#__PURE__*/React.createElement("div", { style: { width: 260 } },
        /*#__PURE__*/React.createElement("p", null, "AreaChart"),
        /*#__PURE__*/React.createElement(AreaChart, { data: BAR_DATA, color: T.primary, gradId: 'g1' })
      ),
      /*#__PURE__*/React.createElement("div", { style: { width: 260 } },
        /*#__PURE__*/React.createElement("p", null, "PieChart"),
        /*#__PURE__*/React.createElement(PieChart, { data: PIE_DATA, centerLabel: 'Paiements' })
      )
    ),
    /*#__PURE__*/React.createElement(InsightsCard, { orders: FAKE_ORDERS }),
    /*#__PURE__*/React.createElement(SL, { title: 'Dash (tableau de bord complet)' }),
    /*#__PURE__*/React.createElement(Dash, {
      orders: FAKE_FULL_ORDERS,
      phoneOrders: [],
      onReset: () => console.log('reset'),
      onSendReport: () => console.log('send report')
    }),
    showModal && /*#__PURE__*/React.createElement(Modal, {
      onClose: () => setShowModal(false)
    }, /*#__PURE__*/React.createElement("div", {
      style: { background: '#fff', padding: 24, borderRadius: 12 }
    }, "Contenu de la Modal")),
    showPin && /*#__PURE__*/React.createElement(PinModal, {
      onOk: () => setShowPin(false),
      onClose: () => setShowPin(false)
    }),
    showBurgerCust && /*#__PURE__*/React.createElement(BurgerCust, {
      product: BURGERS[0],
      onOk: (cust, extra, basePrice) => { console.log('Burger custom OK', cust, extra, basePrice); setShowBurgerCust(false); },
      onClose: () => setShowBurgerCust(false)
    }),
    showRizCust && /*#__PURE__*/React.createElement(RizCust, {
      product: RIZ[0],
      onOk: (cust, extra, basePrice) => { console.log('Riz custom OK', cust, extra, basePrice); setShowRizCust(false); },
      onClose: () => setShowRizCust(false)
    }),
    showTopModal && /*#__PURE__*/React.createElement(TopModal, {
      product: { name: 'Milkshake Test', price: 6 },
      onOk: (tops) => { console.log('Toppings OK', tops); setShowTopModal(false); },
      onClose: () => setShowTopModal(false)
    }),
    showStockView && /*#__PURE__*/React.createElement(Modal, {
      onClose: () => setShowStockView(false)
    }, /*#__PURE__*/React.createElement(StockView, {
      stockOut,
      toggle: toggleStock,
      customProds: [],
      onSaveCP: () => {}
    }))
  );
}
