import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp, ft } from '../utils/format.js';
import { sendPrintCuisine } from '../utils/printServer.js';
import { PhonePayModal } from './PhonePayModal.jsx';

export function TelephoneView({
  phoneOrders,
  onPaid,
  onDelete,
  onSplit,
  onStartAdd
}) {
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  if (phoneOrders.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: T.txtMuted
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 48
      }
    }, "\uD83D\uDCDE"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 700
      }
    }, "Aucune commande telephone en attente"));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: T.txt,
      marginBottom: 14
    }
  }, "Commandes telephone \u2014 ", phoneOrders.length, " en attente"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, phoneOrders.map(order => /*#__PURE__*/React.createElement("div", {
    key: order.id,
    style: {
      ...card(),
      padding: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      background: `linear-gradient(135deg,#2563EB15,#1E40AF0A)`,
      borderBottom: `1px solid ${T.brd}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 900,
      color: '#2563EB'
    }
  }, "#", order.num), /*#__PURE__*/React.createElement("div", null, order.client && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: T.txt
    }
  }, order.client), order.phone && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#2563EB'
    }
  }, "\uD83D\uDCDE ", order.phone), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.txtSub
    }
  }, ft(order.date)))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, order.service && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.warn,
      fontWeight: 700,
      background: T.warnL,
      padding: '2px 8px',
      borderRadius: 10,
      marginBottom: 3
    }
  }, order.service), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      color: '#2563EB'
    }
  }, fp(order.total)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px'
    }
  }, order.items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 13,
      color: T.txtSub,
      padding: '2px 0'
    }
  }, item.qty, "x ", item.name, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.primary,
      fontWeight: 600
    }
  }, fp(item.total))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      borderTop: `1px solid ${T.brd}`,
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setSelectedOrder(order);
    },
    style: {
      ...btn('#2563EB', T.white, {
        flex: 2,
        fontSize: 13
      })
    }
  }, "Encaisser"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      sendPrintCuisine(order);
    },
    style: {
      ...btn('#EFF6FF', '#2563EB', {
        flex: 1,
        fontSize: 12,
        border: '1.5px solid #BFDBFE'
      })
    }
  }, "Cuisine"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onStartAdd && onStartAdd(order);
    },
    style: {
      ...btn('#16A34A', T.white, {
        flex: 1,
        fontSize: 12
      })
    }
  }, "+ Ajouter"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      if (window.confirm('Supprimer ?')) onDelete(order.id);
    },
    style: {
      ...btn(T.noL, T.no, {
        flex: 1,
        fontSize: 12,
        border: `1px solid ${T.no}`
      })
    }
  }, "Annuler"))))), selectedOrder && /*#__PURE__*/React.createElement(PhonePayModal, {
    order: selectedOrder,
    onClose: () => setSelectedOrder(null),
    onPaid: async payment => {
      await onPaid(selectedOrder, payment);
      setSelectedOrder(null);
    },
    onSplit: () => {
      setSplitM(selectedOrder);
      setSelectedOrder(null);
    }
  }));
}
