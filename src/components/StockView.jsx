import React from 'react';
import { T } from '../data/theme.js';
import { BURGERS, FORMULES, RIZ, SIDES, LOADED, DESS, DRINKS, MILKS, CREP } from '../data/products.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';

export function StockView({
  stockOut,
  toggle,
  customProds,
  onSaveCP
}) {
  const groups = [{
    n: 'Burgers',
    it: BURGERS
  }, {
    n: 'Formules',
    it: FORMULES
  }, {
    n: 'Riz',
    it: RIZ
  }, {
    n: 'Sides',
    it: SIDES
  }, {
    n: 'Loaded',
    it: LOADED
  }, {
    n: 'Desserts',
    it: DESS
  }, {
    n: 'Boissons',
    it: DRINKS
  }, {
    n: 'Milkshakes',
    it: MILKS
  }, {
    n: 'Crepes',
    it: CREP
  }];
  const [nn, setNN] = React.useState('');
  const [np, setNP] = React.useState('');
  const addC = () => {
    const n = nn.trim(),
      pr = parseFloat(np.replace(',', '.'));
    if (!n || isNaN(pr) || pr <= 0) return;
    onSaveCP([...customProds, {
      id: 'c-' + Date.now(),
      name: n,
      price: pr
    }]);
    setNN('');
    setNP('');
  };
  const SBtn = ({
    p
  }) => {
    const out = stockOut.includes(p.id);
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => toggle(p.id),
      style: {
        ...card(),
        padding: '10px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: out ? 0.55 : 1,
        border: out ? `1.5px solid ${T.no}` : `1px solid ${T.brd}`,
        background: out ? T.noL : T.bgCard
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: out ? T.no : T.txt
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 18,
        height: 18,
        borderRadius: 3,
        border: `2px solid ${out ? T.no : T.brd}`,
        background: out ? T.no : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, out && /*#__PURE__*/React.createElement("span", {
      style: {
        color: T.white,
        fontSize: 10,
        fontWeight: 800
      }
    }, "X")));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px',
      borderBottom: `1px solid ${T.brd}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: T.txt
    }
  }, "Gestion des stocks"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub,
      marginTop: 2
    }
  }, stockOut.length, " produit", stockOut.length !== 1 ? 's' : '', " en rupture")), stockOut.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => toggle('__reset'),
    style: {
      ...btn(T.noL, T.no, {
        fontSize: 10.5,
        padding: '6px 10px',
        borderRadius: 4,
        fontWeight: 700
      })
    }
  }, "Tout remettre")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '14px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      marginBottom: 16,
      background: T.primaryL,
      borderRadius: 6,
      border: `1.5px solid ${T.primary}44`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: T.primary,
      marginBottom: 10
    }
  }, "+ Ajouter un produit"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px auto',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: nn,
    onChange: e => setNN(e.target.value),
    placeholder: "Nom",
    style: {
      padding: '9px 11px',
      borderRadius: 6,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 13,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: np,
    onChange: e => setNP(e.target.value),
    placeholder: "Prix",
    style: {
      padding: '9px 11px',
      borderRadius: 6,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      color: T.txt,
      fontSize: 13,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addC,
    style: {
      ...btn(T.primary, T.white, {
        padding: '9px 14px',
        fontSize: 13,
        fontWeight: 700
      })
    }
  }, "+")), customProds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
      gap: 6,
      marginTop: 10
    }
  }, customProds.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      ...card(),
      padding: '8px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.primary
    }
  }, fp(p.price))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSaveCP(customProds.filter(x => x.id !== p.id)),
    style: {
      ...btn(T.noL, T.no, {
        padding: '3px 7px',
        fontSize: 11
      })
    }
  }, "X"))))), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.n,
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.txtMuted,
      marginBottom: 7,
      textTransform: 'uppercase',
      letterSpacing: 1.5
    }
  }, g.n), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
      gap: 6
    }
  }, g.it.map(p => /*#__PURE__*/React.createElement(SBtn, {
    key: p.id,
    p: p
  })))))));
}
