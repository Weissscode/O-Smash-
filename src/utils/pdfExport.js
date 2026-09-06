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
  const rows = arr => arr.map(o => `<tr><td>#${o.num}</td><td>${o.client || '-'}</td><td>${ft(o.date)}</td><td>${o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td><td class="num" style="font-weight:600;">${fp(o.total)}</td></tr>`).join('');
  const statsBlock = arr => `
    <div class="stats">
      <div class="stat"><div class="stat-v num">${arr.length}</div><div class="stat-l">Commandes</div></div>
      <div class="stat"><div class="stat-v num">${cnt(arr, 'b-')}</div><div class="stat-l">Burgers</div></div>
      <div class="stat"><div class="stat-v num">${cnt(arr, 'bao-')}</div><div class="stat-l">Bao</div></div>
      <div class="stat"><div class="stat-v num">${cnt(arr, 'r-')}</div><div class="stat-l">Riz</div></div>
      <div class="stat"><div class="stat-v num">${cnt(arr, 'dr-')}</div><div class="stat-l">Boissons</div></div>
      <div class="stat"><div class="stat-v num">${cnt(arr, 'mk-')}</div><div class="stat-l">Milkshakes</div></div>
      <div class="stat"><div class="stat-v num">${cnt(arr, 'cr-') + cnt(arr, 'de-')}</div><div class="stat-l">Desserts</div></div>
    </div>`;
  const w = window.open('', '_blank', 'width=750,height=950');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recap ${today}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Roboto',system-ui,-apple-system,sans-serif;padding:28px;max-width:720px;margin:0 auto;color:#171717;}
.num{font-variant-numeric:tabular-nums;font-weight:500;}
h1{font-size:22px;font-weight:700;color:#1A1815;letter-spacing:-0.01em;margin-bottom:4px;}
.sub{font-size:12px;color:#57534E;margin-bottom:22px;padding-bottom:14px;border-bottom:2px solid #1A1815;}
h2{font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:26px 0 10px;padding-bottom:6px;color:#1A1815;border-bottom:1px solid #DDD8D1;}
h2.midi{border-bottom-color:#A9760B;}
h2.soir{border-bottom-color:#2E4B7A;}
.ca-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;}
.ca{padding:14px 16px;border:1px solid #DDD8D1;border-left:3px solid #23201D;}
.ca.midi{border-left-color:#A9760B;}
.ca.soir{border-left-color:#2E4B7A;}
.ca.esp{border-left-color:#15703F;}
.ca.cb{border-left-color:#1F4E9C;}
.ca-v{font-size:24px;font-weight:600;color:#171717;font-variant-numeric:tabular-nums;}
.ca-l{font-size:10px;color:#57534E;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:4px;}
.ca-l+.ca-v+.ca-l{margin:4px 0 0;text-transform:none;letter-spacing:0;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#EAE6E0;border:1px solid #EAE6E0;margin-bottom:16px;}
.stat{background:#fff;padding:10px 8px;text-align:center;}
.stat-v{font-size:18px;font-weight:600;color:#1A1815;}
.stat-l{font-size:9px;color:#8A837C;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin-bottom:8px;}
th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #EAE6E0;font-size:12px;}
th{font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#57534E;border-bottom:1px solid #DDD8D1;}
td:last-child,th:last-child{text-align:right;}
.tr td{font-weight:700;border-top:1px solid #1A1815;border-bottom:none;}
.empty{padding:14px 0;color:#8A837C;font-size:12px;}
@media print{@page{margin:12mm;}body{padding:0;}}
</style></head><body>
<h1>O'SMASH, récapitulatif journalier</h1>
<div class="sub">${today} · Généré à ${ft(new Date())}</div>

<div class="ca-row">
  <div class="ca all"><div class="ca-l">Total journée</div><div class="ca-v">${fp(rev)}</div><div class="ca-l">${tO.length} commandes</div></div>
  <div class="ca midi"><div class="ca-l">Service midi, avant 15h</div><div class="ca-v">${fp(revM)}</div><div class="ca-l">${midi.length} commandes</div></div>
  <div class="ca soir"><div class="ca-l">Service soir, après 15h</div><div class="ca-v">${fp(revS)}</div><div class="ca-l">${soir.length} commandes</div></div>
</div>

<div class="ca-row" style="grid-template-columns:1fr 1fr;">
  <div class="ca esp"><div class="ca-l">Espèces</div><div class="ca-v">${fp(revEsp)}</div></div>
  <div class="ca cb"><div class="ca-l">Carte bancaire</div><div class="ca-v">${fp(revCB)}</div></div>
</div>

<h2 class="midi">Service midi, avant 15h00</h2>
${midi.length === 0 ? '<div class="empty">Aucune commande ce midi</div>' : statsBlock(midi)}
${midi.length > 0 ? `<table><tr><th>#</th><th>Client</th><th>Heure</th><th>Articles</th><th>Total</th></tr>${rows(midi)}<tr class="tr"><td colspan="4">Total midi</td><td class="num">${fp(revM)}</td></tr></table>` : ''}

<h2 class="soir">Service soir, après 15h00</h2>
${soir.length === 0 ? '<div class="empty">Aucune commande ce soir</div>' : statsBlock(soir)}
${soir.length > 0 ? `<table><tr><th>#</th><th>Client</th><th>Heure</th><th>Articles</th><th>Total</th></tr>${rows(soir)}<tr class="tr"><td colspan="4">Total soir</td><td class="num">${fp(revS)}</td></tr></table>` : ''}

<h2 class="total">Journée complète</h2>
${statsBlock(tO)}
<table><tr><th>#</th><th>Client</th><th>Heure</th><th>Articles</th><th>Total</th></tr>
${rows(tO)}
<tr class="tr"><td colspan="4">Total journée</td><td class="num">${fp(rev)}</td></tr></table>

<script>window.onload=()=>{window.print()}<\/script>
</body></html>`);
  w.document.close();
}
