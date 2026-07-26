import React from 'react';
import { T } from '../data/theme.js';
import { fp, ft, fd } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import {
  IconMoney, IconReceipt, IconBag, IconCash, IconCard, IconPhone,
  IconClock, IconClose, IconChevronLeft, IconChevronRight,
  IconTrash, IconEdit, IconCalendar, IconCheck, IconChevronDown,
  IconSun, IconMoon
} from './icons.jsx';

const PAYMENT_OPTIONS = ['Especes', 'CB'];
const SERVICE_OPTIONS = ['Sur place', 'A emporter'];

const CATEGORIES = [
  { key: 'burgers', label: 'Burgers', tint: '#D97706', test: pid => pid.startsWith('b-') },
  { key: 'menus', label: 'Menus', tint: '#7C3AED', test: pid => pid.startsWith('f-') },
  { key: 'riz', label: 'Riz Crousty', tint: T.primary, test: pid => pid.startsWith('r-') },
  { key: 'sides', label: 'Sides', tint: '#0EA5E9', test: pid => pid.startsWith('si-') || pid.startsWith('lo-') },
  { key: 'desserts', label: 'Desserts', tint: '#DB2777', test: pid => pid.startsWith('de-') || pid.startsWith('cr-') },
  { key: 'boissons', label: 'Boissons', tint: '#2563EB', test: pid => pid.startsWith('dr-') },
  { key: 'milkshakes', label: 'Milkshakes', tint: '#0D9488', test: pid => pid.startsWith('mk-') }
];

function categorySales(dayOrders) {
  const sales = {};
  CATEGORIES.forEach(c => { sales[c.key] = {}; });
  dayOrders.forEach(o => o.items.forEach(it => {
    const pid = it.pid || '';
    const cat = CATEGORIES.find(c => c.test(pid));
    if (!cat) return;
    sales[cat.key][it.name] = (sales[cat.key][it.name] || 0) + it.qty;
  }));
  return sales;
}

function itemsSummary(items) {
  if (!items || items.length === 0) return 'Aucun article';
  const parts = items.slice(0, 2).map(i => `${i.qty}x ${i.name}`);
  const extra = items.length - 2;
  return parts.join(', ') + (extra > 0 ? ` +${extra}` : '');
}

function custLines(cust, depth = 0) {
  if (!cust) return [];
  const pad = '  '.repeat(depth);
  const lines = [];
  if (cust.protein) lines.push(pad + 'Protéine : ' + cust.protein);
  if (cust.version) lines.push(pad + cust.version);
  if (cust.type) lines.push(pad + 'Type : ' + cust.type);
  if (cust.choix) lines.push(pad + 'Choix : ' + cust.choix);
  if (cust.retraits) cust.retraits.forEach(r => lines.push(pad + '– Sans ' + r));
  if (cust.supplements) cust.supplements.forEach(s => lines.push(pad + '+ ' + s));
  if (cust.sauces) cust.sauces.forEach(s => lines.push(pad + 'Sauce : ' + s));
  if (cust.sauce) lines.push(pad + 'Sauce : ' + cust.sauce);
  if (cust.fritesSauce) lines.push(pad + 'Sauce frites : ' + cust.fritesSauce);
  if (cust.fritesSupps) cust.fritesSupps.forEach(s => lines.push(pad + '+ ' + s));
  if (cust.chantilly) lines.push(pad + '+ Chantilly');
  if (cust.toppings) cust.toppings.forEach(t => lines.push(pad + '+ ' + t));
  if (cust.glace) lines.push(pad + '+ Glace');
  if (cust.drink) lines.push(pad + 'Boisson : ' + cust.drink);
  if (cust.note) lines.push(pad + 'Note : ' + cust.note);
  if (cust.burgers) cust.burgers.forEach((b, i) => {
    lines.push(pad + (i + 1) + '. ' + b.name);
    lines.push(...custLines(b.cust, depth + 1));
  });
  return lines;
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

function toDateInputValue(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

function StatTile({ icon, label, value, tint, compact }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: T.bgCard,
      borderRadius: compact ? 12 : 16,
      border: `1px solid ${T.brd}`,
      boxShadow: '0 1px 3px rgba(20,10,40,0.05)',
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

function HeroRevenue({ value, tag }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: `linear-gradient(135deg, ${T.primary}, ${T.primaryD})`,
      borderRadius: 22,
      padding: '26px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      boxShadow: `0 10px 28px ${T.primaryD}40`
    }
  },
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

function PaymentHeroCard({ icon, label, value, bg }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: bg,
      borderRadius: 18,
      padding: '18px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 120,
      boxShadow: '0 6px 18px rgba(20,10,40,0.14)'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        width: 38, height: 38, borderRadius: 11,
        background: 'rgba(255,255,255,0.22)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    }, icon),
    /*#__PURE__*/React.createElement('div', null,
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)' } }, label),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, color: '#fff', marginTop: 3 } }, value)
    )
  );
}

function SectionLabel({ children }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { fontSize: 12, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 20px 8px' }
  }, children);
}

function WideStat({ icon, label, value, tint, size }) {
  const isLg = size === 'lg';
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 12px',
      background: tint + '14',
      border: `1px solid ${tint}35`,
      borderRadius: 18,
      padding: isLg ? '20px 22px' : '15px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16
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

const PERIODS = [
  { key: 'all', label: 'Journée', tag: 'du jour' },
  { key: 'midi', label: 'Midi', tag: 'du midi' },
  { key: 'soir', label: 'Soir', tag: 'du soir' }
];

function PeriodSwitch({ period, setPeriod }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { display: 'flex', gap: 4, margin: '0 20px 16px', background: T.bgSide, padding: 4, borderRadius: 13 }
  },
    PERIODS.map(p => /*#__PURE__*/React.createElement('button', {
      key: p.key,
      onClick: () => setPeriod(p.key),
      style: {
        flex: 1,
        padding: '10px 0',
        borderRadius: 10,
        border: 'none',
        background: period === p.key ? T.bgCard : 'transparent',
        color: period === p.key ? T.primaryD : T.txtSub,
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        boxShadow: period === p.key ? '0 1px 4px rgba(20,10,40,0.1)' : 'none',
        transition: 'background .15s ease, box-shadow .15s ease'
      }
    }, p.label))
  );
}

const MIDI_HOURS = [11, 12, 13, 14];
const SOIR_HOURS = [18, 19, 20, 21, 22, 23, 0];

const MIDI_CHART_THEME = {
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

const SOIR_CHART_THEME = {
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

function hourLabel(h) {
  return h === 0 ? '00:00' : String(h);
}

function ServiceHourChart({ title, icon, hours, orders, theme }) {
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

function ServiceHourCharts({ orders }) {
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

function CategoryAccordion({ dayOrders }) {
  const [open, setOpen] = React.useState(null);
  const sales = React.useMemo(() => categorySales(dayOrders), [dayOrders]);
  const totals = CATEGORIES.map(cat => Object.values(sales[cat.key]).reduce((s, q) => s + q, 0));
  const grandTotal = totals.reduce((s, t) => s + t, 0);

  return /*#__PURE__*/React.createElement('div', {
    style: { margin: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }
  },
    CATEGORIES.map((cat, idx) => {
      const products = Object.entries(sales[cat.key]).sort((a, b) => b[1] - a[1]);
      const total = totals[idx];
      const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;
      const isOpen = open === cat.key;
      return /*#__PURE__*/React.createElement('div', {
        key: cat.key,
        style: {
          background: T.bgCard,
          borderRadius: 14,
          border: `1px solid ${isOpen ? cat.tint : T.brd}`,
          overflow: 'hidden',
          transition: 'border-color .15s ease'
        }
      },
        /*#__PURE__*/React.createElement('button', {
          onClick: () => setOpen(isOpen ? null : cat.key),
          style: {
            width: '100%',
            display: 'block',
            padding: '14px 16px',
            border: 'none',
            background: isOpen ? cat.tint + '10' : T.bgCard,
            cursor: 'pointer',
            textAlign: 'left'
          }
        },
          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: isOpen ? cat.tint : T.txt } }, cat.label),
            /*#__PURE__*/React.createElement('span', {
              style: {
                display: 'flex', color: isOpen ? cat.tint : T.txtMuted,
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform .2s ease'
              }
            }, /*#__PURE__*/React.createElement(IconChevronDown, { size: 16 }))
          ),
          /*#__PURE__*/React.createElement('div', { style: { height: 8, borderRadius: 999, background: cat.tint + '15', marginTop: 10, overflow: 'hidden' } },
            /*#__PURE__*/React.createElement('div', {
              style: {
                height: '100%', width: pct + '%', background: cat.tint, borderRadius: 999,
                transition: 'width .5s ease'
              }
            })
          ),
          /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6 } },
            /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, color: T.txtSub } }, total + ' vente' + (total !== 1 ? 's' : '')),
            /*#__PURE__*/React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: cat.tint } }, pct + '%')
          )
        ),
        /*#__PURE__*/React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows .25s ease'
          }
        },
          /*#__PURE__*/React.createElement('div', { style: { overflow: 'hidden' } },
            products.length === 0
              ? /*#__PURE__*/React.createElement('div', { style: { padding: '4px 16px 14px', fontSize: 13, color: T.txtMuted } }, 'Aucune vente ce jour-là')
              : /*#__PURE__*/React.createElement('div', { style: { padding: '2px 16px 12px', display: 'flex', flexDirection: 'column' } },
                  products.map(([name, qty]) => /*#__PURE__*/React.createElement('div', {
                    key: name,
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: `1px solid ${T.brdL}`,
                      fontSize: 14
                    }
                  },
                    /*#__PURE__*/React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 8, color: T.txt, minWidth: 0 } },
                      /*#__PURE__*/React.createElement(IconCheck, { size: 13 }),
                      /*#__PURE__*/React.createElement('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, name)
                    ),
                    /*#__PURE__*/React.createElement('span', { style: { fontWeight: 700, color: T.txt, flexShrink: 0, marginLeft: 12 } }, qty)
                  ))
                )
          )
        )
      );
    })
  );
}

function IconButton({ icon, onClick, disabled, tint }) {
  return /*#__PURE__*/React.createElement('button', {
    onClick,
    disabled,
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      border: 'none',
      background: 'transparent',
      color: disabled ? T.txtMuted : (tint || T.txt),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1
    }
  }, icon);
}

function InfoRow({ label, value }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '9px 0',
      borderBottom: `1px solid ${T.brdL}`,
      fontSize: 14.5
    }
  },
    /*#__PURE__*/React.createElement('span', { style: { color: T.txtSub } }, label),
    /*#__PURE__*/React.createElement('span', { style: { color: T.txt, fontWeight: 700, textAlign: 'right' } }, value)
  );
}

const fieldStyle = {
  width: '100%',
  padding: '11px 12px',
  fontSize: 15,
  borderRadius: 10,
  border: `1px solid ${T.brd}`,
  background: T.bgCard,
  color: T.txt,
  boxSizing: 'border-box'
};

function EditField({ label, children }) {
  return /*#__PURE__*/React.createElement('div', { style: { marginBottom: 14 } },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, color: T.txtSub, fontWeight: 600, marginBottom: 6 } }, label),
    children
  );
}

function OrderDetailModal({ order, onClose, onSave, onDelete }) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    client: order.client || '',
    phone: order.phone || '',
    service: order.service || SERVICE_OPTIONS[0],
    payment: order.payment || PAYMENT_OPTIONS[0]
  });

  const save = async () => {
    setSaving(true);
    await onSave(order.id, form);
    setSaving(false);
    setEditing(false);
  };

  const del = async () => {
    if (!window.confirm(`Supprimer la commande #${order.num} ? Cette action est définitive.`)) return;
    await onDelete(order.id);
    onClose();
  };

  return /*#__PURE__*/React.createElement(Modal, { onClose }, /*#__PURE__*/React.createElement('div', {
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(92vw, 460px)',
      maxHeight: '88vh',
      display: 'flex',
      flexDirection: 'column',
      background: T.bgCard,
      borderRadius: 20,
      boxShadow: '0 24px 70px rgba(20,10,40,0.28)',
      overflow: 'hidden'
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '18px 18px 14px 20px',
        borderBottom: `1px solid ${T.brdL}`
      }
    },
      /*#__PURE__*/React.createElement('div', null,
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: T.txt } }, 'Commande #' + order.num),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, color: T.txtSub, marginTop: 3 } }, fd(order.date) + ' à ' + ft(order.date))
      ),
      /*#__PURE__*/React.createElement(IconButton, { icon: /*#__PURE__*/React.createElement(IconClose, { size: 18 }), onClick: onClose })
    ),

    /*#__PURE__*/React.createElement('div', { style: { padding: '16px 20px', overflowY: 'auto', flex: 1 } },
      editing
        ? [
            /*#__PURE__*/React.createElement(EditField, { key: 'client', label: 'Prénom / Client' },
              /*#__PURE__*/React.createElement('input', { style: fieldStyle, value: form.client, onChange: e => setForm({ ...form, client: e.target.value }), placeholder: 'Prénom du client' })
            ),
            /*#__PURE__*/React.createElement(EditField, { key: 'phone', label: 'Téléphone' },
              /*#__PURE__*/React.createElement('input', { style: fieldStyle, value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), placeholder: 'Numéro de téléphone' })
            ),
            /*#__PURE__*/React.createElement(EditField, { key: 'service', label: 'Service' },
              /*#__PURE__*/React.createElement('select', { style: fieldStyle, value: form.service, onChange: e => setForm({ ...form, service: e.target.value }) },
                SERVICE_OPTIONS.map(s => /*#__PURE__*/React.createElement('option', { key: s, value: s }, s))
              )
            ),
            /*#__PURE__*/React.createElement(EditField, { key: 'payment', label: 'Paiement' },
              /*#__PURE__*/React.createElement('select', { style: fieldStyle, value: form.payment, onChange: e => setForm({ ...form, payment: e.target.value }) },
                PAYMENT_OPTIONS.map(p => /*#__PURE__*/React.createElement('option', { key: p, value: p }, p))
              )
            )
          ]
        : [
            /*#__PURE__*/React.createElement(InfoRow, { key: 'client', label: 'Client', value: order.client || '—' }),
            /*#__PURE__*/React.createElement(InfoRow, { key: 'phone', label: 'Téléphone', value: order.phone || '—' }),
            /*#__PURE__*/React.createElement(InfoRow, { key: 'service', label: 'Service', value: order.service || '—' }),
            /*#__PURE__*/React.createElement(InfoRow, { key: 'payment', label: 'Paiement', value: order.payment || '—' }),
            /*#__PURE__*/React.createElement('div', { key: 'items-title', style: { fontSize: 12.5, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 16, marginBottom: 8 } }, 'Articles'),
            ...order.items.map((it, i) => /*#__PURE__*/React.createElement('div', {
              key: 'item' + i,
              style: { padding: '10px 0', borderBottom: `1px solid ${T.brdL}` }
            },
              /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14.5, color: T.txt } },
                /*#__PURE__*/React.createElement('span', null, it.qty + 'x ' + it.name),
                /*#__PURE__*/React.createElement('span', null, fp(it.total))
              ),
              custLines(it.cust).map((line, j) => /*#__PURE__*/React.createElement('div', {
                key: 'l' + j,
                style: { fontSize: 12.5, color: T.txtSub, marginTop: 2 }
              }, line))
            )),
            /*#__PURE__*/React.createElement('div', {
              key: 'total',
              style: { display: 'flex', justifyContent: 'space-between', paddingTop: 14, marginTop: 6, fontSize: 17, fontWeight: 800, color: T.txt }
            },
              /*#__PURE__*/React.createElement('span', null, 'Total'),
              /*#__PURE__*/React.createElement('span', { style: { color: T.primaryD } }, fp(order.total))
            )
          ]
    ),

    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${T.brdL}` } },
      editing
        ? [
            /*#__PURE__*/React.createElement('button', {
              key: 'cancel',
              onClick: () => setEditing(false),
              style: { flex: 1, padding: '13px', borderRadius: 12, border: `1px solid ${T.brd}`, background: T.bgCard, color: T.txtSub, fontWeight: 700, fontSize: 15, cursor: 'pointer' }
            }, 'Annuler'),
            /*#__PURE__*/React.createElement('button', {
              key: 'save',
              onClick: save,
              disabled: saving,
              style: { flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: T.primary, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.7 : 1 }
            }, saving ? 'Enregistrement...' : 'Enregistrer')
          ]
        : [
            /*#__PURE__*/React.createElement('button', {
              key: 'edit',
              onClick: () => setEditing(true),
              style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, border: `1px solid ${T.brd}`, background: T.bgCard, color: T.txt, fontWeight: 700, fontSize: 15, cursor: 'pointer' }
            }, /*#__PURE__*/React.createElement(IconEdit, { size: 17 }), 'Modifier'),
            /*#__PURE__*/React.createElement('button', {
              key: 'delete',
              onClick: del,
              style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, border: 'none', background: T.noL, color: T.no, fontWeight: 700, fontSize: 15, cursor: 'pointer' }
            }, /*#__PURE__*/React.createElement(IconTrash, { size: 17 }), 'Supprimer')
          ]
    )
  ));
}

function PaymentPill({ payment }) {
  const isEsp = (payment || '').toLowerCase().startsWith('esp');
  const color = isEsp ? T.ok : '#2563EB';
  return /*#__PURE__*/React.createElement('span', {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color,
      background: color + '15',
      padding: '3px 9px',
      borderRadius: 999,
      flexShrink: 0
    }
  }, payment || '—');
}

function OrderCard({ order, onClick }) {
  const displayName = order.client || order.phone || 'Commande';
  return /*#__PURE__*/React.createElement('button', {
    className: 'osm-tap-card',
    onClick,
    style: {
      width: '100%',
      display: 'block',
      background: T.bgCard,
      border: `1px solid ${T.brd}`,
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(20,10,40,0.04)',
      padding: '13px 16px',
      textAlign: 'left',
      cursor: 'pointer'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
      /*#__PURE__*/React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.txtMuted, fontWeight: 600 } },
        '#' + order.num,
        /*#__PURE__*/React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 3 } }, /*#__PURE__*/React.createElement(IconClock, { size: 12 }), ft(order.date))
      ),
      /*#__PURE__*/React.createElement(PaymentPill, { payment: order.payment })
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 } },
      /*#__PURE__*/React.createElement('span', { style: { fontWeight: 700, fontSize: 16, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, displayName),
      /*#__PURE__*/React.createElement('span', { style: { fontWeight: 800, fontSize: 17, color: T.primaryD, flexShrink: 0 } }, fp(order.total))
    ),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, color: T.txtSub, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, itemsSummary(order.items))
  );
}

export function Dash({ orders, onReset, onUpdateOrder, onDeleteOrder }) {
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [period, setPeriod] = React.useState('all');
  const today = fd(selectedDate);
  const isToday = today === fd(new Date());
  const periodTag = PERIODS.find(p => p.key === period).tag;

  const shiftDate = deltaDays => setSelectedDate(d => {
    const n = new Date(d);
    n.setDate(n.getDate() + deltaDays);
    return n;
  });

  const dayOrders = orders
    .filter(o => fd(o.date) === today && o.status !== 'annulee')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const periodOrders = period === 'midi'
    ? dayOrders.filter(o => new Date(o.date).getHours() < 15)
    : period === 'soir'
      ? dayOrders.filter(o => new Date(o.date).getHours() >= 15)
      : dayOrders;

  const rev = periodOrders.reduce((s, o) => s + o.total, 0);
  const revEsp = periodOrders.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = periodOrders.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const panierMoyen = periodOrders.length ? rev / periodOrders.length : 0;
  const telCount = periodOrders.filter(o => o.phone).length;

  const handleSave = async (id, updates) => {
    await onUpdateOrder(id, updates);
    setSelectedOrder(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  };

  const handleDelete = async id => {
    await onDeleteOrder(id);
  };

  return /*#__PURE__*/React.createElement('div', {
    style: { flex: 1, overflowY: 'auto', background: T.bg }
  },
    /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        padding: '16px 20px 12px'
      }
    },
      /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 2 } },
        /*#__PURE__*/React.createElement(IconButton, { icon: /*#__PURE__*/React.createElement(IconChevronLeft, {}), onClick: () => shiftDate(-1) }),
        /*#__PURE__*/React.createElement('div', {
          style: {
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 12,
            background: T.bgCard, border: `1px solid ${T.brd}`,
            position: 'relative'
          }
        },
          /*#__PURE__*/React.createElement(IconCalendar, { size: 16 }),
          /*#__PURE__*/React.createElement('span', { style: { fontSize: 14.5, fontWeight: 700, color: T.txt, textTransform: 'capitalize' } }, dayLabel(selectedDate)),
          /*#__PURE__*/React.createElement('input', {
            type: 'date',
            value: toDateInputValue(selectedDate),
            onChange: e => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split('-').map(Number);
              setSelectedDate(new Date(y, m - 1, d));
            },
            style: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', border: 'none' }
          })
        ),
        /*#__PURE__*/React.createElement(IconButton, { icon: /*#__PURE__*/React.createElement(IconChevronRight, {}), onClick: () => shiftDate(1), disabled: isToday })
      ),
      isToday && /*#__PURE__*/React.createElement('button', {
        onClick: onReset,
        style: {
          padding: '9px 14px',
          borderRadius: 10,
          border: 'none',
          background: T.noL,
          color: T.no,
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer'
        }
      }, 'Réinitialiser')
    ),

    /*#__PURE__*/React.createElement(PeriodSwitch, { period, setPeriod }),

    /*#__PURE__*/React.createElement(HeroRevenue, { value: fp(rev), tag: periodTag }),

    /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        margin: '0 20px 20px'
      }
    },
      /*#__PURE__*/React.createElement(PaymentHeroCard, { icon: /*#__PURE__*/React.createElement(IconCash, { size: 20 }), label: 'Espèces', value: fp(revEsp), bg: '#10B981' }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, { icon: /*#__PURE__*/React.createElement(IconCard, { size: 20 }), label: 'Carte bancaire', value: fp(revCB), bg: '#2563EB' })
    ),

    /*#__PURE__*/React.createElement(WideStat, { icon: /*#__PURE__*/React.createElement(IconPhone, { size: 22 }), label: 'Par téléphone', value: String(telCount), tint: '#0EA5E9', size: 'lg' }),
    /*#__PURE__*/React.createElement(WideStat, { icon: /*#__PURE__*/React.createElement(IconBag, { size: 18 }), label: 'Panier moyen', value: fp(panierMoyen), tint: '#D97706', size: 'md' }),

    /*#__PURE__*/React.createElement('div', { style: { padding: '0 20px 20px' } },
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconReceipt, {}), label: 'Commandes', value: String(periodOrders.length), tint: '#7C3AED' })
    ),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Ventes par catégorie'),
    /*#__PURE__*/React.createElement(CategoryAccordion, { dayOrders: periodOrders }),

    /*#__PURE__*/React.createElement(ServiceHourCharts, { orders: dayOrders }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Commandes ' + periodTag),
    /*#__PURE__*/React.createElement('div', {
      style: { margin: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }
    },
      periodOrders.length === 0
        ? /*#__PURE__*/React.createElement('div', {
            style: { padding: 40, textAlign: 'center', color: T.txtMuted, fontSize: 14, background: T.bgCard, borderRadius: 14, border: `1px solid ${T.brd}` }
          }, 'Aucune commande sur cette période')
        : periodOrders.map(o => /*#__PURE__*/React.createElement(OrderCard, { key: o.id, order: o, onClick: () => setSelectedOrder(o) }))
    ),

    selectedOrder && /*#__PURE__*/React.createElement(OrderDetailModal, {
      order: selectedOrder,
      onClose: () => setSelectedOrder(null),
      onSave: handleSave,
      onDelete: handleDelete
    })
  );
}
