import React from 'react';
import { T } from '../data/theme.js';
import { DRINKS } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { Modal } from './Modal.jsx';

export function DrinkPick({
  onPick,
  onClose
}) {
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(94vw,500px)',
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
  }, "Choisir une boisson")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 14,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, DRINKS.map(d => /*#__PURE__*/React.createElement("button", {
    key: d.id,
    onClick: () => onPick(d.name),
    style: {
      ...card(),
      padding: 14,
      cursor: 'pointer',
      textAlign: 'left',
      border: `1px solid ${T.brd}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: T.txt
    }
  }, d.name)))), /*#__PURE__*/React.createElement("div", {
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
