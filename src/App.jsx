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

export default function App() {
  const [showPin, setShowPin] = React.useState(false);
  const [chipActive, setChipActive] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [showBurgerCust, setShowBurgerCust] = React.useState(false);
  const [showRizCust, setShowRizCust] = React.useState(false);
  const [showTopModal, setShowTopModal] = React.useState(false);

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
      }, "Choisir des Toppings")
    ),
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
    })
  );
}
