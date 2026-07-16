import { fp, ft, fd } from './format.js';

export function exportPDF(orders) {
  const today = fd(new Date());
  const tO = orders.filter(o => fd(o.date) === today && o.status !== 'annulee');
  // Midi = avant 15h, Soir = 15h et apres
  const midi = tO.filter(o => new Date(o.date).getHours() < 15);
  const soir = tO.filter(o => new Date(o.date).getHours() >= 15);
  const rev = tO.reduce((s, o) => s + o.total, 0);
  const revM = midi.reduce((s, o) => s + o.total, 0);
  const revS = soir.reduce((s, o) => s + o.total, 0);
  const revEsp = tO.filter(o => (o.payment || '').toLowerCase().startsWith('esp')).reduce((s, o) => s + o.total, 0);
  const revCB = tO.filter(o => o.payment === 'CB').reduce((s, o) => s + o.total, 0);
  const cnt = (arr, pref) => arr.reduce((s, o) => s + o.items.filter(i => (i.pid || '').startsWith(pref)).reduce((a, i) => a + i.qty, 0), 0);
  const rows = arr => arr.map(o => `<tr><td>#${o.num}</td><td>${o.client || '—'}</td><td>${ft(o.date)}</td><td>${o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td><td style="font-weight:700;color:#9B6FE8;">${fp(o.total)}</td></tr>`).join('');
  const statsBlock = arr => `
    <div class="stats">
      <div class="stat"><div class="stat-v">${arr.length}</div><div class="stat-l">Commandes</div></div>
      <div class="stat"><div class="stat-v">${cnt(arr, 'b-')}</div><div class="stat-l">Burgers</div></div>
      <div class="stat"><div class="stat-v">${cnt(arr, 'r-')}</div><div class="stat-l">Riz</div></div>
      <div class="stat"><div class="stat-v">${cnt(arr, 'dr-')}</div><div class="stat-l">Boissons</div></div>
      <div class="stat"><div class="stat-v">${cnt(arr, 'mk-')}</div><div class="stat-l">Milkshakes</div></div>
      <div class="stat"><div class="stat-v">${cnt(arr, 'cr-') + cnt(arr, 'de-')}</div><div class="stat-l">Desserts</div></div>
    </div>`;
  const w = window.open('', '_blank', 'width=750,height=950');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recap ${today}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:sans-serif;padding:28px;max-width:720px;margin:0 auto;color:#1a1028;}
h1{font-size:26px;font-weight:900;color:#5425A8;margin-bottom:4px;}
.sub{font-size:13px;color:#6b7280;margin-bottom:20px;}
h2{font-size:14px;font-weight:800;margin:22px 0 10px;padding:8px 14px;border-radius:8px;color:#fff;}
h2.midi{background:linear-gradient(135deg,#F59E0B,#D97706);}
h2.soir{background:linear-gradient(135deg,#5425A8,#3B1578);}
h2.total{background:linear-gradient(135deg,#10B981,#059669);}
.ca-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;}
.ca{border-radius:12px;padding:16px;text-align:center;color:#fff;}
.ca.all{background:linear-gradient(135deg,#5425A8,#3B1578);}
.ca.midi{background:linear-gradient(135deg,#F59E0B,#D97706);}
.ca.soir{background:linear-gradient(135deg,#7C3AED,#5425A8);}
.ca-v{font-size:28px;font-weight:900;}
.ca-l{font-size:11px;opacity:0.85;margin-bottom:4px;}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.stat{background:#F8F5FF;border-radius:9px;padding:12px;text-align:center;}
.stat-v{font-size:22px;font-weight:900;color:#5425A8;}
.stat-l{font-size:10px;color:#6b7280;font-weight:600;text-transform:uppercase;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin-bottom:8px;}
th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #EEE;font-size:12px;}
th{font-weight:700;background:#F8F5FF;color:#5425A8;}
.tr{font-weight:700;background:#F8F5FF;}
.empty{text-align:center;padding:16px;color:#9CA3AF;font-size:13px;}
@media print{@page{margin:12mm;}}
</style></head><body>
<h1>O'SMASH — Récapitulatif journalier</h1>
<div class="sub">${today} · Généré a ${ft(new Date())}</div>

<div class="ca-row">
  <div class="ca all"><div class="ca-l">Total journée</div><div class="ca-v">${fp(rev)}</div><div class="ca-l">${tO.length} commandes</div></div>
  <div class="ca midi"><div class="ca-l">Service midi (avant 15h)</div><div class="ca-v">${fp(revM)}</div><div class="ca-l">${midi.length} commandes</div></div>
  <div class="ca soir"><div class="ca-l">Service soir (après 15h)</div><div class="ca-v">${fp(revS)}</div><div class="ca-l">${soir.length} commandes</div></div>
</div>

<div class="ca-row" style="grid-template-columns:1fr 1fr;">
  <div class="ca" style="background:linear-gradient(135deg,#10B981,#059669);"><div class="ca-l">Espèces</div><div class="ca-v">${fp(revEsp)}</div></div>
  <div class="ca" style="background:linear-gradient(135deg,#2563EB,#1E40AF);"><div class="ca-l">Carte bancaire</div><div class="ca-v">${fp(revCB)}</div></div>
</div>

<h2 class="midi">Service Midi — avant 15h00</h2>
${midi.length === 0 ? '<div class="empty">Aucune commande ce midi</div>' : statsBlock(midi)}
${midi.length > 0 ? `<table><tr><th>#</th><th>Client</th><th>Heure</th><th>Articles</th><th>Total</th></tr>${rows(midi)}<tr class="tr"><td colspan="4">TOTAL MIDI</td><td style="color:#D97706;">${fp(revM)}</td></tr></table>` : ''}

<h2 class="soir">Service Soir — après 15h00</h2>
${soir.length === 0 ? '<div class="empty">Aucune commande ce soir</div>' : statsBlock(soir)}
${soir.length > 0 ? `<table><tr><th>#</th><th>Client</th><th>Heure</th><th>Articles</th><th>Total</th></tr>${rows(soir)}<tr class="tr"><td colspan="4">TOTAL SOIR</td><td style="color:#5425A8;">${fp(revS)}</td></tr></table>` : ''}

<h2 class="total">Journee complete</h2>
${statsBlock(tO)}
<table><tr><th>#</th><th>Client</th><th>Heure</th><th>Articles</th><th>Total</th></tr>
${rows(tO)}
<tr class="tr"><td colspan="4">TOTAL JOURNEE</td><td style="color:#059669;">${fp(rev)}</td></tr></table>

<script>window.onload=()=>{window.print()}<\/script>
</body></html>`);
  w.document.close();
}
