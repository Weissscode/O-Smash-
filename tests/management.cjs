// Real application, isolated Supabase responses. No production credentials or writes.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.MANAGEMENT_ARTIFACTS || path.join(root, 'test-results/management'));
const port = Number(process.env.MANAGEMENT_TEST_PORT || 5100 + Math.floor(Math.random() * 2000));
const origin = `http://127.0.0.1:${port}`;
const now = new Date('2026-09-19T12:00:00+02:00');
const money = n => n.toFixed(2).replace('.', ',') + '\u00a0€';
const date = (d, h = 12, month = 9) => `2026-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:20:00+02:00`;
const order = (id, d, h, total, extra = {}) => ({ id, num:Number(id.replace(/\D/g,'')) || 1, cree_le:date(d,h), total, status:'terminee', payment:'CB', service:'Sur place', items:[{pid:'b-orig',name:'O’Smash Original',qty:1,total}], ...extra });
const one = order('o1',19,12,9.5);
const busy = Array.from({length:80}, (_,i) => {
  const [pid,name,price] = [['b-orig','O’Smash Original',9.5],['b-veggy','O’Smash Veggy',10.5],['r-cr','Riz Crousty',8.5],['si-frites','Frites',3.5]][i%4];
  const qty = i%3+1;
  return order(`o${i+1}`,i<24?19:i<40?18:i%17+1,i%2?19:12,qty*price,{items:[{pid,name,qty,total:qty*price}],payment:i%3?'CB':'Especes',phone:i%4===0?'0600000000':null});
});
busy.push(order('cancel',19,12,999,{status:'annulee'}),order('pending',19,12,888,{status:'en attente'}),order('previous',1,12,30,{cree_le:date(1,12,8)}));
const scenarios = {empty:[],one:[one],busy};
const eligible = rows => rows.filter(o=>!['annulee','en attente'].includes(o.status));
const dayRows = (rows, day=19) => eligible(rows).filter(o=>o.cree_le.startsWith(`2026-09-${day}`));
const total = rows => rows.reduce((s,o)=>s+o.total,0);

async function mock(page, rows) {
  await page.clock.install({time:now});
  const payload = Buffer.from(JSON.stringify({sub:'test-manager',exp:4102444800})).toString('base64url');
  await page.addInitScript(token=>localStorage.setItem('sb-127-auth-token',JSON.stringify({access_token:token,refresh_token:'isolated-test',expires_at:4102444800,expires_in:3600,token_type:'bearer',user:{id:'test-manager',email:'test@example.invalid'}})),`eyJhbGciOiJIUzI1NiJ9.${payload}.isolated`);
  const writes=[];
  await page.route('http://127.0.0.1:59999/**',async r=>{
    const url=new URL(r.request().url());
    if(url.pathname.includes('/profiles')) return r.fulfill({json:{id:'test-manager',role:'gerant',restaurant_id:'management-test',restaurants:{nom:'O’SMASH'}}});
    if(url.pathname.includes('/orders')) {
      if(r.request().method()==='GET') return r.fulfill({json:rows});
      writes.push({method:r.request().method(),data:r.request().postDataJSON()});return r.fulfill({status:204});
    }
    if(url.pathname.includes('/auth/')) return r.fulfill({json:{id:'test-manager',email:'test@example.invalid'}});
    return r.fulfill({json:[]});
  });
  return writes;
}
async function metrics(page, rows) {
  await page.waitForFunction(expected=>document.querySelector('[data-testid="revenue"]')?.textContent===expected,money(total(rows)));
  assert.equal(await page.getByTestId('count').innerText(),String(rows.length));
  assert.equal(await page.getByTestId('average').innerText(),money(rows.length?total(rows)/rows.length:0));
  const payments = await page.locator('.mr-payment-strip strong').allTextContents();
  assert.equal(payments[0],money(total(rows.filter(o=>o.payment==='CB'))));
  assert.equal(payments[1],money(total(rows.filter(o=>(o.payment||'').toLowerCase().startsWith('esp')))));
}
async function noOverflow(page) {
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('main').evaluate(e=>e.scrollWidth>e.clientWidth),false);
  const badges=await page.locator('.mr-service-title small').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),c=e.closest('button').getBoundingClientRect();return r.left>=c.left&&r.right<=c.right-8&&r.top>=c.top+8&&r.top<c.top+24;}));
  assert.deepEqual(badges,[true,true]);
}
async function captureFull(page, name) {
  const viewport=page.viewportSize();
  const contentHeight=await page.locator('main').evaluate(e=>e.scrollHeight+e.getBoundingClientRect().top+90);
  await page.setViewportSize({width:viewport.width,height:Math.ceil(contentHeight)});
  await page.screenshot({path:path.join(out,name),fullPage:true});
  await page.setViewportSize(viewport);
}
async function run() {
 fs.mkdirSync(out,{recursive:true});
 const server=spawn(process.execPath,[path.join(__dirname,'vite-runner.cjs'),String(port)],{cwd:root,env:{...process.env,VITE_SUPABASE_URL:'http://127.0.0.1:59999',VITE_SUPABASE_ANON_KEY:'management-test-only'},stdio:['ignore','pipe','pipe'],windowsHide:true});
 let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
 let browser;
 try {
  for(let i=0;i<300;i++){try{if((await fetch(origin)).ok) break;}catch{} if(i===299)throw Error(logs);await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  const errors=[],results=[];
  for(const width of [375,390,430]) for(const [scenario,rows] of Object.entries(scenarios)) {
    const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/Paris',serviceWorkers:'block'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await mock(page,rows);await page.goto(origin+'/gestion');
    try { await page.getByRole('heading',{name:'Vue d’ensemble'}).waitFor({timeout:10000}); }
    catch (error) {
      await page.screenshot({path:path.join(out,'debug-start.png')});
      console.error('Start page:',await page.locator('body').innerText(),'Errors:',errors,'Server:',logs);
      throw error;
    }
    await page.evaluate(()=>document.fonts.ready);
    await metrics(page,dayRows(rows));await noOverflow(page);
    assert.equal(await page.getByRole('button',{name:'Analytics',exact:true}).count(),0);
    assert.equal(await page.getByRole('button',{name:'Dashboard',exact:true}).count(),0);
    assert.equal(await page.locator('.mg-brand-logo').evaluate(e=>e.naturalWidth>0),true);
    await page.screenshot({path:path.join(out,`management-${width}-${scenario}.png`)});
    if(scenario==='busy'&&width===390) {
      await captureFull(page,'management-jour-complet.png');
      await page.locator('.mr-services').evaluate(e=>e.closest('section').scrollIntoView({block:'start'}));
      await page.screenshot({path:path.join(out,'services-390.png')});
    }
    const serviceTotals=await page.locator('.mr-services > button > strong').allTextContents();
    assert.deepEqual(serviceTotals,[money(total(dayRows(rows).filter(o=>new Date(o.cree_le).getHours()<15))),money(total(dayRows(rows).filter(o=>new Date(o.cree_le).getHours()>=15)))]);
    await page.getByRole('button',{name:'Jour précédent',exact:true}).tap();await metrics(page,dayRows(rows,18));
    const yesterdayServices=await page.locator('.mr-services > button > strong').allTextContents();
    assert.deepEqual(yesterdayServices,[money(total(dayRows(rows,18).filter(o=>new Date(o.cree_le).getHours()<15))),money(total(dayRows(rows,18).filter(o=>new Date(o.cree_le).getHours()>=15)))]);
    await page.reload();await metrics(page,dayRows(rows,18));
    await page.getByRole('button',{name:'Jour suivant',exact:true}).tap();await metrics(page,dayRows(rows));
    await page.getByRole('button',{name:'Choisir une date',exact:true}).tap();
    await page.getByRole('dialog').getByRole('button',{name:'17 septembre 2026',exact:true}).tap();await metrics(page,dayRows(rows,17));
    await page.getByRole('button',{name:'Revenir à aujourd’hui',exact:true}).tap();await metrics(page,dayRows(rows));
    await page.getByRole('button',{name:'Choisir une date',exact:true}).tap();if(scenario==='busy'&&width===390) await page.screenshot({path:path.join(out,'calendrier-390.png')});
    await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(e=>e.open),false);
    await page.getByRole('group',{name:'Période d’analyse'}).getByRole('button',{name:'Mois',exact:true}).tap();
    const monthly=eligible(rows).filter(o=>o.cree_le.startsWith('2026-09'));
    await metrics(page,monthly);await noOverflow(page);
    if(scenario==='busy'&&width===390){await captureFull(page,'management-mois-complet.png');await page.locator('.mr-trend').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'analyses-390.png')});}
    await page.locator('.mg-filter-disclosure summary').tap();await page.getByLabel('Filtrer par catégorie').selectOption('burgers');
    const filtered=monthly.map(o=>({...o,items:o.items.filter(i=>i.pid.startsWith('b-'))})).filter(o=>o.items.length).map(o=>({...o,total:o.items.reduce((s,i)=>s+i.total,0)}));
    await metrics(page,filtered);await page.getByLabel('Filtrer par catégorie').selectOption('');await page.locator('.mg-filter-disclosure summary').tap();
    await page.getByRole('button',{name:'Choisir un mois',exact:true}).tap();await page.getByRole('dialog').getByRole('button',{name:'août',exact:true}).tap();
    await metrics(page,eligible(rows).filter(o=>o.cree_le.startsWith('2026-08')));
    await page.getByRole('group',{name:'Période d’analyse'}).getByRole('button',{name:'Jour',exact:true}).tap();
    assert.match(await page.locator('.mg-date-label').innerText(),/1 août/i);
    await page.getByRole('button',{name:'Revenir à aujourd’hui',exact:true}).tap();await metrics(page,dayRows(rows));
    results.push({width,scenario,sharedDate:true,persistence:true,kpis:true,badgeAlignment:true,overflow:false});await context.close();
  }
  for(const width of [768,1280]) {
    const context=await browser.newContext({viewport:{width,height:900},timezoneId:'Europe/Paris',serviceWorkers:'block'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await mock(page,busy);await page.goto(origin+'/gestion');await metrics(page,dayRows(busy));await noOverflow(page);await page.screenshot({path:path.join(out,`management-${width}.png`)});results.push({width,unified:true,overflow:false});await context.close();
  }
  // POS navigation must lead to the same management page and preserve its date.
  {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/Paris',serviceWorkers:'block'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));const writes=await mock(page,[one]);
    await page.goto(origin);
    await page.locator('.mr-bottom-nav').waitFor();
    const pin=fs.readFileSync(path.join(root,'src/config.js'),'utf8').match(/PIN_CODE\s*=\s*['"]([^'"]+)['"]/)[1];
    const enterManagement=async()=>{await page.locator('.mr-bottom-nav').getByRole('button',{name:'Management',exact:true}).tap();for(const digit of pin)await page.getByRole('button',{name:digit,exact:true}).tap();await page.getByRole('button',{name:'OK',exact:true}).tap();await page.getByRole('heading',{name:'Vue d’ensemble'}).waitFor();};
    assert.deepEqual(await page.locator('.mr-bottom-nav button').allTextContents(),['Caisse','Téléphone','Stock','Management']);
    await enterManagement();await metrics(page,[one]);await noOverflow(page);
    await page.getByRole('button',{name:'Jour précédent',exact:true}).tap();await metrics(page,[]);
    await page.locator('.mr-bottom-nav').getByRole('button',{name:'Caisse',exact:true}).tap();await enterManagement();await metrics(page,[]);
    await page.getByRole('button',{name:'Revenir à aujourd’hui',exact:true}).tap();await metrics(page,[one]);
    await page.screenshot({path:path.join(out,'management-navigation-caisse.png')});
    await page.locator('.mg-orders > summary').tap();await page.locator('.mr-order-row').first().tap();await page.getByRole('button',{name:'Modifier',exact:true}).tap();
    await page.getByPlaceholder('Prénom du client').fill('Test management');await page.getByRole('button',{name:'Enregistrer',exact:true}).tap();await page.getByRole('button',{name:'Modifier',exact:true}).waitFor();
    assert.equal(writes[0].method,'PATCH');assert.equal(writes[0].data.client,'Test management');
    await metrics(page,[one]);page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Supprimer',exact:true}).tap();await metrics(page,[]);assert.equal(writes[1].method,'DELETE');
    results.push({posNavigation:true,dateRestored:true,orderEdit:true,orderDelete:true,api:'mocked'});await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors,artifacts:out}));
 } finally {if(browser) await browser.close();if(server.exitCode===null){const exited=once(server,'exit');server.kill();await exited;}}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
