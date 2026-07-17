import React from 'react';
import { T } from '../data/theme.js';
import { FRITES_SAUCES } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { Chip } from './Chip.jsx';
import { SL } from './SL.jsx';

export function FritesSauce({
  onOk,
  onClose,
  product,
  initial
}) {
  const def = {
    sauce: '',
    supps: []
  };
  const [s, setS] = React.useState(initial ? {
    ...def,
    ...initial
  } : def);
  const tog = l => setS(p => ({
    ...p,
    supps: p.supps.includes(l) ? p.supps.filter(x => x !== l) : [...p.supps, l]
  }));
  const ext = s.supps.reduce((sum, l) => {
    const f = FRITES_SUPPS.find(x => x.l === l);
    return sum + (f ? f.p : 0);
  }, 0);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(92vw,460px)',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.txt
    }
  }, "Frites Twister"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub,
      marginTop: 2
    }
  }, "Personnalisation")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.primary,
      color: T.white,
      fontWeight: 700,
      padding: '5px 16px',
      borderRadius: 10,
      fontSize: 14
    }
  }, fp((product?.price || 3) + ext))), /*#__PURE__*/React.createElement(SL, {
    title: "SAUCE",
    color: T.primary
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 7,
      marginBottom: 18
    }
  }, FRITES_SAUCES.map(sa => /*#__PURE__*/React.createElement(Chip, {
    key: sa,
    label: sa,
    active: s.sauce === sa,
    onClick: () => setS(p => ({
      ...p,
      sauce: p.sauce === sa ? '' : sa
    })),
    clr: T.primary
  }))), /*#__PURE__*/React.createElement(SL, {
    title: "SUPPL\xC9MENTS",
    color: T.ok
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 7,
      marginBottom: 22
    }
  }, FRITES_SUPPS.map((su, i) => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    label: `${su.l} +${fp(su.p)}`,
    active: s.supps.includes(su.l),
    onClick: () => tog(su.l),
    clr: T.ok
  }))), /*#__PURE__*/React.createElement("div", {
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
