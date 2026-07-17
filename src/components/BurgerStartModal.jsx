import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';

export function BurgerStartModal({
  product,
  onChoice,
  onClose
}) {
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(90vw,440px)',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.txt,
      marginBottom: 4,
      textAlign: 'center'
    }
  }, product.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.txtSub,
      marginBottom: 20,
      textAlign: 'center'
    }
  }, "Comment souhaitez-vous le commander ?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChoice('seul'),
    style: {
      padding: '24px 16px',
      borderRadius: 10,
      border: `2px solid ${T.brd}`,
      background: T.bgCard,
      cursor: 'pointer',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: T.primary,
      marginBottom: 4
    }
  }, "Burger seul"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: T.txt
    }
  }, fp(product.price))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChoice('menu'),
    style: {
      padding: '24px 16px',
      borderRadius: 10,
      border: `2px solid #0891B2`,
      background: '#0891B214',
      cursor: 'pointer',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: '#0891B2',
      marginBottom: 4
    }
  }, "En menu (+3\u20AC)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.txtSub,
      marginBottom: 4
    }
  }, "+ Frites Twister + Boisson"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: T.txt
    }
  }, fp(product.price + 3)))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      ...btn(T.bg, T.txtSub, {
        width: '100%',
        border: `1px solid ${T.brd}`
      })
    }
  }, "Annuler")));
}
