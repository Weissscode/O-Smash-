import React from 'react';
import { T } from '../data/theme.js';
import { TOPS } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { Chip } from './Chip.jsx';
import { SL } from './SL.jsx';

export function TopModal({
  product,
  isCrepe,
  initial,
  onOk,
  onClose
}) {
  const def = {
    toppings: [],
    glace: false,
    chantilly: false,
    note: ''
  };
  const [s, setS] = React.useState(initial ? {
    ...def,
    ...initial
  } : def);
  const tog = l => setS(p => ({
    ...p,
    toppings: p.toppings.includes(l) ? p.toppings.filter(x => x !== l) : [...p.toppings, l]
  }));
  const ext = s.toppings.length * 0.5 + (s.glace ? 1 : 0);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(88vw,420px)',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: T.txt
    }
  }, product.name), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.primary,
      color: T.white,
      fontWeight: 700,
      padding: '5px 16px',
      borderRadius: 10,
      fontSize: 14
    }
  }, fp(product.price + ext))), /*#__PURE__*/React.createElement(SL, {
    title: "TOPPINGS (+0,50)",
    color: T.ok
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 7,
      marginBottom: 14
    }
  }, TOPS.map((t, i) => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    label: t.l,
    active: s.toppings.includes(t.l),
    onClick: () => tog(t.l),
    clr: T.ok
  }))), isCrepe && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    label: "Supplement Glace  +1,00",
    active: s.glace,
    onClick: () => setS(p => ({
      ...p,
      glace: !p.glace
    })),
    clr: "#8B5CF6"
  })), !isCrepe && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    label: "+ Chantilly (gratuit)",
    active: s.chantilly,
    onClick: () => setS(p => ({
      ...p,
      chantilly: !p.chantilly
    })),
    clr: "#DB2777"
  })), /*#__PURE__*/React.createElement(SL, {
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
      borderRadius: 6,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 14,
      resize: 'vertical',
      minHeight: 40,
      outline: 'none',
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
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
    onClick: () => onOk(s, ext),
    style: {
      ...btn(T.primary, T.white, {
        flex: 2
      })
    }
  }, "Confirmer"))));
}
