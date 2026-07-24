import React from 'react';
import { T } from '../data/theme.js';
import { fp, ft, fd } from '../utils/format.js';
import { Modal } from './Modal.jsx';
import {
  IconMoney, IconReceipt, IconBag, IconCash, IconCard, IconPhone,
  IconClock, IconClose, IconChevronLeft, IconChevronRight,
  IconTrash, IconEdit, IconCalendar
} from './icons.jsx';

const PAYMENT_OPTIONS = ['Especes', 'CB'];
const SERVICE_OPTIONS = ['Sur place', 'A emporter'];

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

function StatTile({ icon, label, value, tint }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: T.bgCard,
      borderRadius: 16,
      border: `1px solid ${T.brd}`,
      boxShadow: '0 1px 3px rgba(20,10,40,0.05)',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 78
    }
  },
    /*#__PURE__*/React.createElement('div', { style: iconTileStyle(tint) }, icon),
    /*#__PURE__*/React.createElement('div', { style: { minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, color: T.txtSub, fontWeight: 600, whiteSpace: 'nowrap' } }, label),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 20, fontWeight: 800, color: T.txt, marginTop: 2, whiteSpace: 'nowrap' } }, value)
    )
  );
}

function LetterBadge({ letters, tint }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { ...iconTileStyle(tint), fontSize: 13, fontWeight: 800 }
  }, letters);
}

function SectionLabel({ children }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { fontSize: 12, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 20px 8px' }
  }, children);
}

function HourChart({ orders }) {
  const buckets = Array.from({ length: 16 }, (_, i) => ({ hour: i + 8, total: 0 }));
  orders.forEach(o => {
    const h = new Date(o.date).getHours();
    const b = buckets.find(x => x.hour === h);
    if (b) b.total += o.total;
  });
  const max = Math.max(1, ...buckets.map(b => b.total));
  return /*#__PURE__*/React.createElement('div', {
    style: {
      margin: '0 20px 24px',
      background: T.bgCard,
      borderRadius: 16,
      border: `1px solid ${T.brd}`,
      padding: '18px 16px 14px'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: T.txt, marginBottom: 14, paddingLeft: 4 } }, "Chiffre d'affaires par heure"),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 4, height: 130 } },
      buckets.map(b => /*#__PURE__*/React.createElement('div', {
        key: b.hour,
        style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }
      },
        /*#__PURE__*/React.createElement('div', {
          title: b.hour + 'h : ' + fp(b.total),
          style: {
            width: '100%',
            maxWidth: 22,
            height: Math.max(2, (b.total / max) * 100),
            background: b.total > 0 ? T.primary : T.brdL,
            borderRadius: '5px 5px 2px 2px'
          }
        }),
        /*#__PURE__*/React.createElement('div', { style: { fontSize: 9.5, color: T.txtMuted } }, b.hour)
      ))
    )
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

function OrderRow({ order, onClick }) {
  const displayName = order.client || order.phone || order.service || 'Commande';
  const tint = (order.payment || '').toLowerCase().startsWith('esp') ? T.ok : '#2563EB';
  return /*#__PURE__*/React.createElement('button', {
    onClick,
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      background: T.bgCard,
      border: 'none',
      borderLeft: `3px solid ${tint}`,
      borderBottom: `1px solid ${T.brdL}`,
      textAlign: 'left',
      cursor: 'pointer',
      minHeight: 68
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, color: T.primaryD, fontSize: 14, width: 32, flexShrink: 0 } }, '#' + order.num),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, color: T.txtMuted, fontSize: 12.5, width: 52, flexShrink: 0 } },
      /*#__PURE__*/React.createElement(IconClock, { size: 13 }), ft(order.date)
    ),
    /*#__PURE__*/React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 700, fontSize: 15, color: T.txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, displayName),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12.5, color: T.txtSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 } }, itemsSummary(order.items))
    ),
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 15.5, color: T.txt, flexShrink: 0 } }, fp(order.total))
  );
}

export function Dash({ orders, onReset, onUpdateOrder, onDeleteOrder }) {
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const today = fd(selectedDate);
  const isToday = today === fd(new Date());

  const shiftDate = deltaDays => setSelectedDate(d => {
    const n = new Date(d);
    n.setDate(n.getDate() + deltaDays);
    return n;
  });

  const dayOrders = orders
    .filter(o => fd(o.date) === today && o.status !== 'annulee')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const rev = dayOrders.reduce((s, o) => s + o.total, 0);
  const revEsp = dayOrders.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = dayOrders.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const panierMoyen = dayOrders.length ? rev / dayOrders.length : 0;
  const revMidi = dayOrders.filter(o => new Date(o.date).getHours() < 15).reduce((s, o) => s + o.total, 0);
  const revSoir = dayOrders.filter(o => new Date(o.date).getHours() >= 15).reduce((s, o) => s + o.total, 0);
  const telCount = dayOrders.filter(o => o.phone).length;
  const catQty = prefix => dayOrders.reduce((s, o) => s + o.items.filter(i => (i.pid || '').startsWith(prefix)).reduce((a, i) => a + i.qty, 0), 0);
  const burgersQty = catQty('b-');
  const rizQty = catQty('r-');
  const boissonsQty = catQty('dr-');
  const milkshakesQty = catQty('mk-');
  const crepesQty = catQty('cr-');

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

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Résumé du jour'),
    /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        padding: '0 20px 20px'
      }
    },
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconMoney, {}), label: 'Chiffre d\'affaires', value: fp(rev), tint: T.primary }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconReceipt, {}), label: 'Commandes', value: String(dayOrders.length), tint: '#7C3AED' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconBag, {}), label: 'Panier moyen', value: fp(panierMoyen), tint: '#D97706' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconPhone, {}), label: 'Par téléphone', value: String(telCount), tint: '#0EA5E9' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconMoney, {}), label: 'Midi (avant 15h)', value: fp(revMidi), tint: '#D97706' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconMoney, {}), label: 'Soir (après 15h)', value: fp(revSoir), tint: '#7C3AED' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconCash, {}), label: 'Espèces', value: fp(revEsp), tint: '#10B981' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(IconCard, {}), label: 'Carte bancaire', value: fp(revCB), tint: '#2563EB' })
    ),

    /*#__PURE__*/React.createElement(SectionLabel, null, 'Ventes par catégorie'),
    /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        padding: '0 20px 20px'
      }
    },
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(LetterBadge, { letters: 'B' }), label: 'Burgers', value: String(burgersQty), tint: '#D97706' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(LetterBadge, { letters: 'R' }), label: 'Riz Crousty', value: String(rizQty), tint: T.primary }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(LetterBadge, { letters: 'Bo' }), label: 'Boissons', value: String(boissonsQty), tint: '#2563EB' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(LetterBadge, { letters: 'M' }), label: 'Milkshakes', value: String(milkshakesQty), tint: '#DB2777' }),
      /*#__PURE__*/React.createElement(StatTile, { icon: /*#__PURE__*/React.createElement(LetterBadge, { letters: 'Cr' }), label: 'Crêpes', value: String(crepesQty), tint: '#0D9488' })
    ),

    /*#__PURE__*/React.createElement(HourChart, { orders: dayOrders }),

    /*#__PURE__*/React.createElement('div', {
      style: {
        margin: '0 20px 24px',
        background: T.bgCard,
        borderRadius: 16,
        border: `1px solid ${T.brd}`,
        overflow: 'hidden'
      }
    },
      dayOrders.length === 0
        ? /*#__PURE__*/React.createElement('div', { style: { padding: 40, textAlign: 'center', color: T.txtMuted, fontSize: 14 } }, 'Aucune commande ce jour-là')
        : dayOrders.map(o => /*#__PURE__*/React.createElement(OrderRow, { key: o.id, order: o, onClick: () => setSelectedOrder(o) }))
    ),

    selectedOrder && /*#__PURE__*/React.createElement(OrderDetailModal, {
      order: selectedOrder,
      onClose: () => setSelectedOrder(null),
      onSave: handleSave,
      onDelete: handleDelete
    })
  );
}
