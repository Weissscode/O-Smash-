import React from 'react';
import { T } from '../data/theme.js';
import { card } from '../utils/styles.js';
import { fp } from '../utils/format.js';

export function CItem({
  item,
  onEdit,
  onDel,
  onQ
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...card(),
      padding: '10px 12px',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      flex: 1,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: T.txt
    }
  }, item.name), item.cust && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3
    }
  }, item.cust.retraits?.map((r, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.no,
      fontSize: 10,
      fontWeight: 600
    }
  }, "\u2014 ", r)), item.cust.supplements?.map((s, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.ok,
      fontSize: 10
    }
  }, "+ ", s)), item.cust.sauces?.map((s, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.primary,
      fontSize: 10
    }
  }, "Sauce : ", s)), item.cust.sauce && /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.primary,
      fontSize: 10
    }
  }, "Sauce : ", item.cust.sauce), item.cust.version && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#8B5CF6',
      fontSize: 10
    }
  }, item.cust.version), item.cust.type && /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.warn,
      fontSize: 10,
      fontWeight: 600
    }
  }, item.cust.type), item.cust.choix && /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.primary,
      fontSize: 10
    }
  }, "Choix : ", item.cust.choix), item.cust.toppings?.map((t, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.ok,
      fontSize: 10
    }
  }, "+ ", t)), item.cust.glace && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#8B5CF6',
      fontSize: 10
    }
  }, "+ Glace"), item.cust.drink && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#2563EB',
      fontSize: 10
    }
  }, "Boisson : ", item.cust.drink), item.cust.fritesSauce && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#0891B2',
      fontSize: 10
    }
  }, "Twister sauce : ", item.cust.fritesSauce), item.cust.twisterSauce && !item.cust.fritesSauce && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#0891B2',
      fontSize: 10
    }
  }, "Twister sauce : ", item.cust.twisterSauce), item.cust.fritesSupps?.map((t, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.ok,
      fontSize: 10
    }
  }, "Twister + ", t)), item.cust.supps?.map((t, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.ok,
      fontSize: 10
    }
  }, "+ ", t)), item.cust.burgers?.map((b, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      color: T.primary,
      fontSize: 10
    }
  }, j + 1, ". ", b.name)), item.cust.note && /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.txtSub,
      fontSize: 10,
      fontStyle: 'italic'
    }
  }, item.cust.note))), /*#__PURE__*/React.createElement("button", {
    onClick: onDel,
    style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      border: 'none',
      background: T.noL,
      color: T.no,
      cursor: 'pointer',
      fontSize: 10,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginLeft: 8
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onQ(-1),
    style: {
      width: 30,
      height: 30,
      borderRadius: '8px 0 0 8px',
      border: `1px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: T.bg,
      borderTop: `1px solid ${T.brd}`,
      borderBottom: `1px solid ${T.brd}`,
      color: T.primary,
      fontSize: 13,
      fontWeight: 800
    }
  }, item.qty), /*#__PURE__*/React.createElement("button", {
    onClick: () => onQ(1),
    style: {
      width: 30,
      height: 30,
      borderRadius: '0 8px 8px 0',
      border: `1px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700
    }
  }, "+")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: T.txt
    }
  }, fp(item.total))));
}
