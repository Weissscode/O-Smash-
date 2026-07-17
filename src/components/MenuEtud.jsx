import React from 'react';
import { T } from '../data/theme.js';
import { BURGERS, RIZ, ETUD_CHOICES } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { Tag } from './Tag.jsx';
import { BurgerCust } from './BurgerCust.jsx';
import { RizCust } from './RizCust.jsx';
import { DrinkPick } from './DrinkPick.jsx';

export function MenuEtud({
  formule,
  onAdd,
  onClose
}) {
  const [step, setStep] = React.useState(0);
  const [choix, setChoix] = React.useState(null);
  const [custData, setCustData] = React.useState(null);
  if (step === 1 && choix) {
    const isBurger = ['b-orig', 'b-chik', 'b-veg', 'b-wrap', 'b-wrapb'].includes(choix.id);
    const isRiz = choix.id === 'r-riz';
    if (isBurger) {
      const prod = BURGERS.find(b => b.id === choix.id) || {
        id: choix.id,
        name: choix.name,
        price: 0,
        tag: choix.tag,
        hasVersion: false
      };
      return /*#__PURE__*/React.createElement(BurgerCust, {
        product: {
          ...prod,
          price: 0
        },
        inMenu: true,
        onClose: () => setStep(0),
        onOk: c => {
          setCustData(c);
          setStep(2);
        }
      });
    } else if (isRiz) {
      const prod = RIZ.find(r => r.id === 'r-riz');
      return /*#__PURE__*/React.createElement(RizCust, {
        product: {
          ...prod,
          price: 0
        },
        onClose: () => setStep(0),
        onOk: c => {
          setCustData(c);
          setStep(2);
        }
      });
    } else {
      setStep(2);
      return null;
    }
  }
  if (step === 2) {
    return /*#__PURE__*/React.createElement(DrinkPick, {
      onClose: () => setStep(0),
      onPick: d => {
        onAdd({
          name: `${formule.name} — ${choix.name}`,
          price: formule.price,
          cust: {
            choix: choix.name,
            ...(custData || {}),
            drink: d
          }
        });
      }
    });
  }
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
  }, "Choisissez votre produit")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 14,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, ETUD_CHOICES.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => {
      setChoix(c);
      setStep(1);
    },
    style: {
      ...card(),
      padding: 16,
      cursor: 'pointer',
      textAlign: 'left',
      border: `1px solid ${T.brd}`
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    label: c.tag,
    color: T.primary
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: T.txt,
      marginTop: 8
    }
  }, c.name)))), /*#__PURE__*/React.createElement("div", {
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
