import React from 'react';
import { T } from '../data/theme.js';
import { BURGERS } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { Tag } from './Tag.jsx';
import { BurgerCust } from './BurgerCust.jsx';

export function DuoBuild({
  formule,
  onAdd,
  onClose
}) {
  const pool = formule.duoType === 'simple' ? BURGERS.filter(b => ['SIMPLE', 'WRAP', 'VEGGY'].includes(b.tag)) : BURGERS;
  const [step, setStep] = React.useState(0);
  const [b1, setB1] = React.useState(null);
  const [c1, setC1] = React.useState(null);
  const [b2, setB2] = React.useState(null);
  if (step === 1 && b1) return /*#__PURE__*/React.createElement(BurgerCust, {
    product: b1,
    onClose: () => {
      setB1(null);
      setStep(0);
    },
    onOk: c => {
      setC1(c);
      setStep(2);
    }
  });
  if (step === 3 && b2) return /*#__PURE__*/React.createElement(BurgerCust, {
    product: b2,
    onClose: () => {
      setB2(null);
      setStep(2);
    },
    onOk: c => {
      onAdd({
        name: formule.name,
        price: formule.price,
        cust: {
          burgers: [{
            name: b1.name,
            cust: c1
          }, {
            name: b2.name,
            cust: c
          }]
        }
      });
    }
  });
  const picking = step < 2 ? 1 : 2;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(94vw,560px)',
      maxHeight: '85vh',
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
      fontSize: 17,
      fontWeight: 800,
      color: T.txt
    }
  }, formule.name, " \u2014 ", fp(formule.price)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub,
      marginTop: 3
    }
  }, "Burger ", picking, "/2", b1 && step >= 2 ? ` · Burger 1 : ${b1.name}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 14,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, pool.map(b => /*#__PURE__*/React.createElement("button", {
    key: b.id,
    onClick: () => {
      if (picking === 1) {
        setB1(b);
        setStep(1);
      } else {
        setB2(b);
        setStep(3);
      }
    },
    style: {
      ...card(),
      padding: 16,
      cursor: 'pointer',
      textAlign: 'left',
      border: `1px solid ${T.brd}`
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    label: b.tag,
    color: T.primary
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: T.txt,
      marginTop: 6
    }
  }, b.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: T.primary,
      marginTop: 4
    }
  }, fp(b.price))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderTop: `1px solid ${T.brd}`,
      background: T.bg
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      ...btn(T.bgCard, T.txtSub, {
        width: '100%',
        border: `1px solid ${T.brd}`
      })
    }
  }, "Annuler"))));
}
