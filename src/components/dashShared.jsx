import React from 'react';
import { T } from '../data/theme.js';
import { fp } from '../utils/format.js';
import { IconMoney, IconSun, IconMoon, IconReceipt, IconBag, IconPhone } from './icons.jsx';

// Les barres du classement par categorie partagent la meme encre : la longueur
// de la barre porte l'information, pas la couleur.
const CAT_INK = '#3A3632';

export const CATEGORIES = [
  { key: 'burgers', label: 'Burgers', tint: CAT_INK, test: pid => pid.startsWith('b-') },
  { key: 'bao', label: 'BAO', tint: CAT_INK, test: pid => pid.startsWith('bao-') },
  { key: 'menus', label: 'Menus', tint: CAT_INK, test: pid => pid.startsWith('f-') },
  { key: 'riz', label: 'Riz Crousty', tint: CAT_INK, test: pid => pid.startsWith('r-') },
  { key: 'sides', label: 'Sides', tint: CAT_INK, test: pid => pid.startsWith('si-') || pid.startsWith('lo-') },
  { key: 'desserts', label: 'Desserts', tint: CAT_INK, test: pid => pid.startsWith('de-') || pid.startsWith('cr-') },
  { key: 'boissons', label: 'Boissons', tint: CAT_INK, test: pid => pid.startsWith('dr-') },
  { key: 'milkshakes', label: 'Milkshakes', tint: CAT_INK, test: pid => pid.startsWith('mk-') }
];

const iconTileStyle = tint => ({
  width: 34,
  height: 34,
  borderRadius: T.rSm,
  background: tint + '14',
  color: tint,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
});

const panel = {
  background: T.bgCard,
  border: `1px solid ${T.brd}`,
  borderRadius: T.rMd
};

export function StatTile({ icon, label, value, tint, compact }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      ...panel,
      padding: compact ? '11px 12px' : '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 9 : 12,
      minHeight: compact ? 54 : 72
    }
  },
    /*#__PURE__*/React.createElement('div', { style: compact ? { ...iconTileStyle(tint), width: 28, height: 28 } : iconTileStyle(tint) }, icon),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: compact ? 11 : 12, color: T.txtSub, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, label),
      /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontSize: compact ? 15 : 20, fontWeight: 600, color: T.txt, marginTop: 2, whiteSpace: 'nowrap' } }, value)
    )
  );
}

// Le chiffre principal de l'ecran : gros, en chasse fixe, sans decor.
export function HeroRevenue({ value, tag }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: T.bgCard,
      border: `1px solid ${T.brd}`,
      borderRadius: T.rMd,
      padding: '20px 22px'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', gap: 8, color: T.txtSub }
    },
      /*#__PURE__*/React.createElement(IconMoney, { size: 16 }),
      /*#__PURE__*/React.createElement('div', {
        style: { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }
      }, "Chiffre d'affaires " + tag)
    ),
    /*#__PURE__*/React.createElement('div', {
      className: 'osm-num',
      style: { fontSize: 'clamp(32px, 8vw, 44px)', fontWeight: 600, color: T.txt, marginTop: 6, lineHeight: 1, whiteSpace: 'nowrap' }
    }, value)
  );
}

// Especes et carte : le filet de gauche porte la couleur, le reste reste sobre.
export function PaymentHeroCard({ icon, label, value, tint }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      ...panel,
      borderLeft: `3px solid ${tint}`,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minHeight: 104
    }
  },
    /*#__PURE__*/React.createElement('div', { style: iconTileStyle(tint) }, icon),
    /*#__PURE__*/React.createElement('div', null,
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, fontWeight: 500, color: T.txtSub } }, label),
      /*#__PURE__*/React.createElement('div', {
        className: 'osm-num',
        style: { fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 600, color: T.txt, marginTop: 2 }
      }, value)
    )
  );
}

export function SectionLabel({ children }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { fontSize: 11.5, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.7, padding: '6px 20px 8px' }
  }, children);
}

// Les trois chiffres secondaires du jour ou du mois, sur une seule ligne.
export function StatRow({ count, countLabel, avgBasket, telCount }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 12,
      margin: '0 20px 22px'
    }
  },
    /*#__PURE__*/React.createElement(StatTile, {
      icon: /*#__PURE__*/React.createElement(IconReceipt, { size: 18 }),
      label: countLabel, value: String(count), tint: T.primary
    }),
    /*#__PURE__*/React.createElement(StatTile, {
      icon: /*#__PURE__*/React.createElement(IconBag, { size: 18 }),
      label: 'Panier moyen', value: fp(avgBasket), tint: T.warn
    }),
    /*#__PURE__*/React.createElement(StatTile, {
      icon: /*#__PURE__*/React.createElement(IconPhone, { size: 18 }),
      label: 'Par téléphone', value: String(telCount), tint: T.info
    })
  );
}

export const MIDI_HOURS = [11, 12, 13, 14];
export const SOIR_HOURS = [18, 19, 20, 21, 22, 23, 0];

// Midi et soir se distinguent par la couleur des barres et l'icone, pas par un
// fond colore : ocre pour le service de jour, bleu profond pour celui du soir.
export const MIDI_CHART_THEME = {
  accent: '#A9760B',
  iconBg: '#A9760B14',
  bar: '#A9760B'
};

export const SOIR_CHART_THEME = {
  accent: '#2E4B7A',
  iconBg: '#2E4B7A14',
  bar: '#2E4B7A'
};

export function hourLabel(h) {
  return h === 0 ? '00:00' : String(h);
}

export function ServiceHourChart({ title, icon, hours, orders, theme }) {
  const buckets = hours.map(hour => ({ hour, total: 0 }));
  orders.forEach(o => {
    const h = new Date(o.date).getHours();
    const b = buckets.find(x => x.hour === h);
    if (b) b.total += o.total;
  });
  const max = Math.max(1, ...buckets.map(b => b.total));
  const totalRevenue = buckets.reduce((s, b) => s + b.total, 0);

  return /*#__PURE__*/React.createElement('div', {
    style: {
      ...panel,
      flex: 1,
      minWidth: 0,
      padding: '16px 18px 14px'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 } },
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
        /*#__PURE__*/React.createElement('div', {
          style: {
            width: 32, height: 32, borderRadius: T.rSm,
            background: theme.iconBg, color: theme.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }
        }, icon),
        /*#__PURE__*/React.createElement('div', {
          style: { fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: T.txtSub }
        }, title)
      ),
      /*#__PURE__*/React.createElement('div', {
        className: 'osm-num',
        style: { fontSize: 20, fontWeight: 600, color: T.txt }
      }, fp(totalRevenue))
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: hours.length > 5 ? 8 : 16, height: 132 } },
      buckets.map(b => /*#__PURE__*/React.createElement('div', {
        key: b.hour,
        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }
      },
        /*#__PURE__*/React.createElement('div', {
          title: hourLabel(b.hour) + 'h : ' + fp(b.total),
          style: {
            width: '100%',
            maxWidth: 44,
            height: Math.max(2, (b.total / max) * 104),
            background: b.total > 0 ? theme.bar : T.brdL,
            borderRadius: `${T.rSm}px ${T.rSm}px 0 0`
          }
        }),
        /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontSize: 11.5, fontWeight: 500, color: T.txtSub } }, hourLabel(b.hour))
      ))
    )
  );
}

export function ServiceHourCharts({ orders }) {
  return /*#__PURE__*/React.createElement('div', {
    className: 'osm-service-grid',
    style: { margin: '0 20px 24px' }
  },
    /*#__PURE__*/React.createElement(ServiceHourChart, {
      title: 'Service du midi',
      icon: /*#__PURE__*/React.createElement(IconSun, { size: 18 }),
      hours: MIDI_HOURS,
      orders,
      theme: MIDI_CHART_THEME
    }),
    /*#__PURE__*/React.createElement(ServiceHourChart, {
      title: 'Service du soir',
      icon: /*#__PURE__*/React.createElement(IconMoon, { size: 16 }),
      hours: SOIR_HOURS,
      orders,
      theme: SOIR_CHART_THEME
    })
  );
}
