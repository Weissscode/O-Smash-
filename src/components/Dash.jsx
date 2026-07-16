import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp, ft, fd } from '../utils/format.js';
import { downloadDashboardPDF, getDashboardScreenshotBase64 } from '../utils/dashboardExport.js';
import { BarChart } from './BarChart.jsx';
import { AreaChart } from './AreaChart.jsx';
import { PieChart } from './PieChart.jsx';
import { StatCard } from './StatCard.jsx';
import { MiniStat } from './MiniStat.jsx';
import { InsightsCard } from './InsightsCard.jsx';

export function Dash({
  orders,
  phoneOrders,
  onReset,
  onSendReport
}) {
  const today = fd(new Date());
  const tO = orders.filter(o => fd(o.date) === today && o.status !== 'annulee');
  const telTotal = tO.filter(o => o.phone).length + (phoneOrders || []).filter(o => fd(o.date) === today).length;
  const midi = tO.filter(o => new Date(o.date).getHours() < 15);
  const soir = tO.filter(o => new Date(o.date).getHours() >= 15);
  const rev = tO.reduce((s, o) => s + o.total, 0);
  const revM = midi.reduce((s, o) => s + o.total, 0);
  const revS = soir.reduce((s, o) => s + o.total, 0);
  const revEsp = tO.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = tO.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const [tab, setTab] = React.useState('all');
  const [sending, setSending] = React.useState(false);
  const [capturing, setCapturing] = React.useState(false);
  const dashRef = React.useRef(null);
  const shown = tab === 'midi' ? midi : tab === 'soir' ? soir : tO;
  const cnt = pref => shown.reduce((s, o) => s + o.items.filter(i => (i.pid || '').startsWith(pref)).reduce((a, i) => a + i.qty, 0), 0);

  // Top produits
  const prodTally = {};
  shown.forEach(o => o.items.forEach(i => {
    const key = i.name;
    prodTally[key] = (prodTally[key] || 0) + i.qty;
  }));
  const topProducts = Object.entries(prodTally).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({
    label,
    value,
    valueLabel: value
  }));

  // CA par heure
  const hourBuckets = Array.from({
    length: 24
  }, (_, h) => ({
    label: h + 'h',
    value: 0
  }));
  shown.forEach(o => {
    const h = new Date(o.date).getHours();
    hourBuckets[h].value += o.total;
  });
  const activeHours = hourBuckets.filter((h, i) => i >= 8 && i <= 23);
  const hourData = activeHours.map(h => ({
    label: h.label,
    value: Math.round(h.value),
    valueLabel: h.value > 0 ? Math.round(h.value) + 'e' : ''
  }));

  // Repartition paiement
  const paymentData = [{
    label: 'Especes',
    value: revEsp,
    color: '#10B981'
  }, {
    label: 'CB',
    value: revCB,
    color: '#2563EB'
  }];
  // Repartition service
  const surPlace = shown.filter(o => o.service === 'Sur place').length;
  const emporter = shown.filter(o => o.service === 'A emporter' || o.service === 'À emporter').length;
  const telCnt = shown.filter(o => o.phone).length;
  const serviceData = [{
    label: 'Sur place',
    value: surPlace,
    color: '#7C3AED'
  }, {
    label: 'A emporter',
    value: emporter,
    color: '#F59E0B'
  }, {
    label: 'Telephone',
    value: telCnt,
    color: '#2563EB'
  }];
  const St = ({l, v, c = T.primary}) => /*#__PURE__*/React.createElement(StatCard, {label: l, value: v, color: c});
  const tabBtn = (id, label, color) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setTab(id),
    style: {
      flex: 1,
      padding: '10px 8px',
      borderRadius: 10,
      border: `2px solid ${tab === id ? color : T.brd}`,
      background: tab === id ? `${color}12` : T.bgCard,
      color: tab === id ? color : T.txtSub,
      fontSize: 13,
      fontWeight: tab === id ? 700 : 500,
      cursor: 'pointer'
    }
  }, label);
  const ChartCard = ({
    title,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      ...card(),
      padding: '14px 16px',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.txtMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 10
    }
  }, title), children);
  const handleSendReport = async useYesterday => {
    if (sending) return;
    setSending(true);
    let targetDate = today,
      targetOrders = tO;
    if (useYesterday) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      targetDate = fd(y);
      targetOrders = orders.filter(o => fd(o.date) === targetDate && o.status !== 'annulee');
    }
    if (targetOrders.length === 0) {
      setSending(false);
      alert('Aucune commande pour ' + (useYesterday ? 'hier' : 'aujourd\'hui') + ' — rien a envoyer.');
      return;
    }
    let screenshot = null;
    if (!useYesterday && dashRef.current) {
      try { screenshot = await getDashboardScreenshotBase64(dashRef.current); }
      catch(e) { console.error('Screenshot error:', e.message); }
    }
    const r = await onSendReport(targetOrders, targetDate, screenshot);
    setSending(false);
    alert(r && r.success ? 'Rapport envoye par mail !' : 'Erreur : ' + (r && r.error ? r.error : 'connexion impossible'));
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
      padding: '14px 20px',
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
  }, "Dashboard"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.txtSub,
      marginTop: 2
    }
  }, today)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleSendReport(false),
    disabled: sending,
    style: {
      ...btn('#16A34A', T.white, {
        fontSize: 10.5,
        padding: '6px 10px',
        borderRadius: 6,
        fontWeight: 700
      })
    }
  }, sending ? 'Envoi..' : 'Envoyer (aujourd\'hui)'), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleSendReport(true),
    disabled: sending,
    style: {
      ...btn('#059669', T.white, {
        fontSize: 10.5,
        padding: '6px 10px',
        borderRadius: 6,
        fontWeight: 700
      })
    }
  }, "Envoyer (hier)"), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      const r = await fetch(`${PRINT_SERVER}/test-email`, { method: 'POST' }).then(x=>x.json()).catch(e=>({success:false,error:e.message}));
      alert(r && r.success ? 'Email de test envoye ! Verifie ta boite mail.' : 'Erreur : ' + (r && r.error || 'connexion impossible'));
    },
    style: {
      ...btn('#9333EA', T.white, {
        fontSize: 10.5,
        padding: '6px 10px',
        borderRadius: 6,
        fontWeight: 700
      })
    }
  }, 'Test email'), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (capturing) return;
      setCapturing(true);
      try { await downloadDashboardPDF(dashRef.current, today); }
      catch(e) { alert('Erreur capture : ' + e.message); }
      setCapturing(false);
    },
    disabled: capturing,
    style: {
      ...btn(T.primary, T.white, {
        fontSize: 10.5,
        padding: '6px 10px',
        borderRadius: 6,
        fontWeight: 700
      })
    }
  }, capturing ? 'Capture..' : 'Exporter PDF'), /*#__PURE__*/React.createElement("button", {
    onClick: onReset,
    style: {
      ...btn(T.noL, T.no, {
        fontSize: 12
      })
    }
  }, "Reset journee"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 12,
      padding: '14px 20px',
      flexShrink: 0
    }
  },
  /*#__PURE__*/React.createElement(StatCard, { label: "Journee totale", value: fp(rev), sub: tO.length + " commandes", color: T.primary }),
  /*#__PURE__*/React.createElement(StatCard, { label: "Midi (avant 15h)", value: fp(revM), sub: midi.length + " commandes", color: "#D97706" }),
  /*#__PURE__*/React.createElement(StatCard, { label: "Soir (apres 15h)", value: fp(revS), sub: soir.length + " commandes", color: "#7C3AED" })
  ), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      padding: '0 20px 14px',
      flexShrink: 0
    }
  },
  /*#__PURE__*/React.createElement(StatCard, { label: "Especes", value: fp(revEsp), color: "#10B981" }),
  /*#__PURE__*/React.createElement(StatCard, { label: "Carte bancaire", value: fp(revCB), color: "#2563EB" })
  ), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '10px 20px',
      borderBottom: `1px solid ${T.brd}`,
      flexShrink: 0
    }
  }, tabBtn('all', 'Toute la journée', T.primary), tabBtn('midi', 'Midi', '#D97706'), tabBtn('soir', 'Soir', '#7C3AED')), /*#__PURE__*/React.createElement("div", {
    ref: dashRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '14px 20px'
    }
  }, /*#__PURE__*/React.createElement(InsightsCard, {
    orders: shown
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(MiniStat, {
    label: "Commandes",
    value: shown.length,
    color: T.ok
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Par tel",
    value: telTotal,
    color: '#2563EB'
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Burgers",
    value: cnt('b-'),
    color: T.primary
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Riz",
    value: cnt('r-'),
    color: T.warn
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Boissons",
    value: cnt('dr-'),
    color: "#2563EB"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Milkshakes",
    value: cnt('mk-'),
    color: "#7C3AED"
  }), /*#__PURE__*/React.createElement(MiniStat, {
    label: "Crepes+Desserts",
    value: cnt('cr-') + cnt('de-'),
    color: "#DB2777"
  })), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Chiffre d'affaires par heure"
  }, hourData.some(h => h.value > 0) ? /*#__PURE__*/React.createElement(AreaChart, {
    data: hourData,
    color: T.primary,
    height: 150
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.txtMuted,
      fontSize: 13,
      textAlign: 'center',
      padding: 20
    }
  }, "Pas encore de donnees")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Repartition paiement"
  }, revEsp + revCB > 0 ? /*#__PURE__*/React.createElement(PieChart, {
    data: paymentData,
    size: 120,
    centerLabel: fp(revEsp+revCB)
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.txtMuted,
      fontSize: 13,
      textAlign: 'center',
      padding: 10
    }
  }, "Aucune donnee")), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Repartition service"
  }, surPlace + emporter + telCnt > 0 ? /*#__PURE__*/React.createElement(PieChart, {
    data: serviceData,
    size: 120,
    centerLabel: (surPlace+emporter+telCnt)
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.txtMuted,
      fontSize: 13,
      textAlign: 'center',
      padding: 10
    }
  }, "Aucune donnee"))), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Top 5 produits"
  }, topProducts.length > 0 ? /*#__PURE__*/React.createElement(BarChart, {
    data: topProducts,
    color: "#DB2777"
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.txtMuted,
      fontSize: 13,
      textAlign: 'center',
      padding: 20
    }
  }, "Aucune vente")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.txtMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 10,
      marginTop: 16
    }
  }, "Historique"), shown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 40,
      color: T.txtMuted
    }
  }, "Aucune commande") : shown.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    style: {
      ...card(),
      padding: '12px 16px',
      marginBottom: 6,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      color: T.primary,
      fontSize: 16,
      fontFamily: 'monospace'
    }
  }, "#", o.num), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: T.txtMuted
    }
  }, ft(o.date)), o.client && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: T.txtSub,
      fontWeight: 600,
      background: T.primaryL,
      padding: '1px 8px',
      borderRadius: 20
    }
  }, o.client), o.service && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: T.warn,
      fontWeight: 600,
      background: T.warnL,
      padding: '1px 8px',
      borderRadius: 20
    }
  }, o.service), o.payment && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: o.payment === 'CB' ? '#2563EB' : T.ok,
      fontWeight: 600,
      background: o.payment === 'CB' ? '#DBEAFE' : T.okL,
      padding: '1px 8px',
      borderRadius: 20
    }
  }, o.payment)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.txtSub,
      marginTop: 3
    }
  }, o.items.map(i => `${i.qty}x ${i.name}`).join(', '))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      color: T.primary,
      fontSize: 16
    }
  }, fp(o.total))))));
}

