import React from 'react';
import { T } from '../data/theme.js';
import { fp } from '../utils/format.js';
import { IconMoney, IconSun, IconMoon } from './icons.jsx';

export const CATEGORIES = [
  { key: 'burgers', label: 'Burgers', tint: '#D97706', test: pid => pid.startsWith('b-') },
  { key: 'bao', label: 'BAO', tint: '#E91E63', test: pid => pid.startsWith('bao-') },
  { key: 'menus', label: 'Menus', tint: '#7C3AED', test: pid => pid.startsWith('f-') },
  { key: 'riz', label: 'Riz Crousty', tint: T.primary, test: pid => pid.startsWith('r-') },
  { key: 'sides', label: 'Sides', tint: '#0EA5E9', test: pid => pid.startsWith('si-') || pid.startsWith('lo-') },
  { key: 'desserts', label: 'Desserts', tint: '#DB2777', test: pid => pid.startsWith('de-') || pid.startsWith('cr-') },
  { key: 'boissons', label: 'Boissons', tint: '#2563EB', test: pid => pid.startsWith('dr-') },
  { key: 'milkshakes', label: 'Milkshakes', tint: '#0D9488', test: pid => pid.startsWith('mk-') }
];

const iconTileStyle = tint => ({
  width: 38,
  height: 38,
  borderRadius: 6,
  background: 'transparent',
  color: tint,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
});

export function StatTile({ icon, label, value, tint, compact }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: T.gradViolet,
      borderRadius: 5,
      border: `1px solid ${T.brd}`,
      boxShadow: 'none',
      padding: compact ? '11px 12px' : '16px',
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 9 : 12,
      minHeight: compact ? 56 : 64
    }
  },
    /*#__PURE__*/React.createElement('div', { style: compact ? { ...iconTileStyle(tint), width: 30, height: 30, borderRadius: 6 } : iconTileStyle(tint) }, icon),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: compact ? 11 : 12.5, color: T.txtSub, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, label),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: compact ? 15 : 20, fontWeight: 600, color: T.txt, marginTop: 2, whiteSpace: 'nowrap' } }, value)
    )
  );
}

export function HeroRevenue({ value, tag }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: T.bgCard,
      borderRadius: 6,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${T.brd}`,
      boxShadow: 'none'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: 38, height: 38, borderRadius: 6,
        background: 'transparent', color: T.txt,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(IconMoney, { size: 30 })),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: T.txt, textTransform: 'uppercase', letterSpacing: 0.8 } }, "Chiffre d'affaires " + tag),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 'clamp(28px, 4vw, 34px)', fontWeight: 600, color: T.txt, marginTop: 4, lineHeight: 1, whiteSpace: 'nowrap' } }, value)
    )
  );
}

export function PaymentHeroCard({ icon, label, value, bg, shadow, glow }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: T.bgCard,
      borderRadius: 6,
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 80,
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${T.brd}`,
      boxShadow: 'none'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: 38, height: 38, borderRadius: 6,
        background: 'transparent', color: T.txt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { position: 'relative' } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, fontWeight: 600, color: T.txt } }, label),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 600, color: T.txt, marginTop: 3 } }, value)
    )
  );
}

export function SectionLabel({ children }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { fontSize: 12, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 20px 8px' }
  }, children);
}

export function WideStat({ icon, label, value, tint, gradient, size }) {
  const isLg = size === 'lg';
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: T.bgCard,
      border: `1px solid ${T.brd}`,
      borderRadius: 6,
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: 'none'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: isLg ? 50 : 40, height: isLg ? 50 : 40, borderRadius: 6,
        background: 'transparent', color: tint,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, fontWeight: 600, color: T.txtSub, textTransform: 'uppercase', letterSpacing: 0.6 } }, label),
      /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: isLg ? '24px' : '22px',
          fontWeight: 600, color: T.txt, marginTop: 3, lineHeight: 1
        }
      }, value)
    )
  );
}

export const MIDI_HOURS = [11, 12, 13, 14];
export const SOIR_HOURS = [18, 19, 20, 21, 22, 23, 0];

export const MIDI_CHART_THEME = {
  bg: T.bgCard, iconBg: 'transparent', iconColor: '#876B42', bar: '#A18A64',
  barShadow: 'none', text: T.txt, subText: T.txtSub, shadow: 'none', glow: 'transparent'
};
export const SOIR_CHART_THEME = {
  bg: T.bgCard, iconBg: 'transparent', iconColor: '#616D82', bar: '#78869B',
  barShadow: 'none', text: T.txt, subText: T.txtSub, shadow: 'none', glow: 'transparent'
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
      flex: 1,
      minWidth: 0,
      borderRadius: 6,
      padding: '22px 20px 20px',
      background: theme.bg,
      border: `1px solid ${T.brd}`,
      boxShadow: 'none',
      position: 'relative',
      overflow: 'hidden'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative' } },
      /*#__PURE__*/React.createElement('div', {
        style: {
          width: 42, height: 42, borderRadius: 6,
          background: theme.iconBg, color: theme.iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      }, icon),
      /*#__PURE__*/React.createElement('div', { style: { textAlign: 'right' } },
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: theme.subText } }, title),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: theme.text, marginTop: 2 } }, fp(totalRevenue))
      )
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: hours.length > 5 ? 8 : 16, height: 140, position: 'relative' } },
      buckets.map(b => /*#__PURE__*/React.createElement('div', {
        key: b.hour,
        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }
      },
        /*#__PURE__*/React.createElement('div', {
          title: hourLabel(b.hour) + 'h : ' + fp(b.total),
          style: {
            width: '100%',
            maxWidth: 46,
            height: Math.max(6, (b.total / max) * 110),
            background: theme.bar,
            borderRadius: '3px 3px 0 0',
            boxShadow: 'none',
            transition: 'none'
          }
        }),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 11.5, fontWeight: 600, color: theme.subText } }, hourLabel(b.hour))
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
      icon: /*#__PURE__*/React.createElement(IconSun, { size: 22 }),
      hours: MIDI_HOURS,
      orders,
      theme: MIDI_CHART_THEME
    }),
    /*#__PURE__*/React.createElement(ServiceHourChart, {
      title: 'Service du soir',
      icon: /*#__PURE__*/React.createElement(IconMoon, { size: 20 }),
      hours: SOIR_HOURS,
      orders,
      theme: SOIR_CHART_THEME
    })
  );
}
