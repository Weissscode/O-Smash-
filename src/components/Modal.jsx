import React from 'react';
import { KioskFlowContext } from './KioskFlowContext.jsx';
import { KioskSheet } from './KioskOrderUI.jsx';

export function Modal({
  children,
  onClose
}) {
  const kiosk = React.useContext(KioskFlowContext);
  if (kiosk) {
    const content = React.cloneElement(children, {
      style: { ...children.props.style, width: '100%', maxHeight: 'none', border: 0, borderRadius: 0, boxShadow: 'none', background: 'transparent' }
    });
    return <KioskSheet title="Composez votre commande" onCancel={onClose}><div className="k-configuration">{content}</div></KioskSheet>;
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      background: 'rgba(26,16,40,0.55)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1
    }
  }, children));
}
