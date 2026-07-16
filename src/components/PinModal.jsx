import React from 'react';
import { T } from '../data/theme.js';
import { PIN_CODE } from '../config.js';
import { card } from '../utils/styles.js';
import { Modal } from './Modal.jsx';

export function PinModal({
  onOk,
  onClose,
  title = 'Accès protégé'
}) {
  const [pin, setPin] = React.useState('');
  const [err, setErr] = React.useState(false);
  const go = () => {
    if (pin === PIN_CODE) onOk();else {
      setErr(true);
      setPin('');
      setTimeout(() => setErr(false), 1200);
    }
  };
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(85vw,340px)',
      padding: 28,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: T.txtSub,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6
    }
  }, "Acc\xE8s Prot\xE9g\xE9"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.txt,
      marginBottom: 20
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 42,
      height: 48,
      borderRadius: 12,
      border: `2px solid ${err ? T.no : pin.length > i ? T.primary : T.brd}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      fontWeight: 800,
      color: T.primary,
      background: pin.length > i ? T.primaryL : T.bg
    }
  }, pin.length > i ? '●' : ''))), err && /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.no,
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 10,
      padding: '6px',
      background: T.noL,
      borderRadius: 8
    }
  }, "Code incorrect"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
      maxWidth: 240,
      margin: '0 auto'
    }
  }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((n, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
      if (n === 'C') setPin('');else if (n === 'OK') go();else if (pin.length < 4) setPin(p => p + n);
    },
    style: {
      height: 50,
      borderRadius: 11,
      border: `1.5px solid ${T.brd}`,
      background: n === 'OK' ? T.ok : n === 'C' ? T.noL : T.bg,
      color: n === 'OK' ? T.white : n === 'C' ? T.no : T.txt,
      fontSize: n === 'OK' ? 13 : 20,
      fontWeight: n === 'OK' ? 700 : 500,
      cursor: 'pointer'
    }
  }, n)))));
}
