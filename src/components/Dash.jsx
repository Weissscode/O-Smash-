import React from 'react';
import { T } from '../data/theme.js';
import { fp, ft, fd } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import { segTab } from '../utils/styles.js';
import {
  IconReceipt, IconBag, IconCash, IconCard, IconPhone,
  IconClock, IconClose, IconChevronLeft, IconChevronRight,
  IconTrash, IconEdit, IconCalendar, IconCheck, IconChevronDown
} from './icons.jsx';
import {
  CATEGORIES, StatTile, HeroRevenue, PaymentHeroCard, SectionLabel, StatRow,
  ServiceHourCharts
} from './dashShared.jsx';

const PAYMENT_OPTIONS = ['Especes', 'CB'];
const SERVICE_OPTIONS = ['Sur place', 'A emporter'];

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

const PERIODS = [
  { key: 'all', label: 'Journée', tag: 'du jour' },
  { key: 'midi', label: 'Midi', tag: 'du midi' },
  { key: 'soir', label: 'Soir', tag: 'du soir' }
];

function PeriodSwitch({ period, setPeriod }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      display: 'flex', gap: 2, margin: '0 20px 16px',
      border: `1px solid ${T.brd}`, borderRadius: T.rMd,
      background: T.bgCard, padding: 3
    }
  },
    PERIODS.map(p => /*#__PURE__*/React.createElement('button', {
      key: p.key,
      className: 'osm-btn-premium',
      onClick: () => setPeriod(p.key),
      style: segTab(period === p.key, { flex: 1, padding: '9px 0', fontSize: 14 })
    }, p.label))
  );
}

function CategoryAccordion({ dayOrders }) {
  const [open, setOpen] = React.useState(null);
  const sales = React.useMemo(() => categorySales(dayOrders), [dayOrders]);
  const totals = CATEGORIES.map(cat => Object.values(sales[cat.key]).reduce((s, q) => s + q, 0));
  const grandTotal = totals.reduce((s, t) => s + t, 0);

  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 24px',
      background: T.bgCard,
      border: `1px solid ${T.brd}`,
      borderRadius: T.rMd,
      overflow: 'hidden'
    }
  },
    CATEGORIES.map((cat, idx) => {
      const products = Object.entries(sales[cat.key]).sort((a, b) => b[1] - a[1]);
      const total = totals[idx];
      const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;
      const isOpen = open === cat.key;
      return /*#__PURE__*/React.createElement('div', {
        key: cat.key,
        style: {
          borderTop: idx === 0 ? 'none' : `1px solid ${T.brdL}`,
          background: isOpen ? T.primaryLL : 'transparent'
        }
      },
        /*#__PURE__*/React.createElement('button', {
          onClick: () => setOpen(isOpen ? null : cat.key),
          className: 'osm-cat-row',
          style: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '11px 16px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left'
          }
        },
          /*#__PURE__*/React.createElement('span', {
            style: { fontWeight: 600, fontSize: 13, color: T.txt, flex: '0 1 118px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
          }, cat.label),
          /*#__PURE__*/React.createElement('span', {
            className: 'osm-cat-bar',
            style: { background: T.bgSide }
          },
            /*#__PURE__*/React.createElement('span', {
              style: { display: 'block', height: '100%', width: pct + '%', background: total > 0 ? cat.tint : 'transparent' }
            })
          ),
          /*#__PURE__*/React.createElement('span', {
            className: 'osm-cat-sales',
            style: { fontSize: 12, color: T.txtSub }
          }, total + ' vente' + (total !== 1 ? 's' : '')),
          /*#__PURE__*/React.createElement('span', {
            className: 'osm-num',
            style: { fontSize: 12, fontWeight: 600, color: T.txt, minWidth: 34, marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }
          }, pct + '%'),
          /*#__PURE__*/React.createElement('span', {
            style: {
              display: 'flex', color: T.txtMuted, flexShrink: 0,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform .2s ease'
            }
          }, /*#__PURE__*/React.createElement(IconChevronDown, { size: 16 }))
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
    className: 'osm-icon-btn',
    onClick,
    disabled,
    style: {
      width: 40,
      height: 40,
      borderRadius: 4,
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
    /*#__PURE__*/React.createElement('span', { style: { color: T.txt, fontWeight: 600, textAlign: 'right' } }, value)
  );
}

const fieldStyle = {
  width: '100%',
  padding: '11px 12px',
  fontSize: 15,
  borderRadius: 4,
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
      borderRadius: T.rLg,
      boxShadow: T.shModal,
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
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 17, fontWeight: 600, color: T.txt } }, 'Commande #' + order.num),
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
            order.printError && /*#__PURE__*/React.createElement('div', {
              key: 'print-error',
              style: { marginTop: 10, padding: '10px 12px', borderRadius: 4, background: T.noL, borderLeft: `3px solid ${T.no}`, color: T.no, fontSize: 12.5, fontWeight: 600 }
            }, 'Ticket non imprimé : ' + order.printError),
            /*#__PURE__*/React.createElement('div', { key: 'items-title', style: { fontSize: 11.5, fontWeight: 600, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 16, marginBottom: 8 } }, 'Articles'),
            ...order.items.map((it, i) => /*#__PURE__*/React.createElement('div', {
              key: 'item' + i,
              style: { padding: '10px 0', borderBottom: `1px solid ${T.brdL}` }
            },
              /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 14.5, color: T.txt } },
                /*#__PURE__*/React.createElement('span', null, it.qty + 'x ' + it.name),
                /*#__PURE__*/React.createElement('span', { className: 'osm-num' }, fp(it.total))
              ),
              custLines(it.cust).map((line, j) => /*#__PURE__*/React.createElement('div', {
                key: 'l' + j,
                style: { fontSize: 12.5, color: T.txtSub, marginTop: 2 }
              }, line))
            )),
            /*#__PURE__*/React.createElement('div', {
              key: 'total',
              style: { display: 'flex', justifyContent: 'space-between', paddingTop: 14, marginTop: 6, fontSize: 17, fontWeight: 600, color: T.txt }
            },
              /*#__PURE__*/React.createElement('span', null, 'Total'),
              /*#__PURE__*/React.createElement('span', { className: 'osm-num' }, fp(order.total))
            )
          ]
    ),

    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${T.brdL}` } },
      editing
        ? [
            /*#__PURE__*/React.createElement('button', {
              key: 'cancel',
              className: 'osm-btn-premium',
              onClick: () => setEditing(false),
              style: { flex: 1, padding: '13px', borderRadius: T.rMd, border: `1px solid ${T.brd}`, background: T.bgCard, color: T.txtSub, fontWeight: 600, fontSize: 15, cursor: 'pointer' }
            }, 'Annuler'),
            /*#__PURE__*/React.createElement('button', {
              key: 'save',
              className: 'osm-btn-premium',
              onClick: save,
              disabled: saving,
              style: { flex: 1, padding: '13px', borderRadius: T.rMd, border: 'none', background: T.primary, color: T.white, fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.6 : 1 }
            }, saving ? 'Enregistrement...' : 'Enregistrer')
          ]
        : [
            /*#__PURE__*/React.createElement('button', {
              key: 'edit',
              className: 'osm-btn-premium',
              onClick: () => setEditing(true),
              style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: T.rMd, border: `1px solid ${T.brd}`, background: T.bgCard, color: T.txt, fontWeight: 600, fontSize: 15, cursor: 'pointer' }
            }, /*#__PURE__*/React.createElement(IconEdit, { size: 17 }), 'Modifier'),
            /*#__PURE__*/React.createElement('button', {
              key: 'delete',
              className: 'osm-btn-premium',
              onClick: del,
              style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: T.rMd, border: `1px solid ${T.no}40`, background: T.noL, color: T.no, fontWeight: 600, fontSize: 15, cursor: 'pointer' }
            }, /*#__PURE__*/React.createElement(IconTrash, { size: 17 }), 'Supprimer')
          ]
    )
  ));
}

function PaymentPill({ payment }) {
  const isEsp = (payment || '').toLowerCase().startsWith('esp');
  const color = isEsp ? T.ok : T.info;
  return /*#__PURE__*/React.createElement('span', {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color,
      background: isEsp ? T.okL : T.infoL,
      padding: '3px 9px',
      borderRadius: T.rPill,
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
      borderRadius: T.rMd,
      padding: '13px 16px',
      textAlign: 'left',
      cursor: 'pointer'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
      /*#__PURE__*/React.createElement('span', { className: 'osm-num', style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.txtMuted, fontWeight: 500 } },
        '#' + order.num,
        /*#__PURE__*/React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 3 } }, /*#__PURE__*/React.createElement(IconClock, { size: 12 }), ft(order.date))
      ),
      /*#__PURE__*/React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        order.printError && /*#__PURE__*/React.createElement('span', {
          title: order.printError,
          style: { fontSize: 11, fontWeight: 600, color: T.no, background: T.noL, padding: '3px 8px', borderRadius: T.rPill, flexShrink: 0 }
        }, 'Non imprimé'),
        /*#__PURE__*/React.createElement(PaymentPill, { payment: order.payment })
      )
    ),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 } },
      /*#__PURE__*/React.createElement('span', { style: { fontWeight: 600, fontSize: 16, color: T.txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, displayName),
      /*#__PURE__*/React.createElement('span', { className: 'osm-num', style: { fontWeight: 600, fontSize: 17, color: T.txt, flexShrink: 0 } }, fp(order.total))
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
            padding: '9px 14px', borderRadius: T.rMd,
            background: T.bgCard,
            border: `1px solid ${T.brd}`,
            position: 'relative'
          }
        },
          /*#__PURE__*/React.createElement(IconCalendar, { size: 16 }),
          /*#__PURE__*/React.createElement('span', { style: { fontSize: 14.5, fontWeight: 600, color: T.txt, textTransform: 'capitalize' } }, dayLabel(selectedDate)),
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
        className: 'osm-btn-premium',
        onClick: onReset,
        style: {
          padding: '9px 14px',
          borderRadius: T.rMd,
          border: `1px solid ${T.no}40`,
          background: T.noL,
          color: T.no,
          fontWeight: 600,
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
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCash, { size: 18 }), label: 'Espèces', value: fp(revEsp), tint: T.ok
      }),
      /*#__PURE__*/React.createElement(PaymentHeroCard, {
        icon: /*#__PURE__*/React.createElement(IconCard, { size: 18 }), label: 'Carte bancaire', value: fp(revCB), tint: T.info
      })
    ),

    /*#__PURE__*/React.createElement(StatRow, {
      count: periodOrders.length, countLabel: 'Commandes', avgBasket: panierMoyen, telCount
    }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Ventes par catégorie'),
    /*#__PURE__*/React.createElement(CategoryAccordion, { dayOrders: periodOrders }),

    /*#__PURE__*/React.createElement(ServiceHourCharts, { orders: dayOrders }),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Commandes ' + periodTag),
    /*#__PURE__*/React.createElement('div', {
      style: { margin: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }
    },
      periodOrders.length === 0
        ? /*#__PURE__*/React.createElement('div', {
            style: { padding: 40, textAlign: 'center', color: T.txtMuted, fontSize: 14, background: T.bgCard, borderRadius: T.rMd, border: `1px solid ${T.brd}` }
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
