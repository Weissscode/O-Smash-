import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { Chip } from './Chip.jsx';
import { SL } from './SL.jsx';

export function LoadedCust({
  product,
  initial,
  onOk,
  onClose
}) {
  const def = {
    retraits: [],
    supplements: [],
    note: ''
  };
  const [s, setS] = React.useState(initial ? {
    ...def,
    ...initial
  } : def);
  const tog = (t, l) => setS(p => {
    const a = p[t];
    return {
      ...p,
      [t]: a.includes(l) ? a.filter(x => x !== l) : [...a, l]
    };
  });
  const ext = s.supplements.reduce((sum, l) => {
    const f = LOADED_SUPPS.find(x => x.l === l);
    return sum + (f ? f.p : 0);
  }, 0);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(94vw,520px)',
      maxHeight: '88vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px',
      borderBottom: `1px solid ${T.brd}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: `linear-gradient(135deg,${T.primaryL},#F0EAFF)`
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.txt
    }
  }, product.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub,
      marginTop: 2
    }
  }, "Personnalisation")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.primary,
      color: T.white,
      fontWeight: 700,
      padding: '7px 18px',
      borderRadius: 10,
      fontSize: 16
    }
  }, fp(product.price + ext))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 22px'
    }
  }, /*#__PURE__*/React.createElement(SL, {
    title: "RETRAITS",
    color: T.no
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 7,
      marginBottom: 18
    }
  }, LOADED_RETRAITS.map((r, i) => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    label: r,
    active: s.retraits.includes(r),
    onClick: () => tog('retraits', r),
    clr: T.no
  }))), /*#__PURE__*/React.createElement(SL, {
    title: "SUPPL\xC9MENTS",
    color: T.ok
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 7,
      marginBottom: 18
    }
  }, LOADED_SUPPS.map((x, i) => /*#__PURE__*/React.createElement(Chip, {
    key: i,
    label: `${x.l}  +${fp(x.p)}`,
    active: s.supplements.includes(x.l),
    onClick: () => tog('supplements', x.l),
    clr: T.ok
  }))), /*#__PURE__*/React.createElement(SL, {
    title: "REMARQUE",
    color: T.txtSub
  }), /*#__PURE__*/React.createElement("textarea", {
    value: s.note,
    onChange: e => setS(p => ({
      ...p,
      note: e.target.value
    })),
    placeholder: "Note libre...",
    style: {
      width: '100%',
      padding: 12,
      borderRadius: 6,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 14,
      resize: 'vertical',
      minHeight: 44,
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px',
      borderTop: `1px solid ${T.brd}`,
      display: 'flex',
      gap: 12,
      background: T.bg
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
    onClick: () => onOk(s, ext),
    style: {
      ...btn(T.primary, T.white, {
        flex: 2
      })
    }
  }, "Confirmer"))));
}
