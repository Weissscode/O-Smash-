import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { isPhoneNumber } from '../utils/phone.js';
import { Modal } from './Modal.jsx';
import { SL } from './SL.jsx';

export function ConfirmModal({
  cart,
  cartTotal,
  clientName,
  setClientName,
  onCancel,
  onValidate,
  onSplit
}) {
  const [phone, setPhone] = React.useState('');
  const [service, setService] = React.useState('');
  const [payment, setPayment] = React.useState('');
  const isTel = isPhoneNumber(phone);
  const valid = service && (payment || isTel);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onCancel
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(92vw,480px)',
      maxHeight: '92vh',
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
  }, "Finaliser la commande"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub,
      marginTop: 2
    }
  }, cart.length, " article", cart.length !== 1 ? 's' : '', " \xB7 ", fp(cartTotal))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 22px'
    }
  }, /*#__PURE__*/React.createElement(SL, {
    title: "PRENOM DU CLIENT",
    color: T.txtSub
  }), /*#__PURE__*/React.createElement("input", {
    value: clientName,
    onChange: e => setClientName(e.target.value),
    placeholder: "Prenom",
    style: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 10,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 15,
      outline: 'none',
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement(SL, {
    title: "TELEPHONE",
    color: T.txtSub
  }), /*#__PURE__*/React.createElement("input", {
    value: phone,
    onChange: e => setPhone(e.target.value),
    placeholder: "Telephone",
    style: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 10,
      border: `1.5px solid ${isTel ? '#2563EB' : T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 15,
      outline: 'none',
      marginBottom: isTel ? 6 : 18
    }
  }), isTel && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#2563EB',
      fontWeight: 700,
      marginBottom: 14,
      padding: '6px 10px',
      background: '#DBEAFE',
      borderRadius: 8
    }
  }, "Commande telephone"), /*#__PURE__*/React.createElement(SL, {
    title: "SUR PLACE OU A EMPORTER",
    color: T.warn
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 18
    }
  }, ['Sur place', 'A emporter'].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setService(s),
    style: {
      padding: 18,
      borderRadius: 12,
      border: service === s ? `2.5px solid ${T.warn}` : `1.5px solid ${T.brd}`,
      background: service === s ? T.warnL : T.bgCard,
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 700,
      color: service === s ? T.warn : T.txtSub,
      textAlign: 'center',
      boxShadow: service === s ? T.shMd : T.sh
    }
  }, s))), !isTel && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SL, {
    title: "MODE DE PAIEMENT",
    color: T.ok
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 18
    }
  }, ['Especes', 'CB'].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => setPayment(p),
    style: {
      padding: 18,
      borderRadius: 12,
      border: payment === p ? `2.5px solid ${T.ok}` : `1.5px solid ${T.brd}`,
      background: payment === p ? T.okL : T.bgCard,
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 700,
      color: payment === p ? T.ok : T.txtSub,
      textAlign: 'center',
      boxShadow: payment === p ? T.shMd : T.sh
    }
  }, p)))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card({
        background: T.primaryL
      }),
      padding: '12px 16px',
      border: `1px solid ${T.brdL}`,
      marginTop: 8
    }
  }, cart.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      padding: '4px 0',
      borderBottom: i < cart.length - 1 ? `1px solid ${T.brdL}` : 'none'
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
      marginTop: 10,
      paddingTop: 10,
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
      fontSize: 18
    }
  }, fp(cartTotal))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px',
      borderTop: `1px solid ${T.brd}`,
      display: 'flex',
      gap: 12,
      background: T.bg
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      ...btn(T.bgCard, T.txtSub, {
        flex: 1,
        border: `1px solid ${T.brd}`
      })
    }
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      valid && onValidate(service, payment, isTel ? phone : '');
    },
    disabled: !valid,
    style: {
      ...btn(valid ? T.ok : T.brd, valid ? T.white : T.txtMuted, {
        flex: 2,
        cursor: valid ? 'pointer' : 'not-allowed',
        boxShadow: valid ? `0 4px 14px ${T.ok}40` : 'none'
      })
    }
  }, valid ? 'Valider et imprimer' : 'Choisir service')), valid && !isTel && onSplit && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 22px 14px',
      background: T.bg
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onSplit(service, payment),
    style: {
      ...btn('#F59E0B', T.white, {
        width: '100%',
        fontWeight: 700,
        fontSize: 14
      })
    }
  }, "Payer separement (diviser la commande)"))));
}

// Modal paiement pour commande téléphone
