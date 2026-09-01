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
  borderRadius: 11,
  background: tint + '17',
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
      borderRadius: compact ? 14 : 18,
      border: '1px solid rgba(180,143,224,0.18)',
      boxShadow: T.shSoft,
      padding: compact ? '11px 12px' : '16px',
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 9 : 12,
      minHeight: compact ? 56 : 78
    }
  },
    /*#__PURE__*/React.createElement('div', { style: compact ? { ...iconTileStyle(tint), width: 30, height: 30, borderRadius: 9 } : iconTileStyle(tint) }, icon),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: compact ? 11 : 12.5, color: T.txtSub, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, label),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: compact ? 15 : 20, fontWeight: 800, color: T.txt, marginTop: 2, whiteSpace: 'nowrap' } }, value)
    )
  );
}

export function HeroRevenue({ value, tag }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: `linear-gradient(135deg, ${T.primary}, ${T.primaryD})`,
      borderRadius: 22,
      padding: '26px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.25)',
      boxShadow: `0 10px 28px ${T.primaryD}40`
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        position: 'absolute', top: -50, right: -30, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(255,255,255,0.16)', filter: 'blur(20px)', pointerEvents: 'none'
      }
    }),
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: 58, height: 58, borderRadius: 16,
        background: 'rgba(255,255,255,0.2)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(IconMoney, { size: 30 })),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.8 } }, "Chiffre d'affaires " + tag),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 'clamp(34px, 9vw, 48px)', fontWeight: 800, color: '#fff', marginTop: 4, lineHeight: 1, whiteSpace: 'nowrap' } }, value)
    )
  );
}

export function PaymentHeroCard({ icon, label, value, bg, shadow, glow }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: bg,
      borderRadius: 20,
      padding: '18px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 120,
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: shadow
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        position: 'absolute', top: -30, right: -30, width: 100, height: 100,
        borderRadius: '50%', background: glow, filter: 'blur(16px)', pointerEvents: 'none'
      }
    }),
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: 38, height: 38, borderRadius: 11,
        background: 'rgba(255,255,255,0.22)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { position: 'relative' } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)' } }, label),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: '#fff', marginTop: 3 } }, value)
    )
  );
}

export function SectionLabel({ children }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { fontSize: 12, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 20px 8px' }
  }, children);
}

export function WideStat({ icon, label, value, tint, gradient, size }) {
  const isLg = size === 'lg';
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: gradient || (tint + '14'),
      border: `1px solid ${tint}30`,
      borderRadius: 18,
      padding: isLg ? '20px 22px' : '15px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: T.shSoft
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: isLg ? 50 : 40, height: isLg ? 50 : 40, borderRadius: 14,
        background: tint + '22', color: tint,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, fontWeight: 700, color: tint, textTransform: 'uppercase', letterSpacing: 0.6 } }, label),
      /*#__PURE__*/React.createElement('div', {
        style: {
          fontSize: isLg ? 'clamp(26px, 7vw, 34px)' : 'clamp(21px, 5.5vw, 26px)',
          fontWeight: 800, color: T.txt, marginTop: 3, lineHeight: 1
        }
      }, value)
    )
  );
}

export const MIDI_HOURS = [11, 12, 13, 14];
export const SOIR_HOURS = [18, 19, 20, 21, 22, 23, 0];

export const MIDI_CHART_THEME = {
  bg: 'linear-gradient(160deg, #FFFBF2 0%, #FFF4DE 55%, #FFE9BF 100%)',
  iconBg: 'rgba(217,119,6,0.15)',
  iconColor: '#D97706',
  bar: 'linear-gradient(180deg, #FCD34D, #F59E0B)',
  barShadow: '0 8px 16px rgba(245,158,11,0.35)',
  text: '#7C3E0A',
  subText: '#B45309',
  shadow: '0 10px 30px rgba(217,119,6,0.14)',
  glow: 'rgba(252,211,77,0.35)'
};

export const SOIR_CHART_THEME = {
  bg: 'linear-gradient(160deg, #251A3D 0%, #2E2154 55%, #1B1330 100%)',
  iconBg: 'rgba(216,180,254,0.16)',
  iconColor: '#E9D5FF',
  bar: 'linear-gradient(180deg, #C084FC, #9333EA)',
  barShadow: '0 8px 18px rgba(147,51,234,0.5)',
  text: '#F5F0FF',
  subText: 'rgba(238,225,255,0.7)',
  shadow: '0 10px 30px rgba(88,28,135,0.35)',
  glow: 'rgba(192,132,252,0.25)'
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
      borderRadius: 24,
      padding: '22px 20px 20px',
      background: theme.bg,
      boxShadow: theme.shadow,
      position: 'relative',
      overflow: 'hidden'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        position: 'absolute', top: -40, right: -40, width: 140, height: 140,
        borderRadius: '50%', background: theme.glow, filter: 'blur(18px)', pointerEvents: 'none'
      }
    }),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative' } },
      /*#__PURE__*/React.createElement('div', {
        style: {
          width: 42, height: 42, borderRadius: 13,
          background: theme.iconBg, color: theme.iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      }, icon),
      /*#__PURE__*/React.createElement('div', { style: { textAlign: 'right' } },
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: theme.subText } }, title),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: theme.text, marginTop: 2 } }, fp(totalRevenue))
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
            borderRadius: '12px 12px 4px 4px',
            boxShadow: b.total > 0 ? theme.barShadow : 'none',
            transition: 'height .45s cubic-bezier(.34,1.56,.64,1)'
          }
        }),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 11.5, fontWeight: 700, color: theme.subText } }, hourLabel(b.hour))
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
