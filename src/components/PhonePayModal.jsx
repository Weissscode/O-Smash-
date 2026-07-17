import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { SL } from './SL.jsx';

export function PhonePayModal({
  order,
  onClose,
  onPaid,
  onSplit
}) {
  const [payment, setPayment] = React.useState('');
  const valid = !!payment;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(90vw,440px)',
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
  }, "Paiement \u2014 ", order.client), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.txtSub,
      marginTop: 3
    }
  }, order.service, " \xB7 ", fp(order.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px'
    }
  }, /*#__PURE__*/React.createElement(SL, {
    title: "MODE DE PAIEMENT",
    color: T.ok
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 20
    }
  }, ['Espèces', 'CB'].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => setPayment(p),
    style: {
      padding: 20,
      borderRadius: 6,
      border: payment === p ? `2.5px solid ${T.ok}` : `1.5px solid ${T.brd}`,
      background: payment === p ? T.okL : T.bgCard,
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
      color: payment === p ? T.ok : T.txtSub,
      textAlign: 'center'
    }
  }, p))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card({
        background: T.primaryL
      }),
      padding: '12px 16px',
      border: `1px solid ${T.brdL}`,
      marginBottom: 20
    }
  }, order.items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      padding: '3px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.txt
    }
  }, item.qty, "x ", item.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.primary,
      fontWeight: 700
    }
  }, fp(item.total)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTop: `1px solid ${T.brd}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: T.txt
    }
  }, "Total"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      color: T.primary,
      fontSize: 17
    }
  }, fp(order.total)))), /*#__PURE__*/React.createElement("div", {
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
    onClick: () => valid && onPaid(payment),
    disabled: !valid,
    style: {
      ...btn(valid ? T.ok : T.brd, valid ? T.white : T.txtMuted, {
        flex: 2,
        cursor: valid ? 'pointer' : 'not-allowed'
      })
    }
  }, valid ? 'Valider & Imprimer caisse' : 'Choisir paiement')), onSplit && /*#__PURE__*/React.createElement("button", {
    onClick: onSplit,
    style: {
      ...btn('#F59E0B', T.white, {
        width: '100%',
        fontWeight: 700,
        fontSize: 14,
        marginTop: 8
      })
    }
  }, "Payer separement (diviser la commande)"))));
}

// Vue commandes téléphone

