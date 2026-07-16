import React from 'react';
import { T } from '../data/theme.js';
import { CR } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { Modal } from './Modal.jsx';
import { Chip } from './Chip.jsx';
import { SL } from './SL.jsx';

export function RizCust({
  product,
  initial,
  onOk,
  onClose
}) {
  const def = {
    type: '',
    retraits: [],
    note: ''
  };
  const [s, setS] = React.useState(initial ? {
    ...def,
    ...initial
  } : def);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(92vw,480px)',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px',
      borderBottom: `1px solid ${T.brd}`,
      background: `linear-gradient(135deg,${T.primaryL},#F0EAFF)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.txt
    }
  }, product.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 22px'
    }
  }, /*#__PURE__*/React.createElement(SL, {
    title: "TYPE",
    color: T.warn
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 20
    }
  }, CR.types.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setS(p => ({
      ...p,
      type: t
    })),
    style: {
      padding: 20,
      borderRadius: 12,
      border: s.type === t ? `2.5px solid ${T.warn}` : `1.5px solid ${T.brd}`,
      background: s.type === t ? T.warnL : T.bgCard,
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
      color: s.type === t ? T.warn : T.txtSub,
      textAlign: 'center'
    }
  }, t))), /*#__PURE__*/React.createElement(SL, {
    title: "RETRAITS",
    color: T.no
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 7,
      marginBottom: 16
    }
  }, CR.retraits.map((r, i) => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    label: r,
    active: s.retraits.includes(r),
    onClick: () => setS(p => ({
      ...p,
      retraits: p.retraits.includes(r) ? p.retraits.filter(x => x !== r) : [...p.retraits, r]
    })),
    clr: T.no
  }))), /*#__PURE__*/React.createElement(SL, {
    title: "REMARQUE",
    color: T.txtSub
  }), /*#__PURE__*/React.createElement("textarea", {
    value: s.note,
    onChange: e => setS(p => ({
      ...p,
      note: e.target.value
    })),
    placeholder: "Note...",
    style: {
      width: '100%',
      padding: 12,
      borderRadius: 10,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 14,
      resize: 'vertical',
      minHeight: 44,
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px',
      borderTop: `1px solid ${T.brd}`,
      display: 'flex',
      gap: 12,
      background: T.bg
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      ...btn(T.bgCard, T.txtSub, {
        flex: 1,
        border: `1px solid ${T.brd}`
      })
    }
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (!s.type) return;
      onOk(s, 0);
    },
    style: {
      ...btn(T.primary, T.white, {
        flex: 2
      })
    }
  }, "Confirmer"))));
}
const FRITES_SUPPS = [{
  l: 'Bacon',
  p: 1
}, {
  l: 'Oignons frits',
  p: 0.5
}, {
  l: 'Cheddar',
  p: 1
}];

// Modal pour Canadiennes / Cheddars / Wings
const LOADED_RETRAITS = ['Sans cheddar', 'Sans oignon crispy', 'Sans sauce', 'Sans chicken'];
const LOADED_SUPPS = [{
  l: 'Supp. Cheddar',
  p: 1
}, {
  l: 'Supp. Bacon',
  p: 1
}, {
  l: 'Supp. Oignon Crispy',
  p: 0.5
}, {
  l: 'Supp. Chicken',
  p: 2
}];
