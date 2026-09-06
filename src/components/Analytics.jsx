import React from 'react';
import { T } from '../data/theme.js';
import { fp, fd } from '../utils/format.js';
import { segTab } from '../utils/styles.js';
import {
  IconCash, IconCard, IconPhone, IconBag, IconReceipt,
  IconChevronLeft, IconChevronRight, IconCalendar,
  IconTrendUp, IconTrendDown, IconSun, IconMoon, IconChevronDown
} from './icons.jsx';
import {
  CATEGORIES, StatTile, HeroRevenue, PaymentHeroCard, SectionLabel, StatRow,
  ServiceHourCharts, MIDI_CHART_THEME, SOIR_CHART_THEME
} from './dashShared.jsx';

function monthKey(d) {
  const x = new Date(d);
  return x.getFullYear() + '-' + x.getMonth();
}

function monthLabel(d) {
  const s = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function dayOfWeekLabel(d) {
  const s = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dayLabel(d) {
  const startOfDay = x => { const y = new Date(x); y.setHours(0, 0, 0, 0); return y; };
  const t = startOfDay(new Date());
  const y = new Date(t); y.setDate(y.getDate() - 1);
  const dd = startOfDay(d);
  if (dd.getTime() === t.getTime()) return "Aujourd'hui";
  if (dd.getTime() === y.getTime()) return 'Hier';
  return dd.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

function pctChange(curr, prev) {
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function matchesFilter(item, filter) {
  if (filter.type === 'product') return item.name === filter.name;
  if (filter.type === 'category') {
    const pid = item.pid || '';
    const cat = CATEGORIES.find(c => c.test(pid));
    return !!cat && cat.key === filter.key;
  }
  return true;
}

function applyFilter(orders, filter) {
  if (filter.type === 'all') return orders;
  const out = [];
  orders.forEach(o => {
    const items = o.items.filter(it => matchesFilter(it, filter));
    if (items.length === 0) return;
    out.push({ ...o, items, total: items.reduce((s, it) => s + it.total, 0) });
  });
  return out;
}

function distinctProducts(orders) {
  const seen = new Set();
  orders.forEach(o => o.items.forEach(it => seen.add(it.name)));
  return Array.from(seen).sort((a, b) => a.localeCompare(b, 'fr'));
}


const PERIODS = [
  { key: 'jour', label: 'Journée' },
  { key: 'mois', label: 'Mois' }
];

function PeriodTopSwitch({ period, setPeriod }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex', gap: 2, margin: '16px 20px 12px',
      background: T.bgCard,
      border: `1px solid ${T.brd}`, borderRadius: T.rMd, padding: 3
    }
  },
    PERIODS.map(p => /*#__PURE__*/React.createElement('button', {
      key: p.key,
      className: 'osm-btn-premium',
      onClick: () => setPeriod(p.key),
      style: segTab(period === p.key, { flex: 1, padding: '9px 0', fontSize: 14.5 })
    }, p.label))
  );
}

function FilterSelect({ allLabel, value, onChange, options, active }) {
  const displayLabel = value ? (options.find(o => o.value === value) || {}).label || allLabel : allLabel;
  return /*#__PURE__*/React.createElement('div', { style: { position: 'relative', flex: 1, minWidth: 0 } },
    /*#__PURE__*/React.createElement('select', {
      value: value || '',
      onChange: e => onChange(e.target.value),
      style: {
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: 0, cursor: 'pointer', border: 'none'
      }
    },
      /*#__PURE__*/React.createElement('option', { value: '' }, allLabel),
      options.map(o => /*#__PURE__*/React.createElement('option', { key: o.value, value: o.value }, o.label))
    ),
    /*#__PURE__*/React.createElement('div', {
      style: {
        ...segTab(!!value, {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '11px 14px',
          border: `1px solid ${T.brd}`
        }),
        fontSize: 13,
        pointerEvents: 'none'
      }
    },
      /*#__PURE__*/React.createElement('span', {
        style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
      }, displayLabel),
      /*#__PURE__*/React.createElement('span', {
        style: { display: 'flex', color: T.txtMuted, flexShrink: 0 }
      }, /*#__PURE__*/React.createElement(IconChevronDown, { size: 15 }))
    )
  );
}

// Deux menus deroulants independants : chacun garde l'apparence d'un menu, et
// un liseré a gauche signale celui qui filtre reellement la page.
function FilterBar({ filter, setFilter, categoryOptions, productOptions }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { display: 'flex', gap: 10, margin: '0 20px 20px' }
  },
    /*#__PURE__*/React.createElement(FilterSelect, {
      allLabel: 'Toutes les catégories',
      value: filter.type === 'category' ? filter.key : '',
      onChange: v => setFilter(v ? { type: 'category', key: v } : { type: 'all' }),
      options: categoryOptions.map(c => ({ value: c.key, label: c.label })),
      active: filter.type !== 'product'
    }),
    /*#__PURE__*/React.createElement(FilterSelect, {
      allLabel: 'Tous les produits',
      value: filter.type === 'product' ? filter.name : '',
      onChange: v => setFilter(v ? { type: 'product', name: v } : { type: 'all' }),
      options: productOptions.map(p => ({ value: p, label: p })),
      active: filter.type === 'product'
    })
  );
}

function EmptyCard({ text }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 24px', padding: 32, textAlign: 'center', color: T.txtMuted, fontSize: 14,
      background: T.bgCard, borderRadius: T.rMd, border: `1px solid ${T.brd}`
    }
  }, text);
}

function PaymentSplitBar({ revEsp, revCB }) {
  const total = revEsp + revCB;
  const pctEsp = total > 0 ? Math.round((revEsp / total) * 100) : 50;
  const pctCB = 100 - pctEsp;
  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', background: T.bgCard, borderRadius: T.rMd, border: `1px solid ${T.brd}`, padding: '14px 16px' }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', height: 10, overflow: 'hidden' } },
      total > 0 && /*#__PURE__*/React.createElement('div', { style: { width: pctEsp + '%', background: T.ok } }),
      total > 0 && /*#__PURE__*/React.createElement('div', { style: { width: pctCB + '%', background: T.info } }),
      total === 0 && /*#__PURE__*/React.createElement('div', { style: { width: '100%', background: T.brdL } })
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10 } },
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: T.ok } }, 'Espèces ' + pctEsp + '%'),
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: T.info } }, 'CB ' + pctCB + '%')
    )
  );
}

function NavArrow({ icon, onClick, disabled }) {
  return /*#__PURE__*/React.createElement('button', {
    className: 'osm-icon-btn',
    onClick, disabled,
    style: {
      width: 40, height: 40, borderRadius: T.rSm, border: 'none', background: 'transparent',
      color: disabled ? T.txtMuted : T.txt, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1
    }
  }, icon);
}

// Une seule feuille, une ligne par categorie : le tableau se lit d'un coup
// d'oeil au lieu de s'etaler sur huit cartes separees.
const listPanel = {
  margin: '0 20px 24px',
  background: T.bgCard,
  border: `1px solid ${T.brd}`,
  borderRadius: T.rMd,
  overflow: 'hidden'
};

const listRow = idx => ({
  display: 'flex',
  alignItems: 'center',
  padding: '11px 16px',
  borderTop: idx === 0 ? 'none' : `1px solid ${T.brdL}`
});

function MonthlyCategoryList({ categoryStats, categoryTotal }) {
  const rows = CATEGORIES.map(cat => ({ ...cat, ...categoryStats[cat.key] })).sort((a, b) => b.revenue - a.revenue);
  return /*#__PURE__*/React.createElement('div', { style: listPanel },
    rows.map((cat, idx) => {
      const pct = categoryTotal > 0 ? Math.round((cat.revenue / categoryTotal) * 100) : 0;
      return /*#__PURE__*/React.createElement('div', { key: cat.key, className: 'osm-cat-row', style: listRow(idx) },
        /*#__PURE__*/React.createElement('span', {
          style: { fontWeight: 600, fontSize: 13, color: T.txt, flex: '0 1 118px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }, cat.label),
        /*#__PURE__*/React.createElement('span', {
          className: 'osm-cat-bar',
          style: { background: T.bgSide }
        },
          /*#__PURE__*/React.createElement('span', {
            style: { display: 'block', height: '100%', width: pct + '%', background: cat.revenue > 0 ? cat.tint : 'transparent' }
          })
        ),
        /*#__PURE__*/React.createElement('span', {
          className: 'osm-cat-sales',
          style: { fontSize: 12, color: T.txtSub }
        }, cat.qty + ' vente' + (cat.qty !== 1 ? 's' : '')),
        /*#__PURE__*/React.createElement('span', {
          className: 'osm-num',
          style: { fontSize: 12, fontWeight: 600, color: T.txtSub, minWidth: 34, marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }
        }, pct + '%'),
        /*#__PURE__*/React.createElement('span', {
          className: 'osm-num',
          style: { fontWeight: 600, fontSize: 14, color: T.txt, textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }
        }, fp(cat.revenue))
      );
    })
  );
}

function TopProductsCard({ topProducts }) {
  if (topProducts.length === 0) return /*#__PURE__*/React.createElement(EmptyCard, { text: 'Pas encore de ventes sur cette période' });
  return /*#__PURE__*/React.createElement('div', { style: listPanel },
    topProducts.map((p, i) => /*#__PURE__*/React.createElement('div', {
      key: p.name,
      className: 'osm-cat-row',
      style: listRow(i)
    },
      /*#__PURE__*/React.createElement('div', {
        style: {
          width: 26, height: 26, borderRadius: T.rSm, background: T.bgSide, color: T.txt,
          fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }
      }, i + 1),
      /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, fontSize: 14, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.name),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, marginTop: 2 } }, p.qty + ' vendu' + (p.qty !== 1 ? 's' : ''))
      ),
      /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontWeight: 600, fontSize: 15, color: T.txt, flexShrink: 0 } }, fp(p.revenue))
    ))
  );
}

function MidiSoirCard({ label, icon, rev, count, avg, theme, winning }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      flex: 1, minWidth: 0, borderRadius: T.rMd, padding: '16px', position: 'relative',
      background: T.bgCard, border: `1px solid ${T.brd}`, borderTop: `3px solid ${theme.accent}`
    }
  },
    winning && /*#__PURE__*/React.createElement('div', {
      style: { position: 'absolute', top: 14, right: 16, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.accent }
    }, 'Meilleur service'),
    /*#__PURE__*/React.createElement('div', {
      style: { width: 32, height: 32, borderRadius: T.rSm, background: theme.iconBg, color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 11.5, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: T.txtSub } }, label),
    /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontSize: 22, fontWeight: 600, color: T.txt, marginTop: 2 } }, fp(rev)),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 20, marginTop: 14 } },
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 10, color: T.txtMuted, fontWeight: 600, textTransform: 'uppercase' } }, 'Commandes'),
        /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontSize: 14, fontWeight: 600, color: T.txt, marginTop: 2 } }, count)
      ),
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 10, color: T.txtMuted, fontWeight: 600, textTransform: 'uppercase' } }, 'Panier moy.'),
        /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontSize: 14, fontWeight: 600, color: T.txt, marginTop: 2 } }, fp(avg))
      )
    )
  );
}

function MidiSoirComparison({ midiRev, soirRev, midiCount, soirCount, midiAvg, soirAvg, winningService }) {
  return /*#__PURE__*/React.createElement('div', {
    className: 'osm-service-grid',
    style: { margin: '0 20px 24px' }
  },
    /*#__PURE__*/React.createElement(MidiSoirCard, {
      label: 'Service du midi', icon: /*#__PURE__*/React.createElement(IconSun, { size: 18 }),
      rev: midiRev, count: midiCount, avg: midiAvg, theme: MIDI_CHART_THEME, winning: winningService === 'midi'
    }),
    /*#__PURE__*/React.createElement(MidiSoirCard, {
      label: 'Service du soir', icon: /*#__PURE__*/React.createElement(IconMoon, { size: 16 }),
      rev: soirRev, count: soirCount, avg: soirAvg, theme: SOIR_CHART_THEME, winning: winningService === 'soir'
    })
  );
}

function ComparisonBadge({ label, curr, prev, isFirst }) {
  const pct = pctChange(curr, prev);
  if (pct === null) return null;
  const up = pct >= 0;
  return /*#__PURE__*/React.createElement('div', {
    style: {
      flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
      padding: '12px 8px', borderLeft: isFirst ? 'none' : `1px solid ${T.brd}`
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 10.5, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' } }, label),
    /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { display: 'flex', alignItems: 'center', gap: 4, color: up ? T.ok : T.no, fontWeight: 600, fontSize: 16, marginTop: 2 } },
      /*#__PURE__*/React.createElement(up ? IconTrendUp : IconTrendDown, { size: 15 }),
      (up ? '+' : '') + pct + '%'
    )
  );
}

function PeriodComparison({ rev, prevRev, count, prevCount, avgBasket, prevAvg }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 20px', background: T.bgCard, borderRadius: T.rMd,
      border: `1px solid ${T.brd}`, display: 'flex'
    }
  },
    /*#__PURE__*/React.createElement(ComparisonBadge, { label: "Chiffre d'affaires", curr: rev, prev: prevRev, isFirst: true }),
    /*#__PURE__*/React.createElement(ComparisonBadge, { label: 'Commandes', curr: count, prev: prevCount }),
    /*#__PURE__*/React.createElement(ComparisonBadge, { label: 'Panier moyen', curr: avgBasket, prev: prevAvg })
  );
}

function MonthlyTrendChart({ buckets, max, onSelectDay }) {
  const now = new Date();
  const barWidth = 10;
  const gap = 4;
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 24px', background: T.bgCard, borderRadius: T.rMd,
      border: `1px solid ${T.brd}`,
      padding: '18px 16px 16px'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { overflowX: 'auto', paddingBottom: 6 } },
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', alignItems: 'flex-end', gap, height: 140, minWidth: buckets.length * (barWidth + gap) }
      },
        buckets.map(b => {
          const isToday = b.date.toDateString() === now.toDateString();
          const showLabel = b.day === 1 || b.day % 5 === 0 || b.day === buckets.length;
          return /*#__PURE__*/React.createElement('div', {
            key: b.day,
            onClick: () => b.total > 0 && onSelectDay(b.date),
            style: {
              width: barWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              height: '100%', justifyContent: 'flex-end', cursor: b.total > 0 ? 'pointer' : 'default', flexShrink: 0
            }
          },
            /*#__PURE__*/React.createElement('div', {
              title: b.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' : ' + fp(b.total),
              style: {
                width: '100%', borderRadius: '2px 2px 0 0',
                height: Math.max(2, (b.total / max) * 100),
                background: b.total === 0 ? T.brdL : (isToday ? T.accent : T.primary)
              }
            }),
            showLabel && /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontSize: 9.5, color: T.txtMuted, fontWeight: 500 } }, b.day)
          );
        })
      )
    )
  );
}

function TopDaysCard({ topDays, onSelectDay }) {
  if (topDays.length === 0) return /*#__PURE__*/React.createElement(EmptyCard, { text: 'Pas encore de données ce mois-ci' });
  return /*#__PURE__*/React.createElement('div', { style: listPanel },
    topDays.map((b, i) => /*#__PURE__*/React.createElement('button', {
      key: b.day,
      onClick: () => onSelectDay(b.date),
      className: 'osm-tap-card osm-btn-premium osm-cat-row',
      style: {
        ...listRow(i),
        background: 'transparent',
        border: 'none',
        borderTop: i === 0 ? 'none' : `1px solid ${T.brdL}`,
        cursor: 'pointer', textAlign: 'left', width: '100%'
      }
    },
      /*#__PURE__*/React.createElement('div', {
        className: 'osm-num',
        style: {
          width: 26, height: 26, flexShrink: 0, borderRadius: T.rSm,
          background: i === 0 ? T.primary : T.bgSide, color: i === 0 ? T.white : T.txt,
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      }, i + 1),
      /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, fontSize: 14, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, dayOfWeekLabel(b.date)),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, marginTop: 2 } }, b.count + ' commande' + (b.count !== 1 ? 's' : ''))
      ),
      /*#__PURE__*/React.createElement('div', { className: 'osm-num', style: { fontWeight: 600, fontSize: 16, color: T.txt, flexShrink: 0 } }, fp(b.total))
    ))
  );
}

const CALENDAR_TIERS = [
  [T.okL, T.ok, 'Excellente'],
  [T.warnL, T.warn, 'Moyenne'],
  [T.noL, T.no, 'Faible']
];

function tierStyle(bucket, maxDayRev) {
  if (!bucket || bucket.total === 0) return { bg: T.bgCard, border: T.brdL, text: T.txtMuted };
  const ratio = bucket.total / maxDayRev;
  if (ratio >= 0.66) return { bg: T.okL, border: T.ok + '55', text: T.ok };
  if (ratio >= 0.33) return { bg: T.warnL, border: T.warn + '55', text: T.warn };
  return { bg: T.noL, border: T.no + '55', text: T.no };
}

function MonthCalendar({ month, dailyBuckets, maxDayRev, onSelectDay }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells = [...Array(leadingBlanks).fill(null), ...dailyBuckets];
  const now = new Date();

  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', background: T.bgCard, borderRadius: T.rMd, border: `1px solid ${T.brd}`, padding: 16 }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 } },
      ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => /*#__PURE__*/React.createElement('div', {
        key: i, style: { textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: T.txtMuted }
      }, d))
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 } },
      cells.map((b, i) => {
        if (!b) return /*#__PURE__*/React.createElement('div', { key: 'blank' + i });
        const c = tierStyle(b, maxDayRev);
        const isToday = b.date.toDateString() === now.toDateString();
        return /*#__PURE__*/React.createElement('button', {
          key: b.day,
          className: 'osm-btn-premium',
          onClick: () => b.total > 0 && onSelectDay(b.date),
          title: b.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' : ' + fp(b.total),
          style: {
            aspectRatio: '1', borderRadius: T.rSm, border: `1.5px solid ${isToday ? T.primary : c.border}`,
            background: c.bg, color: c.text, fontWeight: 600, fontSize: 12.5,
            cursor: b.total > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }
        }, b.day);
      })
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' } },
      CALENDAR_TIERS.map(([bgc, bdc, label]) => /*#__PURE__*/React.createElement('div', { key: label, style: { display: 'flex', alignItems: 'center', gap: 5 } },
        /*#__PURE__*/React.createElement('span', { style: { width: 10, height: 10, borderRadius: 2, background: bgc, border: `1px solid ${bdc}55`, display: 'inline-block' } }),
        /*#__PURE__*/React.createElement('span', { style: { fontSize: 11, color: T.txtSub, fontWeight: 600 } }, label)
      ))
    )
  );
}

function categoryStatsFor(items) {
  const stats = {};
  CATEGORIES.forEach(c => { stats[c.key] = { qty: 0, revenue: 0 }; });
  items.forEach(it => {
    const pid = it.pid || '';
    const cat = CATEGORIES.find(c => c.test(pid));
    if (!cat) return;
    stats[cat.key].qty += it.qty;
    stats[cat.key].revenue += it.total;
  });
  return stats;
}

function topProductsFor(orders, limit) {
  const map = {};
  orders.forEach(o => o.items.forEach(it => {
    if (!map[it.name]) map[it.name] = { name: it.name, qty: 0, revenue: 0 };
    map[it.name].qty += it.qty;
    map[it.name].revenue += it.total;
  }));
  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

function DayNav({ selectedDate, setSelectedDate, isToday }) {
  const shiftDate = deltaDays => setSelectedDate(d => {
    const n = new Date(d);
    n.setDate(n.getDate() + deltaDays);
    return n;
  });
  return /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '4px 20px 4px' } },
    /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronLeft, {}), onClick: () => shiftDate(-1) }),
    /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: T.rMd,
        background: T.bgCard, border: `1px solid ${T.brd}`
      }
    },
      /*#__PURE__*/React.createElement(IconCalendar, { size: 16 }),
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 14.5, fontWeight: 700, color: T.txt, textTransform: 'capitalize' } }, dayLabel(selectedDate))
    ),
    /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronRight, {}), onClick: () => shiftDate(1), disabled: isToday })
  );
}

function DayAnalysis({ filteredOrders, selectedDate, setSelectedDate, filterActive }) {
  const today = fd(selectedDate);
  const isToday = today === fd(new Date());
  const dayOrders = filteredOrders.filter(o => fd(o.date) === today && o.status !== 'annulee');

  const rev = dayOrders.reduce((s, o) => s + o.total, 0);
  const revEsp = dayOrders.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = dayOrders.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const avgBasket = dayOrders.length ? rev / dayOrders.length : 0;
  const telCount = dayOrders.filter(o => o.phone).length;

  const allItems = dayOrders.flatMap(o => o.items);
  const categoryStats = categoryStatsFor(allItems);
  const categoryTotal = Object.values(categoryStats).reduce((s, c) => s + c.revenue, 0);
  const topProducts = topProductsFor(dayOrders, 5);

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement(DayNav, { selectedDate, setSelectedDate, isToday }),
    /*#__PURE__*/React.createElement(HeroRevenue, { value: fp(rev), tag: 'du jour' }),
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 18 }), label: 'Espèces', value: fp(revEsp),
        tint: T.ok
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 18 }), label: 'Carte bancaire', value: fp(revCB),
        tint: T.info
      })
    ),
    /*#__PURE__*/React.createElement(PaymentSplitBar, { revEsp, revCB }),
    /*#__PURE__*/React.createElement(StatRow, {
      count: dayOrders.length, countLabel: 'Commandes du jour', avgBasket, telCount
    }),
    !filterActive && /*#__PURE__*/React.createElement(SectionLabel, null, 'Ventes par catégorie'),
    !filterActive && /*#__PURE__*/React.createElement(MonthlyCategoryList, { categoryStats, categoryTotal }),
    /*#__PURE__*/React.createElement(SectionLabel, null, 'Produits les plus vendus'),
    /*#__PURE__*/React.createElement(TopProductsCard, { topProducts }),
    /*#__PURE__*/React.createElement(SectionLabel, null, 'Analyse par heure'),
    /*#__PURE__*/React.createElement(ServiceHourCharts, { orders: dayOrders })
  );
}

function MonthAnalysis({ filteredOrders, month, setMonth, onSelectDay, filterActive }) {
  const monthOrders = React.useMemo(
    () => filteredOrders.filter(o => monthKey(o.date) === monthKey(month) && o.status !== 'annulee'),
    [filteredOrders, month]
  );
  const prevMonthDate = addMonths(month, -1);
  const prevMonthOrders = React.useMemo(
    () => filteredOrders.filter(o => monthKey(o.date) === monthKey(prevMonthDate) && o.status !== 'annulee'),
    [filteredOrders, month]
  );

  const rev = monthOrders.reduce((s, o) => s + o.total, 0);
  const count = monthOrders.length;
  const avgBasket = count ? rev / count : 0;
  const revEsp = monthOrders.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = monthOrders.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const telCount = monthOrders.filter(o => o.phone).length;

  const prevRev = prevMonthOrders.reduce((s, o) => s + o.total, 0);
  const prevCount = prevMonthOrders.length;
  const prevAvg = prevCount ? prevRev / prevCount : 0;
  const hasPrevData = prevMonthOrders.length > 0;

  const nDays = daysInMonth(month);
  const dailyBuckets = React.useMemo(() => {
    const b = Array.from({ length: nDays }, (_, i) => ({
      day: i + 1, date: new Date(month.getFullYear(), month.getMonth(), i + 1), total: 0, count: 0
    }));
    monthOrders.forEach(o => {
      const d = new Date(o.date).getDate();
      const bucket = b[d - 1];
      if (bucket) { bucket.total += o.total; bucket.count += 1; }
    });
    return b;
  }, [monthOrders, month, nDays]);

  const maxDayRev = Math.max(1, ...dailyBuckets.map(b => b.total));
  const topDays = dailyBuckets.filter(b => b.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

  const categoryStats = React.useMemo(() => categoryStatsFor(monthOrders.flatMap(o => o.items)), [monthOrders]);
  const categoryTotal = Object.values(categoryStats).reduce((s, c) => s + c.revenue, 0);
  const topProducts = React.useMemo(() => topProductsFor(monthOrders, 5), [monthOrders]);

  const midiOrders = monthOrders.filter(o => new Date(o.date).getHours() < 15);
  const soirOrders = monthOrders.filter(o => new Date(o.date).getHours() >= 15);
  const midiRev = midiOrders.reduce((s, o) => s + o.total, 0);
  const soirRev = soirOrders.reduce((s, o) => s + o.total, 0);
  const midiAvg = midiOrders.length ? midiRev / midiOrders.length : 0;
  const soirAvg = soirOrders.length ? soirRev / soirOrders.length : 0;
  const winningService = midiRev === soirRev ? null : (midiRev > soirRev ? 'midi' : 'soir');

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '4px 20px 4px' } },
      /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronLeft, {}), onClick: () => setMonth(m => addMonths(m, -1)) }),
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: T.rMd, background: T.bgCard, border: `1px solid ${T.brd}` }
      },
        /*#__PURE__*/React.createElement(IconCalendar, { size: 16 }),
        /*#__PURE__*/React.createElement('span', { style: { fontSize: 14.5, fontWeight: 700, color: T.txt, textTransform: 'capitalize' } }, monthLabel(month))
      ),
      /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronRight, {}), onClick: () => setMonth(m => addMonths(m, 1)), disabled: monthKey(month) === monthKey(new Date()) })
    ),

    /*#__PURE__*/React.createElement(HeroRevenue, { value: fp(rev), tag: 'du mois' }),
    hasPrevData && /*#__PURE__*/React.createElement(PeriodComparison, { rev, prevRev, count, prevCount, avgBasket, prevAvg }),

    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 18 }), label: 'Espèces', value: fp(revEsp),
        tint: T.ok
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 18 }), label: 'Carte bancaire', value: fp(revCB),
        tint: T.info
      })
    ),
    /*#__PURE__*/React.createElement(PaymentSplitBar, { revEsp, revCB }),

    /*#__PURE__*/React.createElement(StatRow, {
      count, countLabel: 'Commandes du mois', avgBasket, telCount
    }),

    /*#__PURE__*/React.createElement(SectionLabel, null, "Évolution du chiffre d'affaires"),
    /*#__PURE__*/React.createElement(MonthlyTrendChart, { buckets: dailyBuckets, max: maxDayRev, onSelectDay }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Meilleurs jours'),
    /*#__PURE__*/React.createElement(TopDaysCard, { topDays, onSelectDay }),

    !filterActive && /*#__PURE__*/React.createElement(SectionLabel, null, 'Ventes par catégorie'),
    !filterActive && /*#__PURE__*/React.createElement(MonthlyCategoryList, { categoryStats, categoryTotal }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Produits les plus vendus'),
    /*#__PURE__*/React.createElement(TopProductsCard, { topProducts }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Midi / Soir'),
    /*#__PURE__*/React.createElement(MidiSoirComparison, {
      midiRev, soirRev, midiCount: midiOrders.length, soirCount: soirOrders.length, midiAvg, soirAvg, winningService
    }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Analyse par heure (cumul du mois)'),
    /*#__PURE__*/React.createElement(ServiceHourCharts, { orders: monthOrders }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Calendrier du mois'),
    /*#__PURE__*/React.createElement(MonthCalendar, { month, dailyBuckets, maxDayRev, onSelectDay })
  );
}

export function Analytics({ orders }) {
  const [period, setPeriod] = React.useState('mois');
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [month, setMonth] = React.useState(() => new Date());
  const [filter, setFilter] = React.useState({ type: 'all' });

  const productOptions = React.useMemo(() => distinctProducts(orders), [orders]);
  const filteredOrders = React.useMemo(() => applyFilter(orders, filter), [orders, filter]);

  const goToDay = date => { setSelectedDate(date); setPeriod('jour'); };

  return /*#__PURE__*/React.createElement('div', {
    style: { flex: 1, overflowY: 'auto', background: T.bg }
  },
    /*#__PURE__*/React.createElement(PeriodTopSwitch, { period, setPeriod }),
    /*#__PURE__*/React.createElement(FilterBar, { filter, setFilter, categoryOptions: CATEGORIES, productOptions }),

    period === 'jour'
      ? /*#__PURE__*/React.createElement(DayAnalysis, {
          filteredOrders, selectedDate, setSelectedDate, filterActive: filter.type !== 'all'
        })
      : /*#__PURE__*/React.createElement(MonthAnalysis, {
          filteredOrders, month, setMonth, onSelectDay: goToDay, filterActive: filter.type !== 'all'
        })
  );
}
