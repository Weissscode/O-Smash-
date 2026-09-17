import React from 'react';
import { fp, ft } from '../utils/format.js';
import { CATEGORIES, MIDI_HOURS, SOIR_HOURS } from './dashShared.jsx';
import { PosIcon } from './PosIcon.jsx';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './mobileReports.css';

export function useReportMobile() {
  const [mobile, setMobile] = React.useState(() => window.matchMedia('(max-width: 600px)').matches);
  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, []);
  return mobile;
}

export function MobileNavigation({ view, onSelect, phoneCount = 0 }) {
  return <nav className="mr-bottom-nav" aria-label="Navigation principale">
    {[['pos', 'Commandes'], ['telephone', 'Téléphone'], ['stock', 'Stock'], ['dashboard', 'Dashboard'], ['analytics', 'Analytics']].map(([id, label]) =>
      <button key={id} aria-current={view === id ? 'page' : undefined} onClick={() => onSelect(id)}>
        <span className="mr-nav-icon"><PosIcon name={id}/>{id === 'telephone' && phoneCount > 0 && <i>{phoneCount}</i>}</span><span>{label}</span>
      </button>)}
  </nav>;
}

export function ReportHeader({ title, subtitle, children }) {
  return <header className="mr-page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{children}</header>;
}
export function Segments({ value, options, onChange, label }) {
  return <div className="mr-segments" role="group" aria-label={label}>{options.map(([id, text]) => <button key={id} aria-pressed={value === id} onClick={() => onChange(id)}>{text}</button>)}</div>;
}
const dateValue = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function DateControl({ date, onChange, monthly = false, isToday }) {
  const shift = n => onChange(monthly ? new Date(date.getFullYear(), date.getMonth() + n, 1) : new Date(date.getFullYear(), date.getMonth(), date.getDate() + n));
  return <div className="mr-date-control">
    <button aria-label={monthly ? 'Mois précédent' : 'Jour précédent'} onClick={() => shift(-1)}>‹</button>
    <label><span>{date.toLocaleDateString('fr-FR', monthly ? {month:'long', year:'numeric'} : {weekday:'short', day:'numeric', month:'long'})}</span><span aria-hidden="true">⌄</span>
      <input aria-label={monthly ? 'Choisir un mois' : 'Choisir une date'} type={monthly ? 'month' : 'date'} value={monthly ? dateValue(date).slice(0,7) : dateValue(date)} onChange={e => {if (!e.target.value) return; const [y,m,d=1] = e.target.value.split('-').map(Number); onChange(new Date(y,m-1,d));}}/>
    </label>
    <button aria-label={monthly ? 'Mois suivant' : 'Jour suivant'} disabled={isToday} onClick={() => shift(1)}>›</button>
  </div>;
}
function Change({ value }) {
  return value === null || value === undefined ? null : <span className={'mr-change ' + (value < 0 ? 'mr-negative' : '')}>{value > 0 ? '+' : ''}{value} %</span>;
}
export function RevenueSummary({ rev, count, avg, cash, card, phone, tag, changes, previous }) {
  return <section className="mr-summary" aria-label="Indicateurs de la période">
    <div className="mr-eyebrow">Chiffre d’affaires <span>{tag}</span></div>
    <div className="mr-revenue" data-testid="revenue">{fp(rev)}</div>
    {previous && <div className="mr-comparison"><Change value={changes?.rev}/><span>{changes?.rev == null ? 'Comparaison indisponible' : 'par rapport au mois précédent'}</span></div>}
    {!previous && tag === 'du mois' && <p className="mr-comparison">Pas de référence le mois précédent</p>}
    <div className="mr-main-stats"><div><strong data-testid="count">{count}</strong><span>Commandes <Change value={changes?.count}/></span></div><div><strong data-testid="average">{fp(avg)}</strong><span>Panier moyen <Change value={changes?.avg}/></span></div></div>
    <div className="mr-payment-strip"><div><span><i className="mr-dot mr-card-dot"/>CB</span><strong>{fp(card)}</strong></div><div><span><i className="mr-dot mr-cash-dot"/>Espèces</span><strong>{fp(cash)}</strong></div><div><span>Téléphone</span><strong>{phone}<small> cmd.</small></strong></div></div>
  </section>;
}
export function ReportSection({ title, aside, children }) {
  return <section className="mr-section"><div className="mr-section-heading"><h2>{title}</h2>{aside && <span>{aside}</span>}</div><div className="mr-panel">{children}</div></section>;
}
export function CategoryRanking({ stats, total, quantityShare = false, products }) {
  const [all, setAll] = React.useState(false);
  const [open, setOpen] = React.useState(null);
  const rows = CATEGORIES.map(c => ({...c, ...stats[c.key]})).sort((a,b) => quantityShare ? b.qty-a.qty : b.revenue-a.revenue);
  const active = rows.filter(c => c.qty > 0 || c.revenue !== 0);
  return <ReportSection title="Ventes par catégorie" aside="Volume · CA">
    {!active.length && <p className="mr-empty">Les premières ventes apparaîtront ici.</p>}
    {(all ? rows : active).map(c => {
      const pct = total > 0 ? Math.round((quantityShare ? c.qty : c.revenue) / total * 100) : 0;
      const content = <><div className="mr-row-main"><strong>{c.label}</strong><span>{c.qty} vendu{c.qty !== 1 ? 's' : ''} · {pct} %</span></div><strong className="mr-row-value">{fp(c.revenue)}</strong><span className="mr-row-progress" style={{width: `${Math.max(0,Math.min(100,pct))}%`}}/></>;
      return <React.Fragment key={c.key}>{products ? <button className="mr-category-row" aria-expanded={open === c.key} onClick={() => setOpen(open === c.key ? null : c.key)}>{content}<span className="mr-disclosure">{open === c.key ? '−' : '+'}</span></button> : <div className="mr-category-row">{content}</div>}
        {products && open === c.key && <div className="mr-category-detail">{Object.entries(products[c.key]).sort((a,b)=>b[1]-a[1]).map(([name,qty])=><div key={name}><span>{name}</span><strong>{qty}</strong></div>)}{!Object.keys(products[c.key]).length && <p>Aucune vente</p>}</div>}
      </React.Fragment>;
    })}
    {active.length < rows.length && <button className="mr-text-action" onClick={() => setAll(!all)} aria-expanded={all}>{all ? 'Masquer les catégories sans vente' : `Voir les ${rows.length} catégories`}<span>{all ? '−' : '+'}</span></button>}
  </ReportSection>;
}
export function Ranking({ title, rows, onSelect, empty = 'Aucune vente sur cette période.' }) {
  return <ReportSection title={title} aside="Top 5">{rows.length ? rows.map((r,i) => {
    const Tag = onSelect ? 'button' : 'div';
    return <Tag className="mr-ranking-row" key={r.name} {...(onSelect ? {onClick:()=>onSelect(r)} : {})}><span className="mr-rank">{i+1}</span><div className="mr-row-main"><strong>{r.name}</strong><span>{r.detail}</span></div><strong className="mr-row-value">{fp(r.revenue)}</strong>{onSelect && <span className="mr-disclosure">›</span>}</Tag>;
  }) : <p className="mr-empty">{empty}</p>}</ReportSection>;
}
export function TrendChart({ buckets, max, onSelectDay }) {
  const [selected, setSelected] = React.useState(null);
  const index = selected === null ? null : Math.min(selected, buckets.length-1);
  const current = index === null ? null : buckets[index];
  const hasData = buckets.some(b=>b.total !== 0);
  return <ReportSection title="Évolution du CA" aside="Par jour">
    {!hasData ? <p className="mr-empty">Aucune vente ce mois-ci.</p> : <>
      <div className="mr-chart-caption" aria-live="polite">{current ? <><strong>{current.day} · {fp(current.total)}</strong><span>{current.count} commande{current.count !== 1 ? 's' : ''}</span></> : <><span>Touchez le graphique pour explorer</span><strong>{fp(max)} max.</strong></>}</div>
      <svg className="mr-trend" viewBox="0 0 320 116" role="slider" tabIndex="0" aria-label="Chiffre d’affaires par jour" aria-valuemin={1} aria-valuemax={buckets.length} aria-valuenow={(index ?? 0)+1} aria-valuetext={current ? `${current.day} : ${fp(current.total)}` : `1 : ${fp(buckets[0]?.total || 0)}`} onKeyDown={e=> {if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();setSelected(e.key==='Home'?0:e.key==='End'?buckets.length-1:Math.max(0,Math.min(buckets.length-1,(index??0)+(e.key==='ArrowRight'?1:-1))));}}} onPointerDown={e=> {const rect=e.currentTarget.getBoundingClientRect();setSelected(Math.max(0,Math.min(buckets.length-1,Math.floor((e.clientX-rect.left)/rect.width*buckets.length))));}}>
        {[20,60,100].map(y=><line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#eeedf1" strokeDasharray="2 4"/>)}
        {buckets.map((b,i)=><rect key={b.day} x={i*320/buckets.length+2} y={100-Math.max(0,b.total/max*85)} width={Math.max(2,320/buckets.length-4)} height={Math.max(b.total ? 2:0,b.total/max*85)} rx="2" fill={index===i?'#372a48':'#9c88b0'}/>)}
        {buckets.filter(b=>b.day===1||b.day%5===0||b.day===buckets.length).map(b=><text key={b.day} x={(b.day-.5)*320/buckets.length} y="114" textAnchor="middle" fill="#76717d" fontSize="9">{b.day}</text>)}
      </svg>
      {current && <button className="mr-text-action" onClick={()=>onSelectDay(current.date)}>Voir le {current.date.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}<span>›</span></button>}
    </>}
  </ReportSection>;
}
export function Services({ orders, comparison }) {
  const [service, setService] = React.useState('midi');
  const [hour, setHour] = React.useState(null);
  const midi = orders.filter(o=>new Date(o.date).getHours()<15);
  const soir = orders.filter(o=>new Date(o.date).getHours()>=15);
  const summaries = comparison || [midi,soir].map(list=>{const rev=list.reduce((s,o)=>s+o.total,0);return {rev,count:list.length,avg:list.length?rev/list.length:0};});
  const hours = service==='midi'?MIDI_HOURS:SOIR_HOURS;
  const buckets = hours.map(h=>({h,total:orders.filter(o=>new Date(o.date).getHours()===h).reduce((s,o)=>s+o.total,0)}));
  const max = Math.max(1,...buckets.map(b=>b.total));
  const total = summaries.reduce((s,x)=>s+x.rev,0);
  const selected = buckets.find(b=>b.h===hour);
  return <ReportSection title="Midi & soir" aside="Comparaison des services">
    <div className="mr-services">{summaries.map((s,i)=><button key={i} aria-pressed={service===(i?'soir':'midi')} onClick={()=>{setService(i?'soir':'midi');setHour(null);}}><span className="mr-service-title">{i?'Soir':'Midi'} <small>{total>0?Math.round(s.rev/total*100):0} %</small></span><strong>{fp(s.rev)}</strong><span>{s.count} commande{s.count!==1?'s':''}</span><span>Panier <b>{fp(s.avg)}</b></span></button>)}</div>
    <div className="mr-hour-header"><span>CA par heure · {service}</span><strong aria-live="polite">{selected ? `${String(selected.h).padStart(2,'0')} h · ${fp(selected.total)}` : 'Touchez une barre'}</strong></div>
    {buckets.some(b=>b.total!==0) ? <div className="mr-hours">{buckets.map(b=><button key={b.h} aria-label={`${b.h} heures : ${fp(b.total)}`} aria-pressed={hour===b.h} onClick={()=>setHour(b.h)}><span className="mr-bar-track"><i style={{height:`${Math.max(b.total?3:0,b.total/max*100)}%`}}/></span><span>{String(b.h).padStart(2,'0')}h</span></button>)}</div> : <p className="mr-empty mr-hour-empty">Aucune vente sur ces horaires.</p>}
    <p className="mr-chart-note">Horaires affichés : {service==='midi'?'11–14 h':'18–00 h'}.</p>
  </ReportSection>;
}
export function ReportCalendar({ month, buckets, max, onSelect }) {
  const blanks = (new Date(month.getFullYear(),month.getMonth(),1).getDay()+6)%7;
  return <details className="mr-calendar mr-panel"><summary>Calendrier du mois<span>⌄</span></summary><div className="mr-calendar-grid">{['L','M','M','J','V','S','D'].map((d,i)=><span key={'h'+i}>{d}</span>)}{Array.from({length:blanks},(_,i)=><span key={'b'+i}/>)}{buckets.map(b=><button key={b.day} onClick={()=>onSelect(b.date)} aria-label={`${b.day} : ${fp(b.total)}, ${b.count} commandes`} style={{background:b.total>0?`rgba(117,96,139,${.12+.42*b.total/max})`:undefined}}>{b.day}<i>{b.count?'•':''}</i></button>)}</div><p>Intensité de la couleur = chiffre d’affaires. Touchez un jour pour l’ouvrir.</p></details>;
}
export function MobileOrders({ orders, tag, onSelect }) {
  return <ReportSection title={'Commandes '+tag} aside={String(orders.length)}>{orders.length ? orders.map(o=><button className="mr-order-row" key={o.id} onClick={()=>onSelect(o)}><div className="mr-row-main"><strong>#{o.num} · {o.client || 'Client au comptoir'}</strong><span>{ft(o.date)} · {o.payment || 'Paiement non renseigné'}{o.printError?' · Ticket non imprimé':''}</span><span>{o.items.map(it=>`${it.qty}× ${it.name}`).join(', ')}</span></div><strong className="mr-row-value">{fp(o.total)}</strong><span>›</span></button>) : <p className="mr-empty">Aucune commande sur cette période.</p>}</ReportSection>;
}
