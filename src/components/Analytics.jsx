import { ManagerPeriodControl } from './ManagerPeriodControl.jsx';
import { OrderDetailModal, categorySales } from './Dash.jsx';
import { MobileOrders } from './MobileReports.jsx';
import { useReportMobile, ReportHeader, DateControl, Segments, RevenueSummary, CategoryRanking, Services, Ranking, TrendChart, ReportCalendar } from './MobileReports.jsx';
import React from 'react';
import { T } from '../data/theme.js';
import { fp, fd } from '../utils/format.js';
import {
  IconCash, IconCard, IconPhone, IconBag, IconReceipt,
  IconChevronLeft, IconChevronRight, IconCalendar,
  IconTrendUp, IconTrendDown, IconSun, IconMoon
} from './icons.jsx';
import {
  CATEGORIES, StatTile, HeroRevenue, PaymentHeroCard, SectionLabel, WideStat,
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

const MEDALS = ['1', '2', '3'];

const PERIODS = [
  { key: 'jour', label: 'Journée' },
  { key: 'mois', label: 'Mois' }
];

function PeriodTopSwitch({ period, setPeriod }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex', gap: 4, margin: '16px 20px 12px',
      background: T.bgCard,
      padding: 5, borderRadius: 6,
      boxShadow: 'none'
    }
  },
    PERIODS.map(p => /*#__PURE__*/React.createElement('button', {
      key: p.key,
      className: 'osm-btn-premium',
      onClick: () => setPeriod(p.key),
      style: {
        flex: 1, padding: '11px 0', borderRadius: 6, border: 'none',
        background: period === p.key ? T.primaryL : 'transparent',
        color: period === p.key ? T.txt : T.txtSub,
        fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
        boxShadow: 'none'
      }
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
        padding: '12px 14px', borderRadius: 6, textAlign: 'center',
        background: active ? T.primaryL : T.bg,
        color: active ? T.primaryD : T.txtSub,
        fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        boxShadow: 'none', pointerEvents: 'none'
      }
    }, displayLabel)
  );
}

function FilterBar({ filter, setFilter, categoryOptions, productOptions }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { display: 'flex', gap: 8, margin: '0 20px 20px', background: T.bg, padding: 6, borderRadius: 6 }
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
      background: T.gradViolet, borderRadius: 6, border: `1px solid ${T.brd}`, boxShadow: 'none'
    }
  }, text);
}

function PaymentSplitBar({ revEsp, revCB }) {
  const total = revEsp + revCB;
  const pctEsp = total > 0 ? Math.round((revEsp / total) * 100) : 50;
  const pctCB = 100 - pctEsp;
  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', background: T.gradViolet, borderRadius: 6, border: `1px solid ${T.brd}`, boxShadow: 'none', padding: '14px 16px' }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', height: 14, borderRadius: 6, overflow: 'hidden' } },
      total > 0 && /*#__PURE__*/React.createElement('div', { style: { width: pctEsp + '%', background: '#28704E', transition: 'none' } }),
      total > 0 && /*#__PURE__*/React.createElement('div', { style: { width: pctCB + '%', background: '#456785', transition: 'none' } }),
      total === 0 && /*#__PURE__*/React.createElement('div', { style: { width: '100%', background: T.brdL } })
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10 } },
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: '#059669' } }, 'Espèces ' + pctEsp + '%'),
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: '#1D4ED8' } }, 'CB ' + pctCB + '%')
    )
  );
}

function NavArrow({ icon, onClick, disabled }) {
  return /*#__PURE__*/React.createElement('button', {
    className: 'osm-icon-btn',
    onClick, disabled,
    style: {
      width: 40, height: 40, borderRadius: 6, border: 'none', background: 'transparent',
      color: disabled ? T.txtMuted : T.txt, display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1
    }
  }, icon);
}

function MonthlyCategoryList({ categoryStats, categoryTotal }) {
  const rows = CATEGORIES.map(cat => ({ ...cat, ...categoryStats[cat.key] })).sort((a, b) => b.revenue - a.revenue);
  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }
  },
    rows.map(cat => {
      const pct = categoryTotal > 0 ? Math.round((cat.revenue / categoryTotal) * 100) : 0;
      return /*#__PURE__*/React.createElement('div', {
        key: cat.key,
        style: { background: T.gradViolet, borderRadius: 6, border: `1px solid ${T.brd}`, boxShadow: 'none', padding: '14px 16px' }
      },
        /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          /*#__PURE__*/React.createElement('span', { style: { fontWeight: 600, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: T.txt } }, cat.label),
          /*#__PURE__*/React.createElement('span', { style: { fontWeight: 600, fontSize: 14, color: cat.tint } }, fp(cat.revenue))
        ),
        /*#__PURE__*/React.createElement('div', { style: { height: 8, borderRadius: 6, background: cat.tint + '15', marginTop: 10, overflow: 'hidden' } },
          /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: pct + '%', background: cat.tint, borderRadius: 6, transition: 'none' } })
        ),
        /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6 } },
          /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, color: T.txtSub } }, cat.qty + ' vente' + (cat.qty !== 1 ? 's' : '')),
          /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, fontWeight: 600, color: cat.tint } }, pct + '%')
        )
      );
    })
  );
}

function TopProductsCard({ topProducts }) {
  if (topProducts.length === 0) return /*#__PURE__*/React.createElement(EmptyCard, { text: 'Pas encore de ventes sur cette période' });
  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }
  },
    topProducts.map((p, i) => /*#__PURE__*/React.createElement('div', {
      key: p.name,
      style: {
        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
        background: T.bgCard, border: `1px solid ${T.brd}`,
        borderRadius: 6, boxShadow: 'none'
      }
    },
      /*#__PURE__*/React.createElement('div', {
        style: {
          width: 26, height: 26, borderRadius: 6, background: T.primaryL, color: T.primaryD,
          fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }
      }, i + 1),
      /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, fontSize: 14, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.name),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, marginTop: 2 } }, p.qty + ' vendu' + (p.qty !== 1 ? 's' : ''))
      ),
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, fontSize: 15, color: T.primaryD, flexShrink: 0 } }, fp(p.revenue))
    ))
  );
}

function MidiSoirCard({ label, icon, rev, count, avg, theme, winning }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { flex: 1, minWidth: 0, borderRadius: 6, padding: '18px 16px', position: 'relative', overflow: 'hidden', background: theme.bg, boxShadow: 'none'}
  },
    winning && /*#__PURE__*/React.createElement('div', {
      style: { position: 'absolute', top: 10, right: 10, fontSize: 10.5, fontWeight: 600, color: theme.text, background: 'rgba(255,255,255,0.3)', padding: '3px 8px', borderRadius: 6 }
    }, '🏆 Meilleur'),
    /*#__PURE__*/React.createElement('div', {
      style: { width: 38, height: 38, borderRadius: 6, background: theme.iconBg, color: theme.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.subText } }, label),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 600, color: theme.text, marginTop: 2 } }, fp(rev)),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 18, marginTop: 14 } },
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 9.5, color: theme.subText, fontWeight: 600, textTransform: 'uppercase' } }, 'Commandes'),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: theme.text, marginTop: 2 } }, count)
      ),
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 9.5, color: theme.subText, fontWeight: 600, textTransform: 'uppercase' } }, 'Panier moy.'),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: theme.text, marginTop: 2 } }, fp(avg))
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
      label: 'Service du midi', icon: /*#__PURE__*/React.createElement(IconSun, { size: 20 }),
      rev: midiRev, count: midiCount, avg: midiAvg, theme: MIDI_CHART_THEME, winning: winningService === 'midi'
    }),
    /*#__PURE__*/React.createElement(MidiSoirCard, {
      label: 'Service du soir', icon: /*#__PURE__*/React.createElement(IconMoon, { size: 18 }),
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
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 10.5, fontWeight: 600, color: T.txtSub, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' } }, label),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, color: up ? '#059669' : '#DC2626', fontWeight: 600, fontSize: 16, marginTop: 2 } },
      /*#__PURE__*/React.createElement(up ? IconTrendUp : IconTrendDown, { size: 15 }),
      (up ? '+' : '') + pct + '%'
    )
  );
}

function PeriodComparison({ rev, prevRev, count, prevCount, avgBasket, prevAvg }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 20px', background: T.gradViolet, borderRadius: 6,
      border: `1px solid ${T.brd}`, boxShadow: 'none', display: 'flex'
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
      margin: '0 20px 24px', background: T.gradViolet, borderRadius: 6,
      border: `1px solid ${T.brd}`, boxShadow: 'none',
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
                width: '100%', borderRadius: '4px 4px 2px 2px',
                height: Math.max(3, (b.total / max) * 100),
                background: isToday ? '#75608B' : '#75608B',
                boxShadow: 'none',
                transition: 'none'
              }
            }),
            showLabel && /*#__PURE__*/React.createElement('div', { style: { fontSize: 9.5, color: T.txtMuted, fontWeight: 600 } }, b.day)
          );
        })
      )
    )
  );
}

function TopDaysCard({ topDays, onSelectDay }) {
  if (topDays.length === 0) return /*#__PURE__*/React.createElement(EmptyCard, { text: 'Pas encore de données ce mois-ci' });
  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }
  },
    topDays.map((b, i) => /*#__PURE__*/React.createElement('button', {
      key: b.day,
      onClick: () => onSelectDay(b.date),
      className: 'osm-tap-card osm-btn-premium',
      style: {
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        background: i === 0 ? T.bgCard : T.bgCard,
        border: `1px solid ${i === 0 ? 'rgba(217,119,6,0.35)' : 'rgba(180,143,224,0.16)'}`,
        borderRadius: 6, boxShadow: 'none', cursor: 'pointer', textAlign: 'left', width: '100%'
      }
    },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 } }, MEDALS[i] || (i + 1) + '.'),
      /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, fontSize: 14, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, dayOfWeekLabel(b.date)),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, marginTop: 2 } }, b.count + ' commande' + (b.count !== 1 ? 's' : ''))
      ),
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 600, fontSize: 16, color: T.primaryD, flexShrink: 0 } }, fp(b.total))
    ))
  );
}

const CALENDAR_TIERS = [
  ['#BBF7D0', 'Excellente'],
  ['#FED7AA', 'Moyenne'],
  ['#FECACA', 'Faible']
];

function tierStyle(bucket, maxDayRev) {
  if (!bucket || bucket.total === 0) return { bg: T.gradViolet, border: 'rgba(180,143,224,0.14)', text: T.txtMuted };
  const ratio = bucket.total / maxDayRev;
  if (ratio >= 0.66) return { bg: T.bgCard, border: 'rgba(5,150,105,0.3)', text: '#047857' };
  if (ratio >= 0.33) return { bg: T.bgCard, border: 'rgba(217,119,6,0.3)', text: '#9A3412' };
  return { bg: T.bgCard, border: 'rgba(220,38,38,0.3)', text: '#991B1B' };
}

function MonthCalendar({ month, dailyBuckets, maxDayRev, onSelectDay }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells = [...Array(leadingBlanks).fill(null), ...dailyBuckets];
  const now = new Date();

  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', background: T.bgCard, borderRadius: 6, border: `1px solid ${T.brd}`, boxShadow: 'none', padding: 16 }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 } },
      ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => /*#__PURE__*/React.createElement('div', {
        key: i, style: { textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: T.txtMuted }
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
            aspectRatio: '1', borderRadius: 6, border: `1.5px solid ${isToday ? T.primary : c.border}`,
            background: c.bg, color: c.text, fontWeight: 600, fontSize: 12.5,
            cursor: b.total > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }
        }, b.day);
      })
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' } },
      CALENDAR_TIERS.map(([color, label]) => /*#__PURE__*/React.createElement('div', { key: label, style: { display: 'flex', alignItems: 'center', gap: 5 } },
        /*#__PURE__*/React.createElement('span', { style: { width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' } }),
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
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 6,
        background: T.bgCard, border: `1px solid ${T.brd}`, boxShadow: 'none'
      }
    },
      /*#__PURE__*/React.createElement(IconCalendar, { size: 16 }),
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 14.5, fontWeight: 600, color: T.txt, textTransform: 'capitalize' } }, dayLabel(selectedDate))
    ),
    /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronRight, {}), onClick: () => shiftDate(1), disabled: isToday })
  );
}

function DayAnalysis({ filteredOrders, selectedDate, setSelectedDate, filterActive, management, service = 'all', onSelectOrder }) {
  const mobile = useReportMobile();
  const today = fd(selectedDate);
  const isToday = today === fd(new Date());
  const allDayOrders = filteredOrders.filter(o => fd(o.date) === today && o.status !== 'annulee');
  const dayOrders = service === 'all' ? allDayOrders : allDayOrders.filter(o => (new Date(o.date).getHours() < 15) === (service === 'midi'));

  const rev = dayOrders.reduce((s, o) => s + o.total, 0);
  const revEsp = dayOrders.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = dayOrders.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const avgBasket = dayOrders.length ? rev / dayOrders.length : 0;
  const telCount = dayOrders.filter(o => o.phone).length;

  const allItems = dayOrders.flatMap(o => o.items);
  const categoryStats = categoryStatsFor(allItems);
  const categoryTotal = Object.values(categoryStats).reduce((s, c) => s + c.revenue, 0);
  const topProducts = topProductsFor(dayOrders, 5);

  if (mobile) return <>
    {!management && <DateControl date={selectedDate} onChange={setSelectedDate} isToday={isToday}/>}
    <RevenueSummary rev={rev} count={dayOrders.length} avg={avgBasket} cash={revEsp} card={revCB} phone={telCount} tag={service === 'all' ? 'du jour' : service === 'midi' ? 'du midi' : 'du soir'}/>
    {!filterActive && <CategoryRanking stats={categoryStats} total={categoryTotal} products={management ? categorySales(dayOrders) : undefined}/>}
    <Services orders={allDayOrders}/>
    <Ranking title="Produits les plus vendus" rows={topProducts.map(p=>({...p,detail:`${p.qty} vendu${p.qty !== 1 ? 's' : ''}`}))}/>
    {management && <details className="mg-orders"><summary>Commandes du jour <span>{dayOrders.length} · Voir le détail</span></summary><MobileOrders orders={[...dayOrders].sort((a,b)=>new Date(b.date)-new Date(a.date))} tag="du jour" onSelect={onSelectOrder}/></details>}
  </>;

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement(DayNav, { selectedDate, setSelectedDate, isToday }),
    /*#__PURE__*/React.createElement(HeroRevenue, { value: fp(rev), tag: 'du jour' }),
    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 20 }), label: 'Espèces', value: fp(revEsp),
        bg: '#28704E', shadow: '0 8px 20px rgba(5,150,105,0.28)', glow: 'rgba(167,243,208,0.4)'
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 20 }), label: 'Carte bancaire', value: fp(revCB),
        bg: '#456785', shadow: '0 8px 20px rgba(29,78,216,0.28)', glow: 'rgba(191,219,254,0.4)'
      })
    ),
    /*#__PURE__*/React.createElement(PaymentSplitBar, { revEsp, revCB }),
    /*#__PURE__*/React.createElement(WideStat, { icon: /*#__PURE__*/React.createElement(IconPhone, { size: 22 }), label: 'Par téléphone', value: String(telCount), tint: '#0EA5E9', gradient: T.gradBlue, size: 'lg' }),
    /*#__PURE__*/React.createElement(WideStat, { icon: /*#__PURE__*/React.createElement(IconBag, { size: 18 }), label: 'Panier moyen', value: fp(avgBasket), tint: '#D97706', gradient: T.gradOrange, size: 'md' }),
    /*#__PURE__*/React.createElement('div', { style: { padding: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconReceipt, {}), label: 'Commandes du jour', value: String(dayOrders.length), tint: '#7C3AED' })
    ),
    !filterActive && /*#__PURE__*/React.createElement(SectionLabel, null, 'Ventes par catégorie'),
    !filterActive && /*#__PURE__*/React.createElement(MonthlyCategoryList, { categoryStats, categoryTotal }),
    /*#__PURE__*/React.createElement(SectionLabel, null, 'Produits les plus vendus'),
    /*#__PURE__*/React.createElement(TopProductsCard, { topProducts }),
    /*#__PURE__*/React.createElement(SectionLabel, null, 'Analyse par heure'),
    /*#__PURE__*/React.createElement(ServiceHourCharts, { orders: dayOrders })
  );
}

function MonthAnalysis({ filteredOrders, month, setMonth, onSelectDay, filterActive, management }) {
  const mobile = useReportMobile();
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

  if (mobile) return <>
    {!management && <DateControl date={month} onChange={setMonth} monthly isToday={monthKey(month) === monthKey(new Date())}/>}
    <RevenueSummary rev={rev} count={count} avg={avgBasket} cash={revEsp} card={revCB} phone={telCount} tag="du mois" previous={hasPrevData}
      changes={hasPrevData ? {rev:pctChange(rev,prevRev),count:pctChange(count,prevCount),avg:pctChange(avgBasket,prevAvg)} : undefined}/>
    {!filterActive && <CategoryRanking stats={categoryStats} total={categoryTotal}/>}
    <TrendChart key={monthKey(month)} buckets={dailyBuckets} max={maxDayRev} onSelectDay={onSelectDay}/>
    <Ranking title="Produits les plus vendus" rows={topProducts.map(p=>({...p,detail:`${p.qty} vendu${p.qty !== 1 ? 's' : ''}`}))}/>
    <Ranking title="Meilleurs jours" rows={topDays.map(b=>({name:dayOfWeekLabel(b.date),detail:`${b.count} commande${b.count !== 1 ? 's' : ''}`,revenue:b.total,date:b.date}))} onSelect={r=>onSelectDay(r.date)} empty="Les premières journées de vente apparaîtront ici."/>
    <Services orders={monthOrders} comparison={[{rev:midiRev,count:midiOrders.length,avg:midiAvg},{rev:soirRev,count:soirOrders.length,avg:soirAvg}]}/>
    <ReportCalendar month={month} buckets={dailyBuckets} max={maxDayRev} onSelect={onSelectDay}/>
  </>;

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '4px 20px 4px' } },
      /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronLeft, {}), onClick: () => setMonth(m => addMonths(m, -1)) }),
      /*#__PURE__*/React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 6, background: T.bgCard, border: `1px solid ${T.brd}`, boxShadow: 'none'}
      },
        /*#__PURE__*/React.createElement(IconCalendar, { size: 16 }),
        /*#__PURE__*/React.createElement('span', { style: { fontSize: 14.5, fontWeight: 600, color: T.txt, textTransform: 'capitalize' } }, monthLabel(month))
      ),
      /*#__PURE__*/React.createElement(NavArrow, { icon: /*#__PURE__*/React.createElement(IconChevronRight, {}), onClick: () => setMonth(m => addMonths(m, 1)), disabled: monthKey(month) === monthKey(new Date()) })
    ),

    /*#__PURE__*/React.createElement(HeroRevenue, { value: fp(rev), tag: 'du mois' }),
    hasPrevData && /*#__PURE__*/React.createElement(PeriodComparison, { rev, prevRev, count, prevCount, avgBasket, prevAvg }),

    /*#__PURE__*/React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 20 }), label: 'Espèces', value: fp(revEsp),
        bg: '#28704E', shadow: '0 8px 20px rgba(5,150,105,0.28)', glow: 'rgba(167,243,208,0.4)'
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 20 }), label: 'Carte bancaire', value: fp(revCB),
        bg: '#456785', shadow: '0 8px 20px rgba(29,78,216,0.28)', glow: 'rgba(191,219,254,0.4)'
      })
    ),
    /*#__PURE__*/React.createElement(PaymentSplitBar, { revEsp, revCB }),

    /*#__PURE__*/React.createElement(WideStat, { icon: /*#__PURE__*/React.createElement(IconPhone, { size: 22 }), label: 'Par téléphone', value: String(telCount), tint: '#0EA5E9', gradient: T.gradBlue, size: 'lg' }),
    /*#__PURE__*/React.createElement(WideStat, { icon: /*#__PURE__*/React.createElement(IconBag, { size: 18 }), label: 'Panier moyen', value: fp(avgBasket), tint: '#D97706', gradient: T.gradOrange, size: 'md' }),

    /*#__PURE__*/React.createElement('div', { style: { padding: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconReceipt, {}), label: 'Commandes du mois', value: String(count), tint: '#7C3AED' })
    ),

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

export function Analytics({ orders, management = false, onReset, onUpdateOrder, onDeleteOrder }) {
  const mobile = useReportMobile();
  const [period, setPeriod] = React.useState(management ? 'jour' : 'mois');
  const [service, setService] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState(null);
  const pageRef = React.useRef(null);
  const selectedOrder = orders.find(o => o.id === selectedId);
  const selectOrder = o => setSelectedId(o.id);
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [month, setMonth] = React.useState(() => new Date());
  const [filter, setFilter] = React.useState({ type: 'all' });
  const FilterContainer = management ? 'details' : 'div';

  const productOptions = React.useMemo(() => distinctProducts(orders), [orders]);
  const filteredOrders = React.useMemo(() => applyFilter(orders, filter), [orders, filter]);

  const goToDay = date => { setSelectedDate(date); setPeriod('jour'); setService('all'); pageRef.current?.scrollTo({top:0}); };
  const changePeriod = next => { if(next === 'mois') setMonth(new Date(selectedDate.getFullYear(),selectedDate.getMonth(),1)); else if(monthKey(month)!==monthKey(selectedDate)) setSelectedDate(new Date(month.getFullYear(),month.getMonth(),1)); setPeriod(next); setService('all'); };

  if (mobile) return <main ref={pageRef} className={"mr-page" + (management ? " mg-page" : "")} aria-label={management ? "Management" : "Analytics"}>
    {management ? <>
      <div className="mg-page-heading"><h1>Vue d’ensemble</h1></div>
      <ManagerPeriodControl period={period} date={period === 'jour' ? selectedDate : month} onChange={period === 'jour' ? setSelectedDate : setMonth} onPeriodChange={changePeriod}/>
      {period === 'jour' && <Segments label="Service" value={service} onChange={setService} options={[["all","Journée"],["midi","Midi"],["soir","Soir"]]}/>}
    </> : <ReportHeader title="Analytics" subtitle="Votre performance dans le temps">
      <Segments label="Période d’analyse" value={period} onChange={setPeriod} options={PERIODS.map(p=>[p.key,p.label])}/>
    </ReportHeader>}
    <FilterContainer className={management ? "mg-filter-disclosure" : ""}>
      {management && <summary>Filtrer les ventes <span>{filter.type === 'all' ? 'Tous les articles' : filter.type === 'product' ? filter.name : CATEGORIES.find(c=>c.key === filter.key)?.label}<span aria-hidden="true">⌄</span></span></summary>}
    <div className="mr-filters">
      <label><select aria-label="Filtrer par catégorie" value={filter.type==='category'?filter.key:''} onChange={e=>setFilter(e.target.value?{type:'category',key:e.target.value}:{type:'all'})}>
        <option value="">Toutes les catégories</option>{CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
      </select></label>
      <label><select aria-label="Filtrer par produit" value={filter.type==='product'?filter.name:''} onChange={e=>setFilter(e.target.value?{type:'product',name:e.target.value}:{type:'all'})}>
        <option value="">Tous les produits</option>{productOptions.map(p=><option key={p} value={p}>{p}</option>)}
      </select></label>
    </div>
    </FilterContainer>
    {period==='jour' ? <DayAnalysis management={management} service={management ? service : 'all'} onSelectOrder={selectOrder} filteredOrders={filteredOrders} selectedDate={selectedDate} setSelectedDate={setSelectedDate} filterActive={filter.type!=='all'}/>
      : <MonthAnalysis management={management} filteredOrders={filteredOrders} month={month} setMonth={setMonth} onSelectDay={goToDay} filterActive={filter.type!=='all'}/>}
    {management && period === 'jour' && fd(selectedDate) === fd(new Date()) && onReset && <details className="mg-day-actions"><summary>Actions de la journée</summary><button onClick={onReset}>Réinitialiser la journée</button></details>}
    {management && selectedOrder && <OrderDetailModal order={selectedOrder} onClose={()=>setSelectedId(null)} onSave={onUpdateOrder} onDelete={onDeleteOrder}/>}
  </main>;

  return /*#__PURE__*/React.createElement('div', {
    style: { flex: 1, overflowY: 'auto', background: T.bgGradient }
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

