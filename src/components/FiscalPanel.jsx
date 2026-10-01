import React from 'react';
import { T } from '../data/theme.js';
import {
  fiscalStatus, setEnvironment, activateFiscalFr, closeDay, closePeriod,
  verifyChain, archivePeriod, fetchClosings
} from '../utils/fiscalApi.js';

const box = { background: T.bgCard, border: `1px solid ${T.brd}`, borderRadius: 6, padding: 16, marginBottom: 12 };
const btnStyle = (danger) => ({
  padding: '10px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
  background: danger ? T.no : T.primary, color: T.white, marginRight: 8, marginTop: 8
});
const eur = n => Number(n || 0).toFixed(2).replace('.', ',') + ' €';

function download(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Onglet « Fiscalité » du Management (gérant). Les actions appellent les RPC
// SECURITY DEFINER : PostgreSQL décide, jamais React.
export function FiscalPanel({ restaurantId, onEnvironmentChanged }) {
  const [status, setStatus] = React.useState(null);
  const [closings, setClosings] = React.useState([]);
  const [msg, setMsg] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    try {
      setStatus(await fiscalStatus());
      setClosings(await fetchClosings(restaurantId));
    } catch (e) {
      setMsg({ err: true, text: e.message });
    }
  }, [restaurantId]);
  React.useEffect(() => { reload(); }, [reload]);

  const run = async (fn, okText, reloadApp) => {
    setBusy(true); setMsg(null);
    try {
      const r = await fn();
      setMsg({ text: typeof okText === 'function' ? okText(r) : okText });
      await reload();
      if (reloadApp && onEnvironmentChanged) onEnvironmentChanged();
    } catch (e) {
      setMsg({ err: true, text: e.message });
    } finally { setBusy(false); }
  };

  if (!status) return <div style={{ padding: 40, textAlign: 'center', color: T.txtSub }}>{msg ? msg.text : 'Chargement…'}</div>;

  const isTest = status.environment === 'test';
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return <div style={{ padding: 20, overflow: 'auto', flex: 1 }}>
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 16 }}>Environnement : {isTest ? 'TEST' : 'PRODUCTION'}</div>
      <div style={{ color: T.txtSub, fontSize: 13, marginTop: 4 }}>
        Profil fiscal : <b>{status.fiscal_profile}</b>{status.fiscal_active ? ' (moteur fiscal actif, irréversible)' : ' (fiscalité OFF)'}
      </div>
      {isTest && <button disabled={busy} style={btnStyle(true)} onClick={() => {
        if (window.confirm('Passer en PRODUCTION ? Les prochaines commandes seront de vraies ventes (table orders).'))
          run(() => setEnvironment('production'), 'Environnement : PRODUCTION', true);
      }}>Passer en PRODUCTION</button>}
      {!isTest && !status.fiscal_active && <>
        <button disabled={busy} style={btnStyle(false)} onClick={() => run(() => setEnvironment('test'), 'Environnement : TEST', true)}>Repasser en TEST</button>
        <button disabled={busy} style={btnStyle(true)} onClick={() => {
          const c = window.prompt('Activer le profil fiscal FR ? Action IRRÉVERSIBLE : le ledger fiscal démarre et les ventes seront verrouillées.\n\nTapez ACTIVER pour confirmer.');
          if (c) run(() => activateFiscalFr(c), 'Profil fiscal FR activé', true);
        }}>Activer le profil fiscal FR</button>
      </>}
    </div>

    {status.fiscal_active && <>
      <div style={box}>
        <div style={{ fontWeight: 800 }}>Ledger fiscal</div>
        <div style={{ color: T.txtSub, fontSize: 13, marginTop: 4 }}>
          {status.ledger_entries} écritures · {status.unclosed_entries} depuis la dernière clôture
          {status.last_daily_closing ? ` · dernière clôture : ${status.last_daily_closing.period_start}` : ' · aucune clôture'}
        </div>
        <button disabled={busy} style={btnStyle(false)} onClick={() => {
          if (window.confirm("Clôturer la journée (ticket Z) ? Cette opération est définitive."))
            run(() => closeDay(), c => `Clôture Z n°${c.closing_number} : ${eur(c.total_ttc)}`);
        }}>Clôturer la journée</button>
        <button disabled={busy} style={btnStyle(false)} onClick={() => run(() => closePeriod('monthly', prevMonth.getFullYear(), prevMonth.getMonth() + 1), c => `Clôture mensuelle : ${eur(c.total_ttc)}`)}>Clôturer le mois précédent</button>
        <button disabled={busy} style={btnStyle(false)} onClick={() => run(verifyChain, r => r.ok ? `Chaîne intègre (${r.entries} écritures)` : `ALTÉRATION détectée : ${r.error} (seq ${r.seq || '?'})`)}>Vérifier l'intégrité</button>
        <button disabled={busy} style={btnStyle(false)} onClick={() => {
          const start = window.prompt('Archiver du (AAAA-MM-JJ) :', `${now.getFullYear()}-01-01`);
          const end = start && window.prompt('au (AAAA-MM-JJ) :', now.toISOString().slice(0, 10));
          if (start && end) run(async () => {
            const r = await archivePeriod(start, end);
            download(`vice-archive-fiscale-${start}_${end}.json`, r);
            return r;
          }, r => `Archive créée (${r.archive.entry_count} écritures, empreinte ${r.archive.content_hash.slice(0, 12)}…)`);
        }}>Archiver / exporter</button>
      </div>
      <div style={box}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Clôtures</div>
        {closings.length === 0 && <div style={{ color: T.txtSub, fontSize: 13 }}>Aucune clôture.</div>}
        {closings.map(c => <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: `1px solid ${T.brdL}` }}>
          <span>{c.kind} n°{c.closing_number} · {c.period_start}{c.period_end !== c.period_start ? ` → ${c.period_end}` : ''}</span>
          <span>{eur(c.total_ttc)} (TVA {eur(c.total_tva)}) · GT {eur(c.grand_total_ttc)}</span>
        </div>)}
      </div>
    </>}

    {msg && <div role="status" style={{ ...box, borderColor: msg.err ? T.no : T.ok, color: msg.err ? T.no : T.ok, fontWeight: 600 }}>{msg.text}</div>}
    <div style={{ fontSize: 11, color: T.txtMuted }}>Base technique non certifiée : TVA, clôtures et archivage restent à valider réglementairement.</div>
  </div>;
}
