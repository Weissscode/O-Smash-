const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the real ESC/POS builders without starting Express, Supabase or a socket.
const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
const start = source.indexOf('const SNACK_TEL');
const end = source.indexOf('function imprimer(');
assert.ok(start >= 0 && end > start, 'Print builder boundaries must exist');
const builders = vm.runInNewContext(source.slice(start, end) + '\n({buildCaisse,buildCuisine,buildKiosk});', {Buffer});
const items = [
  {id:'test-burger',pid:'b-orig',name:"O'Smash Original",unit:7.5,qty:1,total:7.5,cust:{supplements:['Supp. Cheddar']}},
  {id:'test-tenders',pid:'si-tend',name:'Tenders x2',unit:4,qty:1,total:4,cust:null},
  {id:'test-canadian',pid:'lo-cana',name:'Canadian Cheddar',unit:8.9,qty:1,total:8.9,cust:{supplements:['Supp. Bacon']}},
  {id:'test-drink',pid:'dr-coca',name:'Coca-Cola 33cl',unit:2,qty:1,total:2,cust:null}
];
const order = {num:99,date:'2026-09-08T12:00:00Z',items,total:22.4,service:'Sur place',payment:null};
test('cashier and kiosk tickets include normal extras and the full total', () => {
  for (const fn of [builders.buildCaisse, builders.buildKiosk]) {
    const ticket = fn(order).toString('latin1');
    for (const name of ['Tenders x2','Canadian Cheddar','Coca-Cola 33cl']) assert.ok(ticket.includes(name), name);
    assert.ok(ticket.includes('22,40E'));
  }
});
test('kitchen receives extras and customizations but excludes the drink', () => {
  const ticket = builders.buildCuisine(order).toString('latin1');
  assert.match(ticket,/TENDERS/i);
  assert.match(ticket,/CANADIAN/i);
  assert.match(ticket,/BACON/i);
  assert.ok(!ticket.includes('Coca-Cola'));
});

test('step-by-step composer lines pass unchanged through the real print builders', async () => {
  const { createBurgerDraft, composerLines } = await import('../src/data/kioskComposer.js');
  const { BURGERS } = await import('../src/data/products.js');
  const draft = {...createBurgerDraft({}, true), sauces:['Biggy'],retraits:['Sans oignon'],
    supplements:['Supp. Cheddar'],twisterSauce:'BBQ',twisterSupps:['Bacon'],
    drink:'Coca-Cola 33cl', extraIds:['si-tend']};
  const items = composerLines(BURGERS.find(p=>p.id==='b-orig'),draft);
  const order = {num:100,date:'2026-09-09T12:00:00Z',items,total:15.5,service:'Sur place',payment:null};
  const kitchen=builders.buildCuisine(order).toString('latin1');
  assert.match(kitchen,/SANS OIGNON/i);
  assert.match(kitchen,/BIGGY/i);
  assert.match(kitchen,/BACON/i);
  assert.match(kitchen,/TENDERS/i);
  assert.ok(!kitchen.includes('Coca-Cola'));
  const cashier=builders.buildCaisse(order).toString('latin1');
  assert.ok(cashier.includes('Coca-Cola'));
  assert.ok(cashier.includes('15,50E'));
});
