import React from 'react';
import { T } from './data/theme.js';
import { Modal } from './components/Modal.jsx';
import { Tag } from './components/Tag.jsx';
import { Chip } from './components/Chip.jsx';
import { SL } from './components/SL.jsx';
import { Logo } from './components/Logo.jsx';
import { PinModal } from './components/PinModal.jsx';

export default function App() {
  const [showPin, setShowPin] = React.useState(false);
  const [chipActive, setChipActive] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  return /*#__PURE__*/React.createElement("div", {
    style: { padding: 40, fontFamily: 'sans-serif', background: T.bg, minHeight: '100vh' }
  },
    /*#__PURE__*/React.createElement(Logo, { size: 80 }),
    /*#__PURE__*/React.createElement("h1", null, "O'SMASH"),
    /*#__PURE__*/React.createElement("p", null, "Migration Vite + React en cours (Etape 1) - verification des 6 premiers composants."),
    /*#__PURE__*/React.createElement(SL, { title: 'Composants' }),
    /*#__PURE__*/React.createElement(Tag, { label: 'demo', color: T.primary }),
    ' ',
    /*#__PURE__*/React.createElement(Chip, {
      label: 'Chip cliquable',
      active: chipActive,
      onClick: () => setChipActive(a => !a)
    }),
    /*#__PURE__*/React.createElement("div", { style: { marginTop: 16 } },
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowModal(true)
      }, "Ouvrir Modal"),
      ' ',
      /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowPin(true)
      }, "Ouvrir PinModal")
    ),
    showModal && /*#__PURE__*/React.createElement(Modal, {
      onClose: () => setShowModal(false)
    }, /*#__PURE__*/React.createElement("div", {
      style: { background: '#fff', padding: 24, borderRadius: 12 }
    }, "Contenu de la Modal")),
    showPin && /*#__PURE__*/React.createElement(PinModal, {
      onOk: () => setShowPin(false),
      onClose: () => setShowPin(false)
    })
  );
}
