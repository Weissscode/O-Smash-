import React from 'react';
import { IconCalendar, IconChevronLeft, IconChevronRight, IconChevronDown, IconClose } from './icons.jsx';

const localKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const monthStart = d => new Date(d.getFullYear(), d.getMonth(), 1);
const monthLabel = d => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

export function ManagerPeriodControl({ period, date, onChange, onPeriodChange }) {
  const dialog = React.useRef(null);
  const [view, setView] = React.useState(() => monthStart(date));
  const monthly = period === 'mois';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const current = monthly ? +monthStart(date) === +monthStart(today) : localKey(date) === localKey(today);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const label = monthly ? monthLabel(date) : current ? 'Aujourd’hui' : localKey(date) === localKey(yesterday) ? 'Hier' : date.toLocaleDateString('fr-FR', { weekday: 'long' });
  const shift = n => onChange(monthly ? new Date(date.getFullYear(), date.getMonth() + n, 1) : new Date(date.getFullYear(), date.getMonth(), date.getDate() + n));
  const choose = next => { onChange(next); dialog.current.close(); };
  const blanks = (view.getDay() + 6) % 7;
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  return <section className="mg-period" aria-label="Période affichée">
    <div className="mg-period-top">
      <h1>Vue d’ensemble</h1>
      <div className="mg-period-tabs" role="group" aria-label="Période d’analyse">
        <button aria-pressed={!monthly} onClick={() => onPeriodChange('jour')}>Jour</button>
        <button aria-pressed={monthly} onClick={() => onPeriodChange('mois')}>Mois</button>
      </div>
    </div>
    <div className="mg-date-row">
      <button className="mg-date-label" aria-label={monthly ? 'Choisir un mois' : 'Choisir une date'} aria-haspopup="dialog" onClick={() => { setView(monthStart(date)); dialog.current.showModal(); }}>
        <span><strong>{label}</strong><small>{monthly ? 'Performance du mois' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</small></span><IconChevronDown size={17}/>
      </button>
      <div className="mg-date-arrows">
        <button aria-label={monthly ? 'Mois précédent' : 'Jour précédent'} onClick={() => shift(-1)}><IconChevronLeft size={18}/></button>
        <button aria-label={monthly ? 'Mois suivant' : 'Jour suivant'} disabled={monthly ? +monthStart(date) >= +monthStart(today) : date >= today} onClick={() => shift(1)}><IconChevronRight size={18}/></button>
      </div>
    </div>
    {!current && <button className="mg-today" onClick={() => onChange(monthly ? monthStart(today) : today)}>{monthly ? 'Ce mois-ci' : 'Aujourd’hui'}</button>}
    <dialog ref={dialog} className="mg-date-sheet" aria-labelledby="mg-calendar-title" onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}>
      <div className="mg-sheet-content">
        <div className="mg-sheet-title"><h2 id="mg-calendar-title"><IconCalendar size={18}/>{monthly ? 'Choisir un mois' : 'Choisir une date'}</h2><button aria-label="Fermer le calendrier" onClick={() => dialog.current.close()}><IconClose size={20}/></button></div>
        <div className="mg-calendar-nav"><button aria-label={monthly ? 'Année précédente' : 'Calendrier : mois précédent'} onClick={() => setView(new Date(view.getFullYear() - (monthly ? 1 : 0), view.getMonth() - (monthly ? 0 : 1), 1))}><IconChevronLeft size={18}/></button><strong>{monthly ? view.getFullYear() : monthLabel(view)}</strong><button aria-label={monthly ? 'Année suivante' : 'Calendrier : mois suivant'} disabled={monthly ? view.getFullYear() >= today.getFullYear() : view >= monthStart(today)} onClick={() => setView(new Date(view.getFullYear() + (monthly ? 1 : 0), view.getMonth() + (monthly ? 0 : 1), 1))}><IconChevronRight size={18}/></button></div>
        {monthly ? <div className="mg-month-grid">{Array.from({length:12}, (_, i) => {
          const d = new Date(view.getFullYear(), i, 1);
          return <button key={i} disabled={d > today} aria-pressed={+monthStart(date) === +d} onClick={() => choose(d)}>{d.toLocaleDateString('fr-FR', {month:'short'})}</button>;
        })}</div> : <div className="mg-day-grid">
          {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <span key={d}>{d}</span>)}
          {Array.from({length:blanks}, (_, i) => <span key={`blank-${i}`}/>)}
          {Array.from({length:days}, (_, i) => { const d = new Date(view.getFullYear(), view.getMonth(), i+1); return <button key={i} disabled={d > today} aria-label={d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})} aria-pressed={localKey(d) === localKey(date)} aria-current={localKey(d) === localKey(today) ? 'date' : undefined} onClick={() => choose(d)}>{i+1}</button>; })}
        </div>}
        <button className="mg-calendar-today" onClick={() => choose(monthly ? monthStart(today) : today)}>{monthly ? 'Revenir à ce mois-ci' : 'Revenir à aujourd’hui'}</button>
      </div>
    </dialog>
  </section>;
}
