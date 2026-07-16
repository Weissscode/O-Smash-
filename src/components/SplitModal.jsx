import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';

export function SplitModal({
  order,
  onClose,
  onPay
}) {
  const expandItems = items => items.flatMap(item => {
    if (!item.qty || item.qty <= 1) return [{
      ...item,
      qty: 1,
      total: item.total || item.unit || 0
    }];
    const u = (item.total || 0) / item.qty;
    return Array.from({
      length: item.qty
    }, (_, i) => ({
      ...item,
      id: item.id + '_' + i,
      qty: 1,
      total: u
    }));
  });
  const [tickets, setTickets] = React.useState([{
    id: 1,
    items: expandItems(order.items),
    payment: ''
  }]);
  const addTicket = () => setTickets(p => [...p, {
    id: Date.now(),
    items: [],
    payment: ''
  }]);
  const removeTicket = tid => setTickets(p => {
    const removed = p.find(t => t.id === tid);
    return p.filter(t => t.id !== tid).map((t, i) => i === 0 ? {
      ...t,
      items: [...t.items, ...(removed?.items || [])]
    } : t);
  });
  const moveItem = (fromId, toId, idx) => setTickets(prev => {
    const from = prev.find(t => t.id === fromId);
    if (!from) return prev;
    const item = from.items[idx];
    return prev.map(t => {
      if (t.id === fromId) return {
        ...t,
        items: t.items.filter((_, i) => i !== idx)
      };
      if (t.id === toId) return {
        ...t,
        items: [...t.items, {
          ...item
        }]
      };
      return t;
    });
  });
  const setPay = (tid, p) => setTickets(prev => prev.map(t => t.id === tid ? {
    ...t,
    payment: p
  } : t));
  const ttl = t => t.items.reduce((s, i) => s + (i.total || 0), 0);
  const expanded = expandItems(order.items).length;
  const assigned = tickets.reduce((s, t) => s + t.items.length, 0);
  const active = tickets.filter(t => t.items.length > 0);
  const allOk = active.length > 0 && active.every(t => t.payment) && assigned === expanded;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card(),
      width: 'min(96vw,540px)',
      maxHeight: '92vh',
      height: '92vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderBottom: `1px solid ${T.brd}`,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: T.txt
    }
  }, "Diviser commande #", order.num), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub
    }
  }, expanded, " articles \xB7 ", fp(order.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minHeight: 0
    }
  }, tickets.map((ticket, ti) => /*#__PURE__*/React.createElement("div", {
    key: ticket.id,
    style: {
      border: `1.5px solid ${ticket.payment ? T.ok : T.brd}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: T.bgCard
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      background: ticket.payment ? T.okL : T.primaryL,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 13
    }
  }, "Ticket ", ti + 1, " \u2014 #", order.num), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: T.primary,
      fontSize: 13
    }
  }, fp(ttl(ticket))), tickets.length > 1 && /*#__PURE__*/React.createElement("button", {
    onClick: () => removeTicket(ticket.id),
    style: {
      ...btn(T.noL, T.no, {
        padding: '2px 8px',
        fontSize: 11
      })
    }
  }, "Suppr"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 12px'
    }
  }, ticket.items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.txtMuted,
      fontSize: 12,
      padding: '6px 0',
      textAlign: 'center'
    }
  }, "Vide") : ticket.items.map((item, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 0',
      borderBottom: `1px solid ${T.brdL}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, item.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: T.primary,
      marginLeft: 6
    }
  }, fp(item.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, tickets.filter(t => t.id !== ticket.id).map((other, oi) => /*#__PURE__*/React.createElement("button", {
    key: other.id,
    onClick: () => moveItem(ticket.id, other.id, idx),
    style: {
      ...btn(T.bgCard, T.primary, {
        padding: '3px 8px',
        fontSize: 11,
        border: `1px solid ${T.brd}`
      })
    }
  }, "T", tickets.indexOf(other) + 1)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      borderTop: `1px solid ${T.brd}`,
      display: 'flex',
      gap: 6
    }
  }, ['Especes', 'CB'].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => setPay(ticket.id, p),
    style: {
      ...btn(ticket.payment === p ? T.ok : T.bgCard, ticket.payment === p ? T.white : T.txtSub, {
        flex: 1,
        padding: '9px',
        fontSize: 13,
        fontWeight: 700,
        border: `1.5px solid ${ticket.payment === p ? T.ok : T.brd}`
      })
    }
  }, p === 'Especes' ? 'Especes' : 'CB'))))), /*#__PURE__*/React.createElement("button", {
    onClick: addTicket,
    style: {
      ...btn(T.primaryL, T.primary, {
        border: `1.5px dashed ${T.primary}`,
        padding: '10px',
        fontSize: 14,
        fontWeight: 700
      })
    }
  }, " + Ajouter un ticket")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderTop: `1px solid ${T.brd}`,
      display: 'flex',
      gap: 10,
      flexShrink: 0
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
    onClick: e => {
      e.stopPropagation();
      if (allOk) onPay(active);
    },
    disabled: !allOk,
    style: {
      ...btn(allOk ? T.ok : T.brd, allOk ? T.white : T.txtMuted, {
        flex: 2,
        fontWeight: 700,
        cursor: allOk ? 'pointer' : 'not-allowed'
      })
    }
  }, assigned < expanded ? 'Assigner tous les articles' : !active.every(t => t.payment) ? 'Choisir paiement' : 'Encaisser et imprimer'))));
}
