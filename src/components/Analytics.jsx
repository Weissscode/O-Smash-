import React from 'react';
import { T } from '../data/theme.js';
import { fp, fd } from '../utils/format.js';
import {
  IconCash, IconCard, IconPhone, IconBag, IconReceipt,
  IconChevronLeft, IconChevronRight, IconCalendar, IconChevronDown,
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

const MEDALS = ['🥇', '🥈', '🥉'];

const PERIODS = [
  { key: 'jour', label: 'Journée' },
  { key: 'mois', label: 'Mois' }
];

function PeriodTopSwitch({ period, setPeriod }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex', gap: 4, margin: '16px 20px 12px',
      background: 'linear-gradient(160deg, #251A3D 0%, #2E2154 60%, #1B1330 100%)',
      padding: 5, borderRadius: 16,
      boxShadow: '0 6px 18px rgba(30,15,55,0.22)'
    }
  },
    PERIODS.map(p => /*#__PURE__*/React.createElement('button', {
      key: p.key,
      className: 'osm-btn-premium',
      onClick: () => setPeriod(p.key),
      style: {
        flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
        background: period === p.key ? 'linear-gradient(135deg, #C084FC, #9333EA)' : 'transparent',
        color: period === p.key ? '#fff' : 'rgba(238,225,255,0.65)',
        fontWeight: 800, fontSize: 14.5, cursor: 'pointer',
        boxShadow: period === p.key ? '0 4px 14px rgba(147,51,234,0.45)' : 'none'
      }
    }, p.label))
  );
}

function FilterSelect({ allLabel, value, onChange, options }) {
  return /*#__PURE__*/React.createElement('div', { style: { position: 'relative', flex: 1, minWidth: 0 } },
    /*#__PURE__*/React.createElement('select', {
      value: value || '',
      onChange: e => onChange(e.target.value),
      style: {
        width: '100%', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
        padding: '11px 32px 11px 14px', borderRadius: 14, border: '1px solid rgba(180,143,224,0.22)',
        background: 'linear-gradient(135deg, #FFFFFF, #F7F1FF)', color: T.txt, fontWeight: 700, fontSize: 13,
        boxShadow: T.shSoft, cursor: 'pointer'
      }
    },
      /*#__PURE__*/React.createElement('option', { value: '' }, allLabel),
      options.map(o => /*#__PURE__*/React.createElement('option', { key: o.value, value: o.value }, o.label))
    ),
    /*#__PURE__*/React.createElement('div', {
      style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.txtSub }
    }, /*#__PURE__*/React.createElement(IconChevronDown, { size: 14 }))
  );
}

function FilterBar({ filter, setFilter, categoryOptions, productOptions }) {
  return /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 10, margin: '0 20px 20px' } },
    /*#__PURE__*/React.createElement(FilterSelect, {
      allLabel: 'Toutes les catégories',
      value: filter.type === 'category' ? filter.key : '',
      onChange: v => setFilter(v ? { type: 'category', key: v } : { type: 'all' }),
      options: categoryOptions.map(c => ({ value: c.key, label: c.label }))
    }),
    /*#__PURE__*/React.createElement(FilterSelect, {
      allLabel: 'Tous les produits',
      value: filter.type === 'product' ? filter.name : '',
      onChange: v => setFilter(v ? { type: 'product', name: v } : { type: 'all' }),
      options: productOptions.map(p => ({ value: p, label: p }))
    })
  );
}

function EmptyCard({ text }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 24px', padding: 32, textAlign: 'center', color: T.txtMuted, fontSize: 14,
      background: T.gradViolet, borderRadius: 16, border: '1px solid rgba(180,143,224,0.16)', boxShadow: T.shSoft
    }
  }, text);
}

function PaymentSplitBar({ revEsp, revCB }) {
  const total = revEsp + revCB;
  const pctEsp = total > 0 ? Math.round((revEsp / total) * 100) : 50;
  const pctCB = 100 - pctEsp;
  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', background: T.gradViolet, borderRadius: 16, border: '1px solid rgba(180,143,224,0.16)', boxShadow: T.shSoft, padding: '14px 16px' }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden' } },
      total > 0 && /*#__PURE__*/React.createElement('div', { style: { width: pctEsp + '%', background: 'linear-gradient(90deg, #34D399, #059669)', transition: 'width .5s ease' } }),
      total > 0 && /*#__PURE__*/React.createElement('div', { style: { width: pctCB + '%', background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)', transition: 'width .5s ease' } }),
      total === 0 && /*#__PURE__*/React.createElement('div', { style: { width: '100%', background: T.brdL } })
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10 } },
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 12.5, fontWeight: 700, color: '#059669' } }, 'Espèces ' + pctEsp + '%'),
      /*#__PURE__*/React.createElement('span', { style: { fontSize: 12.5, fontWeight: 700, color: '#1D4ED8' } }, 'CB ' + pctCB + '%')
    )
  );
}

function NavArrow({ icon, onClick, disabled }) {
  return /*#__PURE__*/React.createElement('button', {
    className: 'osm-icon-btn',
    onClick, disabled,
    style: {
      width: 40, height: 40, borderRadius: 12, border: 'none', background: 'transparent',
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
        style: { background: T.gradViolet, borderRadius: 14, border: '1px solid rgba(180,143,224,0.16)', boxShadow: T.shSoft, padding: '14px 16px' }
      },
        /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: T.txt } }, cat.label),
          /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, fontSize: 14, color: cat.tint } }, fp(cat.revenue))
        ),
        /*#__PURE__*/React.createElement('div', { style: { height: 8, borderRadius: 999, background: cat.tint + '15', marginTop: 10, overflow: 'hidden' } },
          /*#__PURE__*/React.createElement('div', { style: { height: '100%', width: pct + '%', background: cat.tint, borderRadius: 999, transition: 'width .5s ease' } })
        ),
        /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6 } },
          /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, color: T.txtSub } }, cat.qty + ' vente' + (cat.qty !== 1 ? 's' : '')),
          /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: cat.tint } }, pct + '%')
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
        background: 'linear-gradient(135deg, #FFFFFF, #FBF8FF)', border: '1px solid rgba(180,143,224,0.16)',
        borderRadius: 14, boxShadow: T.shSoft
      }
    },
      /*#__PURE__*/React.createElement('div', {
        style: {
          width: 26, height: 26, borderRadius: 9, background: T.primaryL, color: T.primaryD,
          fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }
      }, i + 1),
      /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        /*#__PURE__*/React.createElement('div', { style: { fontWeight: 700, fontSize: 14, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, p.name),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, marginTop: 2 } }, p.qty + ' vendu' + (p.qty !== 1 ? 's' : ''))
      ),
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 15, color: T.primaryD, flexShrink: 0 } }, fp(p.revenue))
    ))
  );
}

function MidiSoirCard({ label, icon, rev, count, avg, theme, winning }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { flex: 1, minWidth: 0, borderRadius: 20, padding: '18px 16px', position: 'relative', overflow: 'hidden', background: theme.bg, boxShadow: theme.shadow }
  },
    winning && /*#__PURE__*/React.createElement('div', {
      style: { position: 'absolute', top: 10, right: 10, fontSize: 10.5, fontWeight: 800, color: theme.text, background: 'rgba(255,255,255,0.3)', padding: '3px 8px', borderRadius: 999 }
    }, '🏆 Meilleur'),
    /*#__PURE__*/React.createElement('div', {
      style: { width: 38, height: 38, borderRadius: 11, background: theme.iconBg, color: theme.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }
    }, icon),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.subText } }, label),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: theme.text, marginTop: 2 } }, fp(rev)),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 18, marginTop: 14 } },
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 9.5, color: theme.subText, fontWeight: 700, textTransform: 'uppercase' } }, 'Commandes'),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 14, fontWeight: 800, color: theme.text, marginTop: 2 } }, count)
      ),
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 9.5, color: theme.subText, fontWeight: 700, textTransform: 'uppercase' } }, 'Panier moy.'),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 14, fontWeight: 800, color: theme.text, marginTop: 2 } }, fp(avg))
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
      padding: '12px 8px', borderLeft: isFirst ? 'none' : '1px solid rgba(180,143,224,0.22)'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 10.5, fontWeight: 700, color: T.txtSub, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' } }, label),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, color: up ? '#059669' : '#DC2626', fontWeight: 800, fontSize: 16, marginTop: 2 } },
      /*#__PURE__*/React.createElement(up ? IconTrendUp : IconTrendDown, { size: 15 }),
      (up ? '+' : '') + pct + '%'
    )
  );
}

function PeriodComparison({ rev, prevRev, count, prevCount, avgBasket, prevAvg }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 20px', background: T.gradViolet, borderRadius: 18,
      border: '1px solid rgba(180,143,224,0.18)', boxShadow: T.shSoft, display: 'flex'
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
      margin: '0 20px 24px', background: T.gradViolet, borderRadius: 20,
      border: '1px solid rgba(180,143,224,0.18)', boxShadow: T.shSoft,
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
                background: isToday ? 'linear-gradient(180deg, #C084FC, #9333EA)' : 'linear-gradient(180deg, #B48FE0, #9370CC)',
                boxShadow: b.total > 0 ? '0 4px 10px rgba(147,51,234,0.25)' : 'none',
                transition: 'height .4s ease'
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
        background: i === 0 ? 'linear-gradient(135deg, #FFF4D6, #FFE9A8)' : 'linear-gradient(135deg, #FFFFFF, #FBF8FF)',
        border: `1px solid ${i === 0 ? 'rgba(217,119,6,0.35)' : 'rgba(180,143,224,0.16)'}`,
        borderRadius: 16, boxShadow: T.shSoft, cursor: 'pointer', textAlign: 'left', width: '100%'
      }
    },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 } }, MEDALS[i] || (i + 1) + '.'),
      /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        /*#__PURE__*/React.createElement('div', { style: { fontWeight: 700, fontSize: 14, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, dayOfWeekLabel(b.date)),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, marginTop: 2 } }, b.count + ' commande' + (b.count !== 1 ? 's' : ''))
      ),
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 16, color: T.primaryD, flexShrink: 0 } }, fp(b.total))
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
  if (ratio >= 0.66) return { bg: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', border: 'rgba(5,150,105,0.3)', text: '#047857' };
  if (ratio >= 0.33) return { bg: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', border: 'rgba(217,119,6,0.3)', text: '#9A3412' };
  return { bg: 'linear-gradient(135deg, #FEE2E2, #FECACA)', border: 'rgba(220,38,38,0.3)', text: '#991B1B' };
}

function MonthCalendar({ month, dailyBuckets, maxDayRev, onSelectDay }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells = [...Array(leadingBlanks).fill(null), ...dailyBuckets];
  const now = new Date();

  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', background: T.bgCard, borderRadius: 20, border: '1px solid rgba(180,143,224,0.16)', boxShadow: T.shSoft, padding: 16 }
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
            aspectRatio: '1', borderRadius: 10, border: `1.5px solid ${isToday ? T.primary : c.border}`,
            background: c.bg, color: c.text, fontWeight: 700, fontSize: 12.5,
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
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 14,
        background: 'linear-gradient(135deg, #FFFFFF, #F7F1FF)', border: '1px solid rgba(180,143,224,0.2)', boxShadow: T.shSoft
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
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 20 }), label: 'Espèces', value: fp(revEsp),
        bg: 'linear-gradient(160deg, #34D399, #059669)', shadow: '0 8px 20px rgba(5,150,105,0.28)', glow: 'rgba(167,243,208,0.4)'
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 20 }), label: 'Carte bancaire', value: fp(revCB),
        bg: 'linear-gradient(160deg, #3B82F6, #1D4ED8)', shadow: '0 8px 20px rgba(29,78,216,0.28)', glow: 'rgba(191,219,254,0.4)'
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
        style: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 14, background: 'linear-gradient(135deg, #FFFFFF, #F7F1FF)', border: '1px solid rgba(180,143,224,0.2)', boxShadow: T.shSoft }
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
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 20 }), label: 'Espèces', value: fp(revEsp),
        bg: 'linear-gradient(160deg, #34D399, #059669)', shadow: '0 8px 20px rgba(5,150,105,0.28)', glow: 'rgba(167,243,208,0.4)'
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 20 }), label: 'Carte bancaire', value: fp(revCB),
        bg: 'linear-gradient(160deg, #3B82F6, #1D4ED8)', shadow: '0 8px 20px rgba(29,78,216,0.28)', glow: 'rgba(191,219,254,0.4)'
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

export function Analytics({ orders }) {
  const [period, setPeriod] = React.useState('mois');
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [month, setMonth] = React.useState(() => new Date());
  const [filter, setFilter] = React.useState({ type: 'all' });

  const productOptions = React.useMemo(() => distinctProducts(orders), [orders]);
  const filteredOrders = React.useMemo(() => applyFilter(orders, filter), [orders, filter]);

  const goToDay = date => { setSelectedDate(date); setPeriod('jour'); };

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
