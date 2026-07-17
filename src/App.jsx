import React from 'react';
import { T } from './data/theme.js';
import { CATS, BURGERS, FORMULES, RIZ, SIDES, LOADED, CREP, MILKS, PMAP, CB } from './data/products.js';
import { card, btn } from './utils/styles.js';
import { fp, ft, fd, uid } from './utils/format.js';
import { LS } from './utils/storage.js';
import { isPhoneNumber } from './utils/phone.js';
import { getNextOrderNum } from './utils/orderNumber.js';
import { sendPrint, sendPrintCuisine, sendPrintCaisse, sendDailyReport } from './utils/printServer.js';
import { printTicket } from './utils/ticketPrint.js';
import { Logo } from './components/Logo.jsx';
import { Modal } from './components/Modal.jsx';
import { Tag } from './components/Tag.jsx';
import { PinModal } from './components/PinModal.jsx';
import { BurgerCust } from './components/BurgerCust.jsx';
import { BurgerStartModal } from './components/BurgerStartModal.jsx';
import { RizCust } from './components/RizCust.jsx';
import { LoadedCust } from './components/LoadedCust.jsx';
import { FritesSauce } from './components/FritesSauce.jsx';
import { MenuEtud } from './components/MenuEtud.jsx';
import { DrinkPick } from './components/DrinkPick.jsx';
import { TopModal } from './components/TopModal.jsx';
import { DuoBuild } from './components/DuoBuild.jsx';
import { StockView } from './components/StockView.jsx';
import { Dash } from './components/Dash.jsx';
import { CItem } from './components/CItem.jsx';
import { ConfirmModal } from './components/ConfirmModal.jsx';
import { SplitModal } from './components/SplitModal.jsx';
import { TelephoneView } from './components/TelephoneView.jsx';

export default function App() {
  const [view, setView] = React.useState('pos');
  const [selCat, setSelCat] = React.useState('burger');
  const [cart, setCart] = React.useState([]);
  const [orders, setOrders] = React.useState(() => LS.get('osm7-orders', []));
  const [phoneOrders, setPhoneOrders] = React.useState(() => LS.get('osm7-phoneorders', []));
  const [stockOut, setStockOut] = React.useState(() => LS.get('osm7-stock', []));
  const [customProds, setCustomProds] = React.useState(() => LS.get('osm7-custom-prods', []));
  const saveCP = p => {
    setCustomProds(p);
    LS.set('osm7-custom-prods', p);
  };
  const finalizePhoneAdd = () => {
    if (!phoneAddCtx || cart.length === 0) return;
    setPhoneOrders(prev => {
      const updated = prev.map(o => o.id !== phoneAddCtx.orderId ? o : {
        ...o,
        items: [...o.items, ...cart.map(c => ({
          ...c
        }))],
        total: o.items.reduce((s, i) => s + (i.total || 0), 0) + cart.reduce((s, i) => s + (i.total || 0), 0)
      });
      LS.set('osm7-phoneorders', updated);
      return updated;
    });
    setCart([]);
    setPhoneAddCtx(null);
    setView('telephone');
  };
  const [phoneAddCtx, setPhoneAddCtx] = React.useState(null);
  const [splitCartM, setSplitCartM] = React.useState(null);
  const [now, setNow] = React.useState(new Date());
  const [pinFor, setPinFor] = React.useState(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [mob, setMob] = React.useState(window.innerWidth < 1100);
  const [printSt, setPrintSt] = React.useState(null);
  const [clientName, setClientName] = React.useState('');
  const [custM, setCustM] = React.useState(null);
  const [drinkM, setDrinkM] = React.useState(null);
  const [duoM, setDuoM] = React.useState(null);
  const [etudM, setEtudM] = React.useState(null);
  const [fritesM, setFritesM] = React.useState(null);
  const [burgerStartM, setBurgerStartM] = React.useState(null);
  const [confirmM, setConfirmM] = React.useState(false);
  const [successM, setSuccessM] = React.useState(null);
  React.useEffect(() => {
    const ck = () => setMob(window.innerWidth < 1100);
    window.addEventListener('resize', ck);
    return () => window.removeEventListener('resize', ck);
  }, []);
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    const check = async () => {
      const n = new Date();
      if (n.getHours() === 0 && n.getMinutes() <= 2) {
        const reportDate = fd(new Date(n.getTime() - 5*60*1000));
        const lastSent = LS.get('osm7-last-report', '');
        if (lastSent !== reportDate) {
          const dayOrders = orders.filter(o => fd(o.date) === reportDate && o.status !== 'annulee');
          if (dayOrders.length > 0) {
            const r = await sendDailyReport(reportDate, dayOrders);
            if (r && r.success) { LS.set('osm7-last-report', reportDate); }
          } else {
            LS.set('osm7-last-report', reportDate);
          }
        }
      }
    };
    const t2 = setInterval(check, 60000);
    check();
    return () => clearInterval(t2);
  }, [orders]);
  React.useEffect(() => {
    LS.set('osm7-orders', orders);
  }, [orders]);
  React.useEffect(() => {
    LS.set('osm7-stock', stockOut);
  }, [stockOut]);
  React.useEffect(() => {
    LS.set('osm7-phoneorders', phoneOrders);
  }, [phoneOrders]);
  const togStock = id => {
    if (id === '__reset') {
      setStockOut([]);
      return;
    }
    setStockOut(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };
  const addCart = (name, price, pid, cust = null) => setCart(p => [...p, {
    id: uid(),
    pid,
    name,
    unit: price,
    qty: 1,
    total: price,
    cust
  }]);
  const updQty = (cid, d) => setCart(p => p.map(i => i.id !== cid ? i : {
    ...i,
    qty: Math.max(1, i.qty + d),
    total: i.unit * Math.max(1, i.qty + d)
  }));
  const rmCart = cid => setCart(p => p.filter(i => i.id !== cid));
  const editCC = (cid, nc, ne, bp) => setCart(p => p.map(i => {
    if (i.id !== cid) return i;
    const nu = bp + ne;
    return {
      ...i,
      unit: nu,
      total: nu * i.qty,
      cust: nc
    };
  }));
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const placeOrder = async (service, payment, phoneVal) => {
    const num = getNextOrderNum();
    const nomClient = clientName || null;
    const o = {
      id: uid(),
      num,
      date: new Date().toISOString(),
      items: cart.map(c => ({
        ...c
      })),
      total: cartTotal,
      status: 'en cours',
      client: nomClient,
      phone: phoneVal || null,
      service,
      payment
    };
    const isTel = !!(phoneVal && isPhoneNumber(phoneVal));
    if (isTel) {
      // Commande téléphone : stocker dans phoneOrders, imprimer seulement cuisine
      const phoneO = {
        ...o,
        status: 'en attente'
      };
      setPhoneOrders(p => [phoneO, ...p]);
      setCart([]);
      setClientName('');
      setConfirmM(false);
      setCartOpen(false);
      setSuccessM({
        ...o,
        isTel: true
      });
      setPrintSt('Envoi cuisine...');
      const r = await sendPrintCuisine(phoneO);
      setPrintSt(r.success !== false ? 'Cuisine imprimée !' : 'Erreur cuisine');
      setTimeout(() => setPrintSt(null), 3000);
    } else {
      // Commande normale
      setOrders(p => [o, ...p]);
      setCart([]);
      setClientName('');
      setConfirmM(false);
      setCartOpen(false);
      setSuccessM(o);
      setPrintSt('Impression...');
      const r = await sendPrint(o);
      setPrintSt(r.success !== false ? 'Imprimé !' : 'Erreur impression');
      setTimeout(() => setPrintSt(null), 3000);
    }
  };

  // Paiement commande téléphone
  const payPhoneOrder = async (order, payment) => {
    const paidO = {
      ...order,
      payment,
      status: 'payée'
    };
    // Retirer de phoneOrders, ajouter à orders
    setPhoneOrders(p => p.filter(x => x.id !== order.id));
    setOrders(p => [paidO, ...p]);
    setPrintSt('Impression caisse...');
    const r = await sendPrintCaisse(paidO);
    setPrintSt(r.success !== false ? 'Ticket imprime !' : 'Erreur impression');
    setTimeout(() => setPrintSt(null), 3000);
  };
  const splitPhoneOrder = async (order, tickets) => {
    setPhoneOrders(p => {
      const u = p.filter(x => x.id !== order.id);
      LS.set('osm7-phoneorders', u);
      return u;
    });
    const newOrders = [];
    for (var i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      if (!t || t.items.length === 0 || !t.payment) continue;
      const cleanItems = t.items.map(it => ({
        ...it,
        id: it.id.toString().split('_')[0]
      }));
      const subTotal = cleanItems.reduce((s, it) => s + (it.total || 0), 0);
      const sub = {
        ...order,
        id: uid(),
        items: cleanItems,
        total: subTotal,
        payment: t.payment,
        status: 'payee',
        splitOf: order.num
      };
      newOrders.push(sub);
    }
    setOrders(p => {
      const u = [...newOrders, ...p];
      LS.set('osm7-orders', u);
      return u;
    });
    for (var j = 0; j < newOrders.length; j++) {
      await sendPrintCaisse(newOrders[j]);
    }
    setPrintSt('Paiements enregistres !');
    setTimeout(() => setPrintSt(null), 3000);
  };
  const splitCartOrder = async (order, tickets) => {
    setOrders(p => {
      const filtered = p.filter(x => x.id !== order.id);
      return filtered;
    });
    const newOrders = [];
    for (var i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      if (!t || t.items.length === 0 || !t.payment) continue;
      const cleanItems = t.items.map(it => ({
        ...it,
        id: it.id.toString().split('_')[0]
      }));
      const subTotal = cleanItems.reduce((s, it) => s + (it.total || 0), 0);
      const sub = {
        ...order,
        id: uid(),
        items: cleanItems,
        total: subTotal,
        payment: t.payment,
        status: 'en cours',
        splitOf: order.num
      };
      newOrders.push(sub);
    }
    setOrders(p => {
      const u = [...newOrders, ...p];
      LS.set('osm7-orders', u);
      return u;
    });
    // Cuisine UNE SEULE FOIS sur la commande complete originale
    await sendPrintCuisine(order);
    // Caisse separee pour chaque sous-ticket
    for (var j = 0; j < newOrders.length; j++) {
      await sendPrintCaisse(newOrders[j]);
    }
    setPrintSt('Paiements enregistres !');
    setTimeout(() => setPrintSt(null), 3000);
  };
  const handleProd = (p, cat) => {
    if (stockOut.includes(p.id)) return;
    if (cat === 'burger') return setBurgerStartM(p);
    if (cat === 'riz') return setCustM({
      product: p,
      type: 'riz',
      needsDrink: !!p.needsDrink
    });
    if (cat === 'formule') {
      if (p.isEtud) return setEtudM(p);
      if (p.isDuo) return setDuoM(p);
      if (p.needsDrink) return setDrinkM({
        cb: d => addCart(p.name + (d ? ` (${d})` : ''), p.price, p.id, {
          drink: d
        })
      });
      return addCart(p.name, p.price, p.id);
    }
    if (cat === 'milkshake') return setCustM({
      product: p,
      type: 'milk'
    });
    if (cat === 'crepes') return setCustM({
      product: p,
      type: 'crepe'
    });
    if (cat === 'loaded') return setCustM({
      product: p,
      type: 'loaded'
    });
    if (cat === 'sides' && p.hasSauce) return setFritesM(p);
    if (cat === 'divers') return addCart(p.name, p.price, p.id);
    addCart(p.name, p.price, p.id);
  };
  const handleEdit = item => {
    const b = BURGERS.find(x => x.id === item.pid);
    if (b) return setCustM({
      product: b,
      type: 'burger',
      editId: item.id,
      initial: item.cust,
      inMenu: !!item.cust?.inMenu
    });
    const r = RIZ.find(x => x.id === item.pid);
    if (r) return setCustM({
      product: r,
      type: 'riz',
      editId: item.id,
      initial: item.cust
    });
    const m = MILKS.find(x => x.id === item.pid);
    if (m) return setCustM({
      product: m,
      type: 'milk',
      editId: item.id,
      initial: item.cust
    });
    const c = CREP.find(x => x.id === item.pid);
    if (c) return setCustM({
      product: c,
      type: 'crepe',
      editId: item.id,
      initial: item.cust
    });
    const lo = LOADED.find(x => x.id === item.pid);
    if (lo) return setCustM({
      product: lo,
      type: 'loaded',
      editId: item.id,
      initial: item.cust
    });
    const f = SIDES.find(x => x.id === item.pid);
    if (f && f.hasSauce) return setFritesM({
      ...f,
      editId: item.id,
      initial: item.cust
    });
    // Formules - on relance le flow
    const fo = FORMULES.find(x => x.id === item.pid);
    if (fo) {
      if (fo.isEtud) {
        rmCart(item.id);
        setEtudM(fo);
        return;
      }
      if (fo.isDuo) {
        rmCart(item.id);
        setDuoM(fo);
        return;
      }
    }
  };
  const xCats = customProds.length > 0 ? [...CATS, {
    id: 'divers',
    name: 'Divers',
    color: '#374151'
  }] : CATS;
  const xMap = customProds.length > 0 ? {
    ...PMAP,
    divers: customProds
  } : PMAP;
  const catObj = xCats.find(c => c.id === selCat);
  const PCard = ({
    p,
    cat
  }) => {
    const out = stockOut.includes(p.id);
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => !out && handleProd(p, cat),
      onPointerDown: e => {
        if (!out) e.currentTarget.style.transform = 'scale(0.96)';
      },
      onPointerUp: e => {
        e.currentTarget.style.transform = 'scale(1)';
      },
      onPointerLeave: e => {
        e.currentTarget.style.transform = 'scale(1)';
      },
      style: {
        ...card(),
        borderRadius: 4,
        padding: '16px 18px',
        cursor: out ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        minHeight: 110,
        position: 'relative',
        overflow: 'hidden',
        opacity: out ? 0.38 : 1,
        transition: 'transform .1s'
      }
    }, out && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(254,242,242,0.88)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: T.no,
        padding: '4px 12px',
        borderRadius: 6,
        background: T.noL,
        border: `1px solid ${T.no}`
      }
    }, "Rupture")), p.tag && /*#__PURE__*/React.createElement(Tag, {
      label: p.tag,
      color: catObj?.color || T.primary
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: T.txt,
        lineHeight: 1.2,
        flex: 1
      }
    }, p.name), p.desc && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: T.txtMuted,
        lineHeight: 1.3,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical'
      }
    }, p.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: catObj?.color || T.primary
      }
    }, fp(p.price)));
  };
  const renderGrid = () => {
    const prods = xMap[selCat] || [];
    const pb = mob ? '10px 12px 76px' : '10px 14px 14px';
    if (selCat === 'burger') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          padding: pb
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 9
        }
      }, prods.slice(0, 9).map(p => /*#__PURE__*/React.createElement(PCard, {
        key: p.id,
        p: p,
        cat: "burger"
      }))), prods.length > 9 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 9,
          marginTop: 9
        }
      }, prods.slice(9, 11).map(p => /*#__PURE__*/React.createElement(PCard, {
        key: p.id,
        p: p,
        cat: "burger"
      }))));
    }
    // Onglets peu remplis = cases plus grandes
    const sparse = ['formule', 'riz', 'sides', 'loaded'].includes(selCat);
    const minW = sparse ? mob ? 180 : 240 : mob ? 145 : 175;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: pb,
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill,minmax(${minW}px,1fr))`,
        gap: sparse ? 12 : 9,
        alignContent: 'start'
      }
    }, prods.map(p => /*#__PURE__*/React.createElement(PCard, {
      key: p.id,
      p: p,
      cat: selCat
    })));
  };
  const CartPanel = ({
    isDrawer = false
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderBottom: `1px solid ${T.brd}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: T.txt
    }
  }, "Panier \xB7 ", cart.length, " article", cart.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, cart.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setCart([]),
    style: {
      padding: '3px 10px',
      borderRadius: 4,
      border: `1px solid ${T.no}`,
      background: T.noL,
      color: T.no,
      fontSize: 10,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Vider"), isDrawer && /*#__PURE__*/React.createElement("button", {
    onClick: () => setCartOpen(false),
    style: {
      padding: '3px 10px',
      borderRadius: 4,
      border: `1px solid ${T.brd}`,
      background: 'transparent',
      color: T.txtSub,
      fontSize: 10,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Fermer"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '6px 10px'
    }
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '32px 14px',
      color: T.txtMuted
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, "Aucun article"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 4
    }
  }, "S\xE9lectionnez des produits")) : cart.map(item => /*#__PURE__*/React.createElement(CItem, {
    key: item.id,
    item: item,
    onEdit: () => handleEdit(item),
    onDel: () => rmCart(item.id),
    onQ: d => updQty(item.id, d)
  }))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      borderTop: `1px solid ${T.brd}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 10,
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: T.txtSub
    }
  }, "Total"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: T.primary
    }
  }, fp(cartTotal))), phoneAddCtx ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F59E0B',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 6,
      marginBottom: 8,
      fontSize: 12,
      fontWeight: 700,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Ajout commande #", phoneAddCtx.orderNum), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPhoneAddCtx(null);
      setCart([]);
      setView('telephone');
    },
    style: {
      background: 'rgba(0,0,0,0.2)',
      border: 'none',
      color: '#fff',
      borderRadius: 4,
      padding: '2px 8px',
      cursor: 'pointer',
      fontSize: 11
    }
  }, "X")), cart.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: finalizePhoneAdd,
    style: {
      width: '100%',
      padding: 14,
      borderRadius: 6,
      border: 'none',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      background: '#F59E0B',
      color: '#fff'
    }
  }, "Ajouter a commande #", phoneAddCtx.orderNum)) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmM(true),
    style: {
      width: '100%',
      padding: 14,
      borderRadius: 6,
      border: 'none',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      background: T.ok,
      color: T.white,
      boxShadow: `0 4px 14px ${T.ok}40`
    }
  }, "Valider la commande")));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: T.bg,
      color: T.txt,
      overflow: 'hidden',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 84,
      background: `linear-gradient(135deg,#6B35C2 0%,#5425A8 55%,#421890 100%)`,
      flexShrink: 0,
      boxShadow: '0 4px 24px rgba(84,37,168,0.35)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: mob ? 52 : 68
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 36,
      background: 'rgba(255,255,255,0.22)',
      margin: '0 4px'
    }
  }), [{
    id: 'pos',
    l: 'Caisse'
  }, {
    id: 'telephone',
    l: 'Téléphone',
    badge: phoneOrders.length
  }, {
    id: 'stock',
    l: 'Stock'
  }, {
    id: 'dashboard',
    l: 'Dashboard',
    pr: true
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => t.pr ? setPinFor(t.id) : setView(t.id),
    style: {
      padding: mob ? '7px 12px' : '8px 20px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontSize: mob ? 12 : 14,
      fontWeight: view === t.id ? 700 : 500,
      background: view === t.id ? 'rgba(255,255,255,0.22)' : 'transparent',
      color: view === t.id ? '#fff' : 'rgba(255,255,255,0.7)',
      transition: 'all .15s',
      position: 'relative'
    }
  }, t.l, t.badge > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      right: 2,
      background: '#EF4444',
      color: '#fff',
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 900,
      padding: '1px 5px',
      minWidth: 16,
      textAlign: 'center'
    }
  }, t.badge)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, printSt && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#fff',
      fontWeight: 700,
      background: 'rgba(0,0,0,0.18)',
      padding: '4px 12px',
      borderRadius: 10
    }
  }, printSt), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: '#fff'
    }
  }, ft(now)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.6)'
    }
  }, fd(now))))), view === 'pos' && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      padding: '10px 14px',
      overflowX: 'auto',
      flexShrink: 0,
      borderBottom: `1px solid ${T.brd}`,
      background: T.bgCard
    }
  }, xCats.map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat.id,
    onClick: () => setSelCat(cat.id),
    style: {
      padding: mob ? '9px 14px' : '10px 22px',
      borderRadius: 6,
      border: selCat === cat.id ? `2.5px solid ${cat.color}` : '2px solid transparent',
      cursor: 'pointer',
      fontSize: mob ? 12 : 14,
      fontWeight: selCat === cat.id ? 700 : 500,
      whiteSpace: 'nowrap',
      background: selCat === cat.id ? `${cat.color}12` : T.bg,
      color: selCat === cat.id ? cat.color : T.txtSub,
      transition: 'all .12s'
    }
  }, cat.name))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }
  }, renderGrid())), !mob && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 310,
      display: 'flex',
      flexDirection: 'column',
      background: T.bgSide,
      borderLeft: `1px solid ${T.brd}`,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(CartPanel, null)), mob && /*#__PURE__*/React.createElement(React.Fragment, null, cartOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 64,
      left: 0,
      right: 0,
      zIndex: 500,
      background: T.bgSide,
      borderTop: `2px solid ${T.brd}`,
      maxHeight: '52vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -6px 24px rgba(180,143,224,0.15)'
    }
  }, /*#__PURE__*/React.createElement(CartPanel, {
    isDrawer: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 600,
      background: T.bgCard,
      borderTop: `1px solid ${T.brd}`,
      padding: '8px 14px',
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      color: T.txtMuted,
      fontSize: 13,
      padding: '6px 0'
    }
  }, "S\xE9lectionnez des produits") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCartOpen(!cartOpen),
    style: {
      flex: 1,
      padding: '11px 8px',
      borderRadius: 6,
      border: `1.5px solid ${T.brd}`,
      background: T.bg,
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: T.txtSub
    }
  }, cart.length, " article", cart.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.primary,
      fontWeight: 800,
      fontSize: 17
    }
  }, fp(cartTotal))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmM(true),
    style: {
      flex: 1.2,
      padding: '15px',
      borderRadius: 6,
      border: 'none',
      background: T.ok,
      color: T.white,
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: `0 4px 14px ${T.ok}40`
    }
  }, "Valider"))))), view === 'stock' && /*#__PURE__*/React.createElement(StockView, {
    stockOut: stockOut,
    customProds: customProds,
    onSaveCP: saveCP,
    toggle: togStock
  }), view === 'dashboard' && /*#__PURE__*/React.createElement(Dash, {
    orders: orders,
    phoneOrders: phoneOrders,
    onSendReport: (dayOrders,dateStr,screenshot)=>sendDailyReport(dateStr,dayOrders,screenshot),
    onReset: () => {
      if (window.confirm('Reset toutes les commandes du jour ?')) {
        setOrders(p => p.filter(o => fd(o.date) !== fd(new Date())));
        LS.set('osm7-counter', {
          date: '',
          num: 0
        });
      }
    }
  }), view === 'telephone' && /*#__PURE__*/React.createElement(TelephoneView, {
    phoneOrders: phoneOrders,
    onPaid: payPhoneOrder,
    onSplit: splitPhoneOrder,
    onStartAdd: order => {
      setPhoneAddCtx({
        orderId: order.id,
        orderNum: order.num
      });
      setView('pos');
    },
    onDelete: id => {
      setPhoneOrders(p => {
        const u = p.filter(x => x.id !== id);
        LS.set('osm7-phoneorders', u);
        return u;
      });
    }
  }), pinFor && /*#__PURE__*/React.createElement(PinModal, {
    onClose: () => setPinFor(null),
    title: "Dashboard",
    onOk: () => {
      setView(pinFor);
      setPinFor(null);
    }
  }), burgerStartM && /*#__PURE__*/React.createElement(BurgerStartModal, {
    product: burgerStartM,
    onClose: () => setBurgerStartM(null),
    onChoice: mode => {
      const p = burgerStartM;
      setBurgerStartM(null);
      setCustM({
        product: p,
        type: 'burger',
        inMenu: mode === 'menu'
      });
    }
  }), custM?.type === 'burger' && /*#__PURE__*/React.createElement(BurgerCust, {
    product: custM.product,
    initial: custM.initial,
    inMenu: custM.inMenu,
    onClose: () => setCustM(null),
    onOk: (c, ext) => {
      if (custM.editId) {
        editCC(custM.editId, c, ext, custM.product.price + (custM.inMenu ? 3 : 0));
        setCustM(null);
        return;
      }
      const h = c.retraits.length || c.supplements.length || c.sauces.length || c.version || c.note || c.twisterSauce || c.twisterSupps?.length;
      const basePrice = custM.product.price + (custM.inMenu ? 3 : 0);
      if (custM.inMenu) {
        // Demander la boisson
        const cb = drink => addCart(custM.product.name + ' (en menu)', basePrice + ext, custM.product.id, {
          ...c,
          drink,
          inMenu: true,
          fritesSauce: c.twisterSauce,
          fritesSupps: c.twisterSupps
        });
        setCustM(null);
        setDrinkM({
          cb
        });
      } else {
        addCart(custM.product.name, basePrice + ext, custM.product.id, h ? c : null);
        setCustM(null);
      }
    }
  }), custM?.type === 'riz' && /*#__PURE__*/React.createElement(RizCust, {
    product: custM.product,
    initial: custM.initial,
    onClose: () => setCustM(null),
    onOk: c => {
      if (custM.editId) {
        editCC(custM.editId, c, 0, custM.product.price);
        setCustM(null);
        return;
      }
      if (custM.needsDrink) {
        const rc = c,
          pr = custM.product;
        setCustM(null);
        setDrinkM({
          cb: d => addCart(pr.name + (d ? ` (${d})` : ''), pr.price, pr.id, {
            ...rc,
            drink: d
          })
        });
      } else {
        addCart(custM.product.name, custM.product.price, custM.product.id, c);
        setCustM(null);
      }
    }
  }), custM?.type === 'loaded' && /*#__PURE__*/React.createElement(LoadedCust, {
    product: custM.product,
    initial: custM.initial,
    onClose: () => setCustM(null),
    onOk: (c, ext) => {
      if (custM.editId) editCC(custM.editId, c, ext, custM.product.price);else {
        const h = c.retraits.length || c.supplements.length || c.note;
        addCart(custM.product.name, custM.product.price + ext, custM.product.id, h ? c : null);
      }
      setCustM(null);
    }
  }), (custM?.type === 'milk' || custM?.type === 'crepe') && /*#__PURE__*/React.createElement(TopModal, {
    product: custM.product,
    isCrepe: custM.type === 'crepe',
    initial: custM.initial,
    onClose: () => setCustM(null),
    onOk: (c, ext) => {
      if (custM.editId) editCC(custM.editId, c, ext, custM.product.price);else {
        const h = c.toppings.length || c.glace || c.chantilly || c.note;
        addCart(custM.product.name, custM.product.price + ext, custM.product.id, h ? c : null);
      }
      setCustM(null);
    }
  }), drinkM && /*#__PURE__*/React.createElement(DrinkPick, {
    onClose: () => setDrinkM(null),
    onPick: d => {
      drinkM.cb(d);
      setDrinkM(null);
    }
  }), duoM && /*#__PURE__*/React.createElement(DuoBuild, {
    formule: duoM,
    onClose: () => setDuoM(null),
    onAdd: item => {
      addCart(item.name, item.price, duoM.id, item.cust);
      setDuoM(null);
    }
  }), etudM && /*#__PURE__*/React.createElement(MenuEtud, {
    formule: etudM,
    onClose: () => setEtudM(null),
    onAdd: item => {
      addCart(item.name, item.price, etudM.id, item.cust);
      setEtudM(null);
    }
  }), fritesM && /*#__PURE__*/React.createElement(FritesSauce, {
    product: fritesM,
    initial: fritesM.initial,
    onClose: () => setFritesM(null),
    onOk: (c, ext) => {
      if (fritesM.editId) editCC(fritesM.editId, c, ext, fritesM.price);else {
        const has = c.sauce || c.supps.length;
        addCart(fritesM.name, fritesM.price + ext, fritesM.id, has ? c : null);
      }
      setFritesM(null);
    }
  }), confirmM && /*#__PURE__*/React.createElement(ConfirmModal, {
    cart: cart,
    cartTotal: cartTotal,
    clientName: clientName,
    setClientName: setClientName,
    onCancel: () => setConfirmM(false),
    onValidate: placeOrder,
    onSplit: (svc, pay) => {
      const num = getNextOrderNum();
      const o = {
        id: uid(),
        num,
        date: new Date().toISOString(),
        items: cart.map(c => ({
          ...c
        })),
        total: cartTotal,
        status: 'en cours',
        client: clientName || null,
        service: svc,
        payment: pay
      };
      setConfirmM(false);
      setSplitCartM(o);
    }
  }), splitCartM && /*#__PURE__*/React.createElement(SplitModal, {
    order: splitCartM,
    onClose: () => setSplitCartM(null),
    onPay: async tickets => {
      setSplitCartM(null);
      setCart([]);
      setClientName('');
      setCartOpen && setCartOpen(false);
      await splitCartOrder(splitCartM, tickets);
    }
  }), successM && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setSuccessM(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...card(),
      width: 'min(85vw,400px)',
      padding: 28,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 68,
      height: 68,
      borderRadius: '50%',
      background: T.okL,
      border: `3px solid ${T.ok}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      fontSize: 32
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: T.txtSub,
      textTransform: 'uppercase',
      letterSpacing: 1
    }
  }, successM.isTel ? '📞 Commande téléphone' : 'Commande envoyée'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 60,
      fontWeight: 900,
      color: successM.isTel ? '#2563EB' : T.primary,
      margin: '4px 0',
      fontFamily: 'monospace'
    }
  }, "#", successM.num), successM.isTel && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#2563EB',
      fontWeight: 700,
      background: '#DBEAFE',
      padding: '8px 16px',
      borderRadius: 6,
      marginBottom: 8
    }
  }, "Ticket cuisine imprim\xE9. Le ticket caisse sera imprim\xE9 \xE0 l'arriv\xE9e du client."), successM.client && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.txtSub,
      marginBottom: 4,
      fontWeight: 600
    }
  }, "Client : ", successM.client), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 8,
      flexWrap: 'wrap'
    }
  }, successM.service && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: T.warn,
      fontWeight: 700,
      background: T.warnL,
      padding: '4px 12px',
      borderRadius: 10
    }
  }, successM.service), successM.payment && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: successM.payment === 'CB' ? '#2563EB' : T.ok,
      fontWeight: 700,
      background: successM.payment === 'CB' ? '#DBEAFE' : T.okL,
      padding: '4px 12px',
      borderRadius: 10
    }
  }, successM.payment)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      color: T.primary,
      marginBottom: 16
    }
  }, fp(successM.total)), printSt && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: T.ok,
      padding: '5px 14px',
      background: T.okL,
      borderRadius: 10,
      display: 'inline-block',
      marginBottom: 16
    }
  }, printSt), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => printTicket(successM),
    style: {
      ...btn(T.bg, T.txtSub, {
        flex: 1,
        border: `1px solid ${T.brd}`,
        fontSize: 13
      })
    }
  }, "Reimprimer"), /*#__PURE__*/React.createElement("button", {
    onClick: () => sendPrintCuisine(successM),
    style: {
      ...btn('#EFF6FF', '#2563EB', {
        flex: 1,
        border: '1.5px solid #BFDBFE',
        fontSize: 13
      })
    }
  }, "Cuisine"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSuccessM(null),
    style: {
      ...btn(T.primary, T.white, {
        flex: 2,
        fontSize: 16,
        fontWeight: 700
      })
    }
  }, "Nouvelle commande")))));
}
