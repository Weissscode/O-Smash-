require('dotenv').config();
const net = require('net');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: '*' }));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname)));

const CAISSE  = { ip: '192.168.1.37', port: 9100 };
const CUISINE = { ip: '192.168.1.38', port: 9100 };
const HTTP_PORT = 3000;

const SNACK_TEL     = '07 56 88 73 47';
const SNACK_ADDRESS = '14 Rue Victor Hugo, 54400 Longwy';
const GOOGLE_REVIEW_URL = 'https://www.google.com/search?sa=X&sca_esv=cc26d5f28dfddab8&q=o%E2%80%99Smash+Avis&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2MjY2tzQwN7KwsDQyMTMyMTWz2MDI-IqRL_9Rw8zg3MTiDAXHssziRaxoAgCyGKFcPAAAAA&rldimm=2337907288924624568&tbm=lcl&hl=fr-FR&ved=2ahUKEwjC1b_6-piUAxVAdqQEHcPwH-UQ9fQKegQIRBAG&biw=1280&bih=709&dpr=1.5#lkt=LocalPoiReviews';

const DRINK_PREFIXES = ['dr-'];
const MILK_PREFIXES  = ['mk-'];

function isDrink(pid) { return pid && DRINK_PREFIXES.some(p => pid.startsWith(p)); }
function isMilk(pid)  { return pid && MILK_PREFIXES.some(p => pid.startsWith(p)); }
function isRizBoisson(item) { return item.pid === 'r-riz' || (item.cust && item.cust.drink); }

function fp(n) { return n.toFixed(2).replace('.', ',') + 'E'; }
function ft(d) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
function fd(d) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function cmd(arr) { return Buffer.from(arr); }

// ── NORMALISATION ACCENTS ─────────────────────────────────────────────────────
function norm(s) {
  if (!s) return '';
  return s
    .replace(/[àâä]/gi, 'a')
    .replace(/[éèêë]/gi, 'e')
    .replace(/[îï]/gi, 'i')
    .replace(/[ôö]/gi, 'o')
    .replace(/[ùûü]/gi, 'u')
    .replace(/ç/gi, 'c')
    .replace(/ñ/gi, 'n')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae');
}

function txt(s)   { return Buffer.from(norm(s) + '\n', 'latin1'); }

var E = {
  INIT: [0x1B, 0x40],
  CUT:  [0x1D, 0x56, 0x00],
  LF:   [0x0A],
  BON:  [0x1B, 0x45, 0x01],
  BOFF: [0x1B, 0x45, 0x00],
  DBL:  [0x1D, 0x21, 0x11],
  BIG:  [0x1D, 0x21, 0x33],
  XBIG: [0x1D, 0x21, 0x55],
  NRM:  [0x1D, 0x21, 0x00],
  CT:   [0x1B, 0x61, 0x01],
  LT:   [0x1B, 0x61, 0x00],
  RT:   [0x1B, 0x61, 0x02],
};


const LOGO_ESC = Buffer.from('1b61011d7630001900b5000000000000000000000000003fffc00000000000000000000000000000000000000000001fffffff800000000000000000000000000000000000000003fffffffffe000000000000000000000000000000000000003fffffffffffe0000000000000000000000000000000000003fffffffffffffc00000000000000000000000000000000001fffffffffffffff80000000000000000000000000000000007fffffff8ffffffff000000000000000000000000000000003fffff8000001fffffc0000000000000000000000000000000fffff0000000007ffff0000000000000000000000000000003ffff000000000007fffc00000000000000000000000000000ffff0000000000000ffff00000000000000000000000000003fff800000000000001fffc000000000000000000000000000fffe0000000000000003fff000000000000000000000000001fff00000000000000000fffc00000000000000000000000007ffc000002000000000003ffe0000000000000000000000001fff0000000000000400000fff8000000000000000000000003ffc00000000000000000003ffc000000000000000000000007ff000020000000000000000fff00000000000000000000001ffe0000000000000000000003ff80000000000000000000003ff80000000000000000000001ffc0000000000000000000007fe000000000000000000000007ff000000000000000000001ffc000000000000000000000003ff800000000000000000003ff8000000000000000000000000ffc00000000000000000007fe00000000040000001000000007fe0000000000000000000ffc00000000000000000000000003ff0000000000000000001ff800000020000000000000000000ff8000000000000000003fe0000000000000000000000000007fc000000000000000007fc0000000000000000000000000003fe00000000000000000ff8000000000003fffc000000000001ff00000000000000001ff00000000000fffffff00000000000ff80000000000000003fe00000000007fc0000ff00000000007fc0000000000000007fc0000000007e00000007e0000000003fe000000000000000ff8040004001f000000000fc000000001ff000000000000000ff000000000f80000000001f004000000ff800000000000001fe010000003c000000000007c000000007f800000000000003fc00000000f0000000000000f000000003fc00000000000007f800000003c00000000000003c00000001fe0000000000000ff800000007000000000000000f00000000ff0000000000000ff00000001e0000000000000007800004007f8000000000001fe0000000380000000000000001e00000007f8000000000003fc0000000e00000000000000000700000003fc000000000003f80000001c00000000000000000380000001fe000000000007f800008038000000000000000000e0000000fe00000000000ff00000006000000000000000000070000000ff00000000000fe0000001c0000000000000000000380000007f00000000001fe0000003800000000000000000001c0000003fe0000000001fc0000007000000000000000000000e0000003ff8000000003fc000000e00000000000000000000070000007ffc000000003f8000001c0000000000000000000003800000fc1c000000007f000000180000000000000000000001c00000e00e000000007f000000300000000000000000000000e00001c00f00000000fe000000600000000000000000000000600001c01f00000000fe000000e00000000000000000000000300001801f00000001fc000001c00000000000000000000000380003803e00000001fc0000018000000000000000000000001c0003803e00000003f800000ffc00000000000000000000000c0003003e00000003f800007fff0000000000000000000000060007007c00000003f00003fe1fc000000000000000000000070006007e00000007f00007c001e00000000000000000000003000e00fe00000007f0001f0000f00000000000000000000001800e00ff0000000fe0003c0000780000000000000000000001800c00ffc000000fe000780000380000000000000000000000c01c01ffe000000fc000e000003c0000000000000000000000c01c01f0f000001fc001c000003c0000000000000000000007f01803c07800001fc0038000001c000000000000000000003ff83803003800001f80070003003e000000000000000000007f7c3802003c00001f800f000fc03e00000000000000000800f01c7004001c00003f800e003fc03e000000000000000ffc01c01e7000001c00003f800c003fc07c0000000000003fbffe03803e6000003c00003f001c007fc07c000000000001ffffce03803ee000003c00003f001c007fc0fc0000003f0007fff80707003ce000003c00007f0018007dc0f80003c0ffc00f8070070e003cc003003c00007f0018007b81f8001ff3ffe01e00200f8e003fc007807c00007e0ff8007b83f0007fffc0703c00000f9c003fc00f007c00007e3ff8003b8fe3fff07f00707000000f38003f801f00f80000fe3878003fffefffc01e0038e000001f38003f801e00f80000fe7038001fffde07801c0039c000001f70001f003e00f80000fe6018001fff98060018003fc00e003e70001f003e01f00000fe6018000ffe38040000003f801f003ee0801f007c01f00003ffe01c0007f830000000003f003f003ce1801e007c03f0000fffe01c0003c070000003007e007f007dc1801e00fc03f8001f01f01e0001e060000007007e00fe007f83801e00f803fc007c00f83f0000f06001c00f007c00fe00ff87801c00f807fc00f000783f000070e003801f00fc01fe00ff07801c01f807ce01e000307f800038c007801e00f803fc00fe0f801801f0078f03c00010fdc00019c00f803e00f803fc01fc1f801801f0071f0380001ff8e0001dc01f003c01f003fc01fc3f801803f0001f0700701ff870000f801f007c01f007f803f83f801003e0003f0e00f00ff038000f803f007c03f007f803f07f003007e0007e0e01f00fc01c000f803e00f803f007f003e09e003007e000fc1c03f00fd81e000f003e00f803e007e007c100006007e001fc1c03f00ffc1f000f007e00f807e00fc007020000600fe003f83807f00ffc1f000f007c01f007c007c000020000c00ff00ff83807f01fce1f000e00fc01f00780070000060001c00ff83ff8300ff01f0f1b000e00fc03f00f000000000e0003c01f3ffff8700fe01e0f1b000e00f803e004000000003f0007ffff3ffff8700fe01e0f0f000c01f803e000000010007f801ffffe1ffff8601fe03c0f0f001c01f807e00030003001ffc0fffffc0ffbf8e01fc038070f001801f007c00070007803fffffffff80003f8e01fc07807fe003803f007c000f801fc1ff8ffff3f8000c3f8e01f807803fc003803e00fe003fc07fffff07ffc0307ffe3f0e01f80f800e0007007e00fe00fffffffffc01ff0fffffff3f0e01f00f8000000f007e00ff03fffffffff0000ffffff0073f0e01e01f8000001f007c01f7fffe7ffc3fc003ffffe00007ff0e00c03f8000003e00fe1ff3fff83ff80007ffffc0000007ff0e00007fc000007e01ffffe1fff00fc07fffff0000000007ff070000fce00001ff7ff7ffe0ffc0003fffff00000000000fff070001fcf00003fffff3ffc078001ffffe000000000003fffe078003f878001ffbffe1ff00007ffffe000000000003fffffe03c00ff03f00fff3ffc00003fffff8000000000001ffffff7e01f07ff03fffffc0f80007fffff80000000000007ffffffefe01fffff01fffff800001fffff00000000000003fffffffe0fc00fffff807fffe0003fffff00000000000001ffffffff800fc007ffff801fffc03ffffe00000000000000ffffffffc0001fc003ffbf800000fffff8000000000000007ffffffff000001fc0003c1f80007ffff8000000000000001ffffffff03000001fc000001fc07ffff0000000000000000ffffffffc006000001f8000001fc0ffe00000000000000003fffffffe00006000003f8000000fc1e000000000000000007fffffff800000c000003f8000000fe1c0000000000000001fffffff80000000c000007f0000000fe38000000000000007ffffffc0000000018000007f00000007f700000000000001fffffff000000000018000007e00000007ff0000000000003fffffff000000000003000000fe00000003fe00000000000fffffff80000000000007000000fe00000003fc0000000003ffffffe000000000000006000001fc00000003fc000000007ffffff0000000000000000c000001fc00000001f80000000ffffffc00000000000000001c000003fc00000001f0000001ffffff80000000000000000018000003f800000000f000003fffffe000000000000000000030000003f800000000e00007fffffe0000000000000000000060000007f000000001e0007fffffc000000000000000000000c000000ff000000001c00ffffffc0000000000000000000001c000000fe00000000381fffffe0c00000000000000000000038000001fe000000003ffffffc00e00000000000000000000070000001fc000000003fffff80007000000000000000000000e0000003fc000000001ffff000003800000000000000000001c0000007f8000000001fff0000000c0000000000000000000380000007f0000000000fff00000007000000000000000000070000000ff000000000007f800000038000000000000000001c0000001fe000000000003fc0000001c00000000000000000380000001fc000000000003fc0000000f00000000000000000700000003fc000000000001fe0000000380000000000000001c00000007f8000000000000ff00000001e000000000000000380000000ff00000000000007f800000007800000000000000e01000000ff00000000000007f800000081e00000000000003c00000001fe00000000000003fc00000000f8000000000000f000000003fc00000000000001fe000000003e000000000003c000000007f800000000000000ff000000000f80000000001f000000000ff800000000000000ff8000000001f000000000f8000000001ff0000000000000007fc0000000003f00000007e0000000003fe0000000000000003fe00040000007f80003ff00000000007fc0000000000000001ff000000000007ffffff00000000000ff80000000000000000ff8001000000001fffc000000000001ff000000000000000007fc0000000000000000000000000003fe000000000000000003ff0000000000000000000400000007fc000000000000000001ff800000000000000000000000000ff8000000000000000000ffc00000000000000000000000003ff00000000000000000007fe00000000008000000000000007fe00000000000000000003ff8000000000000000000000000ffc00000000000000000000ffc000000000000600000000003ff8000000000000000000007fe000000000000000000000007ff0000000000000000000003ff80000000000000000000001ffc0000000000000000000001ffe0000400000800000000003ff800000000000000000000007ff000008000000000000000fff000000000000000000000003ffc00000000000000000003ffc000000000000000000000000fff0000000000000000000fff80000000000000000000000007ffc000000000004000003ffe00000000000000000000000001fff00000000000000000fffc00000000000000000000000000fffe0000000000000007fff0000000000000000000000000003fffc00000000000001fffc0000000000000000000000000000ffff8000000000000ffff000000000000000000000000000003ffff00000000000ffffc000000000000000000000000000000fffff000000000fffff00000000000000000000000000000003fffff8000001fffffc000000000000000000000000000000007fffffffffffffffe0000000000000000000000000000000000fffffffffffffff800000000000000000000000000000000001fffffffffffffc0000000000000000000000000000000000003fffffffffffc000000000000000000000000000000000000003fffffffffc00000000000000000000000000000000000000000fffffff800000000000000000000000000000000000000000001fffc0000000000000000000000a', 'hex');

// ── QR CODE ESC/POS ──────────────────────────────────────────
function buildQR(url, size) {
  size = size || 4;
  var b = [];
  var data = url;
  var dataLen = data.length + 3;
  var pL = dataLen & 0xFF;
  var pH = (dataLen >> 8) & 0xFF;
  b.push(cmd([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]));
  b.push(cmd([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size]));
  b.push(cmd([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]));
  var storeCmd = [0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30];
  for (var i = 0; i < data.length; i++) storeCmd.push(data.charCodeAt(i));
  b.push(cmd(storeCmd));
  b.push(cmd([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]));
  return b;
}

// ── Nom court pour ticket CUISINE ───────────────────────────
function cuisineNomCourt(item) {
  var name = item.name || '';
  var cust = item.cust || {};
  var ver = '';
  var vSrc = (cust.version || '') + ' ' + (cust.protein || '');
  if (/chicken/i.test(vSrc)) ver = ' CHICKEN';
  else if (/boeuf|beef|steak/i.test(vSrc)) ver = ' STEAK';

  if (/menu.*(etudiant|étudiant)/i.test(name)) {
    var choix = cust.choix || '';
    if (/riz|crousty/i.test(choix) || /riz|crousty/i.test(name)) return 'CROUSTY';
    var burgShort = choix.replace(/O'?\s?Smash\s+/i, '').replace(/Wrap\s+/i, 'Wrap ').trim();
    if (!ver && cust.protein && /chicken/i.test(cust.protein)) ver = ' CHICKEN';
    return 'M ' + (burgShort || 'Menu') + ver;
  }

  // Riz crousty : toujours retourner RIZ CROUSTY (avec ou sans boisson)
  if (item.pid === 'r-riz' || /riz.*(crousty|croustillant)/i.test(name) || /riz.*boisson/i.test(name)) {
    return 'RIZ CROUSTY';
  }
  var inMenu = /\(en menu\)/i.test(name) || (item.cust && item.cust.inMenu);
  var clean = name
    .replace(/O'?\s?Smash\s+/i, '')
    .replace(/\s+\(en menu\)/i, '')
    .replace(/\+\s*boisson/i, '')
    .replace(/\bMenu\b/ig, '')
    .trim();
  if (inMenu) clean = 'M ' + clean;
  if (ver && !clean.toUpperCase().includes('CHICKEN') && !clean.toUpperCase().includes('STEAK')) {
    clean = clean + ver;
  }
  return clean;
}

// ── TICKET CAISSE ────────────────────────────────────────────
function buildCaisse(order) {
  var b = [];
  b.push(cmd(E.INIT));
  b.push(cmd(E.CT));

  b.push(LOGO_ESC);
  b.push(cmd(E.NRM));

  b.push(cmd(E.DBL));  b.push(txt("O'SMASH"));
  b.push(cmd(E.NRM));  b.push(txt('Vous serez toujours les bienvenus chez OSMASH'));
  b.push(txt(SNACK_TEL));
  b.push(txt(SNACK_ADDRESS));

  b.push(cmd(E.BIG));  b.push(txt('#' + order.num));
  b.push(cmd(E.NRM));

  if (order.client) {
    b.push(cmd(E.CT));
    b.push(cmd(E.DBL));
    b.push(txt(order.client.toUpperCase()));
    b.push(cmd(E.NRM));
  }

  if (order.service) {
    b.push(cmd(E.BON));
    b.push(txt(order.service.toUpperCase()));
    b.push(cmd(E.BOFF));
  }

  b.push(txt(fd(order.date) + '  ' + ft(order.date)));
  b.push(cmd(E.LT));   b.push(txt('================================'));

  order.items.forEach(function(item) {
    b.push(cmd(E.BON));
    var line = item.qty + 'x ' + item.name;
    var price = fp(item.total);
    var spaces = Math.max(1, 32 - norm(line).length - price.length);
    b.push(txt(line + ' '.repeat(spaces) + price));
    b.push(cmd(E.BOFF));
    if (item.cust) {
      var c = item.cust;
      if (c.protein)     b.push(txt('  Protein : ' + c.protein));
      if (c.retraits)    c.retraits.forEach(function(r)    { b.push(txt('  - ' + r)); });
      if (c.supplements) c.supplements.forEach(function(s) { b.push(txt('  + ' + s)); });
      if (c.sauces)      c.sauces.forEach(function(s)      { b.push(txt('  Sauce : ' + s)); });
      if (c.sauce)       b.push(txt('  Sauce : ' + c.sauce));
      if (c.version)     b.push(txt('  ' + c.version));
      if (c.type)        b.push(txt('  Type : ' + c.type));
      if (c.choix)       b.push(txt('  Choix : ' + c.choix));
      if (c.chantilly)   b.push(txt('  + Chantilly'));
      if (c.toppings)    c.toppings.forEach(function(t) { b.push(txt('  + ' + t)); });
      if (c.glace)       b.push(txt('  + Glace'));
      if (c.drink)       b.push(txt('  Boisson : ' + c.drink));
      if (c.fritesSauce) b.push(txt('  Twister sauce : ' + c.fritesSauce));
      if (c.fritesSupps) c.fritesSupps.forEach(function(s) { b.push(txt('  Twister + ' + s)); });
      if (c.burgers) c.burgers.forEach(function(bur, i) {
        b.push(txt('  ' + (i+1) + '. ' + bur.name));
        if (bur.cust) {
          var bc = bur.cust;
          if (bc.protein)     b.push(txt('     Protein : ' + bc.protein));
          if (bc.retraits)    bc.retraits.forEach(function(r) { b.push(txt('     - ' + r)); });
          if (bc.supplements) bc.supplements.forEach(function(s) { b.push(txt('     + ' + s)); });
          if (bc.sauces)      bc.sauces.forEach(function(s) { b.push(txt('     Sauce : ' + s)); });
        }
      });
      if (c.note) b.push(txt('  Note : ' + c.note));
    }
    b.push(txt('--------------------------------'));
  });

  b.push(cmd(E.RT));
  b.push(cmd(E.DBL));  b.push(txt('TOTAL ' + fp(order.total)));
  b.push(cmd(E.NRM));

  if (order.payment) {
    b.push(cmd(E.RT));
    b.push(cmd(E.BON));
    b.push(txt('Paiement : ' + order.payment.toUpperCase()));
    b.push(cmd(E.BOFF));
  }

  b.push(cmd(E.CT));
  b.push(cmd(E.BON));
  b.push(txt('Laissez-nous un avis Google !'));
  b.push(cmd(E.BOFF));
  buildQR(GOOGLE_REVIEW_URL, 2).forEach(function(chunk) { b.push(chunk); });

  b.push(cmd(E.CT));   b.push(txt('--- MERCI & BON APPETIT ! ---'));
  b.push(cmd([0x0A])); b.push(cmd([0x0A])); b.push(cmd([0x0A]));
  b.push(cmd([0x0A])); b.push(cmd([0x0A])); b.push(cmd([0x0A]));
  b.push(cmd(E.CUT));
  return Buffer.concat(b);
}

// ── TICKET MILKSHAKE (imprimé en caisse, pour la serveuse) ───
function buildMilkshake(order) {
  var milkItems = order.items.filter(function(i) { return isMilk(i.pid); });
  if (milkItems.length === 0) return null;

  var b = [];
  b.push(cmd(E.INIT));
  b.push(cmd([0x0A])); b.push(cmd([0x0A]));
  b.push(cmd(E.CT));

  b.push(cmd(E.BIG));  b.push(txt('#' + order.num));
  b.push(cmd(E.DBL));  b.push(txt(ft(order.date)));
  b.push(cmd(E.NRM));

  if (order.client) {
    b.push(cmd(E.DBL));
    b.push(txt(order.client.toUpperCase()));
    b.push(cmd(E.NRM));
  }

  b.push(cmd(E.LT));
  b.push(txt('--- MILKSHAKES ---'));
  b.push(txt('================================'));

  milkItems.forEach(function(item) {
    b.push(cmd(E.DBL));
    b.push(cmd(E.BON));
    var price = fp(item.total);
    var cleanName = norm(item.name).toUpperCase();
    var spaces = Math.max(1, 24 - cleanName.length - price.length);
    b.push(txt(item.qty + 'x ' + cleanName + ' '.repeat(spaces) + price));
    b.push(cmd(E.BOFF));
    b.push(cmd(E.NRM));

    if (item.cust) {
      var c = item.cust;
      if (c.type)     { b.push(cmd(E.BON)); b.push(txt('  TYPE : ' + norm(c.type).toUpperCase())); b.push(cmd(E.BOFF)); }
      if (c.chantilly){ b.push(cmd(E.BON)); b.push(txt('  + CHANTILLY')); b.push(cmd(E.BOFF)); }
      if (c.toppings)  c.toppings.forEach(function(t) { b.push(txt('  + ' + norm(t))); });
      if (c.glace)     b.push(txt('  + GLACE'));
      if (c.note)      b.push(txt('  Note : ' + norm(c.note)));
    }
    b.push(txt('--------------------------------'));
  });

  b.push(cmd([0x0A])); b.push(cmd([0x0A])); b.push(cmd([0x0A]));
  b.push(cmd(E.CUT));
  return Buffer.concat(b);
}

// ── TICKET CUISINE ───────────────────────────────────────────
function isRiz(item) {
  if (item.pid === 'r-riz') return true;
  if (/riz/i.test(item.name || '')) return true;
  if (item.cust && /riz|crousty/i.test(item.cust.choix || '')) return true;
  return false;
}

function buildCuisine(order) {
  var b = [];
  b.push(cmd(E.INIT));
  b.push(cmd([0x0A])); b.push(cmd([0x0A])); b.push(cmd([0x0A])); b.push(cmd([0x0A]));

  // Filtrer: boissons, milkshakes, desserts, crepes
  var NO_CUISINE = ['dr-','mk-','de-','cr-'];
  var cuisineItems = order.items.filter(function(i) {
    return !NO_CUISINE.some(function(pfx){ return i.pid && i.pid.startsWith(pfx); });
  });

  if (cuisineItems.length === 0) return null;

  b.push(cmd(E.CT));
  b.push(cmd(E.BIG));  b.push(txt('#' + order.num));
  b.push(cmd(E.DBL));  b.push(txt(ft(order.date)));
  b.push(cmd(E.NRM));

  if (order.client || order.phone) {
    b.push(cmd(E.CT));
    b.push(cmd(E.DBL));
    if (order.client) b.push(txt(order.client.toUpperCase()));
    if (order.phone)  b.push(txt(order.phone.toUpperCase()));
    b.push(cmd(E.NRM));
  }

  b.push(cmd(E.LT)); b.push(txt('================================'));

  var totalCuisine = 0;

  cuisineItems.forEach(function(item) {
    totalCuisine += item.total || 0;
    b.push(cmd(E.DBL));
    b.push(cmd(E.BON));
    var cleanName = cuisineNomCourt(item);
    var price = fp(item.total);
    var nameUp = norm(item.qty + 'x ' + cleanName).toUpperCase();
    // Ligne avec prix aligné à droite (max 20 chars en DBL = ~20 colonnes)
    var padLen = Math.max(1, 20 - nameUp.length - price.length);
    b.push(txt(nameUp + ' '.repeat(padLen) + price));
    b.push(cmd(E.BOFF));
    b.push(cmd(E.NRM));

    if (item.cust) {
      var c = item.cust;
      if (c.retraits && c.retraits.length) {
        b.push(cmd(E.BON));
        c.retraits.forEach(function(r) { b.push(txt('  *** ' + r.toUpperCase() + ' ***')); });
        b.push(cmd(E.BOFF));
      }
      if (c.supplements) c.supplements.forEach(function(sp) { b.push(txt('  + ' + sp)); });
      if (c.sauces)      c.sauces.forEach(function(sa)      { b.push(txt('  Sauce : ' + sa)); });
      if (c.sauce)       { b.push(cmd(E.BON)); b.push(txt('  SAUCE : ' + norm(c.sauce).toUpperCase())); b.push(cmd(E.BOFF)); }

      // TYPE (SPICY / SUCRE) — XBIG centré si riz, normal sinon
      if (c.type) {
        b.push(cmd(E.CT));
        b.push(cmd(E.DBL));
        b.push(cmd(E.BON));
        b.push(txt(norm(c.type).toUpperCase()));
        b.push(cmd(E.BOFF));
        b.push(cmd(E.NRM));
        b.push(cmd(E.LT));
      }

      if (c.fritesSauce) { b.push(cmd(E.BON)); b.push(txt('  TWISTER SAUCE : ' + norm(c.fritesSauce).toUpperCase())); b.push(cmd(E.BOFF)); }
      if (c.fritesSupps && c.fritesSupps.length) {
        b.push(cmd(E.BON));
        b.push(txt('  TWISTER + ' + c.fritesSupps.map(function(x){return norm(x);}).join(' + ')));
        b.push(cmd(E.BOFF));
      }
      // c.drink : JAMAIS affiche en cuisine (boisson incluse dans riz ou menus)
      if (c.burgers) {
        c.burgers.forEach(function(bur, i) {
          var bn = (bur.name || '').replace(/O'?\s?Smash\s+/i, '').replace(/\bMenu\b/ig, 'M').trim();
          var bVer = '';
          if (bur.cust) {
            var bv = (bur.cust.version || '') + ' ' + (bur.cust.protein || '');
            if (/chicken/i.test(bv)) bVer = ' CHICKEN';
            else if (/steak|boeuf|beef/i.test(bv)) bVer = ' STEAK';
          }
          b.push(cmd(E.BON)); b.push(txt('  ' + (i+1) + '. ' + norm(bn).toUpperCase() + bVer)); b.push(cmd(E.BOFF));
          if (bur.cust) {
            var bc = bur.cust;
            if (bc.retraits) { b.push(cmd(E.BON)); bc.retraits.forEach(function(r) { b.push(txt('     *** ' + r.toUpperCase() + ' ***')); }); b.push(cmd(E.BOFF)); }
            if (bc.supplements) bc.supplements.forEach(function(sp) { b.push(txt('     + ' + sp)); });
            if (bc.sauces)      bc.sauces.forEach(function(sa)      { b.push(txt('     Sauce : ' + sa)); });
          }
        });
      }
      if (c.note) { b.push(cmd(E.BON)); b.push(txt('  NOTE : ' + norm(c.note).toUpperCase())); b.push(cmd(E.BOFF)); }
    }
    b.push(txt('--------------------------------'));
  });

  // ── TOTAL ─────────────────────────────────────────────────
  b.push(cmd(E.RT));
  b.push(cmd(E.DBL));
  b.push(cmd(E.BON));
  var totLabel = 'TOTAL';
  var totPrice = fp(totalCuisine);
  var totPad = Math.max(1, 20 - totLabel.length - totPrice.length);
  b.push(txt(totLabel + ' '.repeat(totPad) + totPrice));
  b.push(cmd(E.BOFF));
  b.push(cmd(E.NRM));
  b.push(cmd(E.LT));

  // ── SERVICE ───────────────────────────────────────────────
  if (order.service) {
    b.push(cmd([0x0A]));
    b.push(cmd(E.CT));
    b.push(cmd(E.DBL));
    b.push(cmd(E.BON));
    b.push(txt(order.service.toUpperCase()));
    b.push(cmd(E.BOFF));
    b.push(cmd(E.NRM));
  }

  b.push(cmd([0x0A])); b.push(cmd([0x0A])); b.push(cmd([0x0A]));
  b.push(cmd([0x0A])); b.push(cmd([0x0A]));
  b.push(cmd(E.CUT));
  return Buffer.concat(b);
}

function imprimer(printer, data, timeoutMs) {
  timeoutMs = timeoutMs || 5000;
  return new Promise(function(resolve, reject) {
    var client = new net.Socket();
    var done = false;
    var timeout = setTimeout(function() {
      if (!done) { done = true; client.destroy(); reject(new Error('Timeout ' + printer.ip)); }
    }, timeoutMs);
    client.connect(printer.port, printer.ip, function() {
      client.write(data, function() {
        clearTimeout(timeout); done = true; client.destroy(); resolve();
      });
    });
    client.on('error', function(err) {
      if (!done) { done = true; clearTimeout(timeout); reject(err); }
    });
  });
}

async function imprimerCuisineAvecRetry(data, orderNum) {
  var delays = [0, 1000, 2000];
  for (var i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise(function(r) { setTimeout(r, delays[i]); });
    }
    try {
      var t = new Date().toLocaleTimeString('fr-FR');
      console.log('[CUISINE] ' + t + ' | Tentative ' + (i+1) + '/3 | IP: ' + CUISINE.ip);
      await imprimer(CUISINE, data, 12000);
      console.log('[CUISINE] Tentative ' + (i+1) + ' OK');
      return { ok: true };
    } catch(e) {
      console.error('[CUISINE] Tentative ' + (i+1) + ' ECHEC: ' + e.message);
      if (i === delays.length - 1) {
        return { ok: false, err: e.message };
      }
    }
  }
}


app.get('/status', function(req, res) {
  res.json({ status: 'ok', caisse: CAISSE.ip, cuisine: CUISINE.ip });
});

// ── Logique d'impression partagee (endpoints HTTP + Realtime) ──
async function doPrintFull(order) {
  var results = { caisse: 'ok', cuisine: 'ok', milkshake: 'skip' };

  // 1. Ticket caisse client
  try {
    await imprimer(CAISSE, buildCaisse(order), 8000);
    console.log('[CAISSE] #' + order.num + ' OK');
  } catch(e) { results.caisse = e.message; console.error('[CAISSE] Erreur:', e.message); }

  // 2. Ticket milkshake caisse (si milkshakes)
  var mk = buildMilkshake(order);
  if (mk) {
    try {
      await imprimer(CAISSE, mk, 8000);
      results.milkshake = 'ok';
      console.log('[MILKSHAKE] #' + order.num + ' OK');
    } catch(e) { results.milkshake = e.message; console.error('[MILKSHAKE] Erreur:', e.message); }
  }

  // 3. Ticket cuisine (sans milkshakes, sans boissons)
  var cd = buildCuisine(order);
  if (cd) {
    var r = await imprimerCuisineAvecRetry(cd, order.num);
    if (!r.ok) {
      results.cuisine = r.err;
    } else {
      console.log('[CUISINE] #' + order.num + ' OK');
    }
  } else {
    results.cuisine = 'skip';
    console.log('[CUISINE] #' + order.num + ' SKIP');
  }

  return results;
}

async function doPrintCuisine(order) {
  var results = { cuisine: 'ok', milkshake: 'skip' };

  var mk = buildMilkshake(order);
  if (mk) {
    try {
      await imprimer(CAISSE, mk, 8000);
      results.milkshake = 'ok';
    } catch(e) { results.milkshake = e.message; }
  }

  var cd = buildCuisine(order);
  if (cd) {
    var r = await imprimerCuisineAvecRetry(cd, order.num);
    if (!r.ok) {
      results.cuisine = r.err;
    } else {
      console.log('[CUISINE] TEL #' + order.num + ' OK');
    }
  } else {
    results.cuisine = 'skip';
  }
  return results;
}

async function doPrintCaisse(order) {
  var results = { caisse: 'ok' };
  try {
    await imprimer(CAISSE, buildCaisse(order), 8000);
    console.log('[CAISSE] TEL #' + order.num + ' OK');
  } catch(e) { results.caisse = e.message; console.error('[CAISSE] TEL Erreur:', e.message); }
  return results;
}

// ── /print : commande classique ──────────────────────────────
app.post('/print', async function(req, res) {
  var results = await doPrintFull(req.body);
  res.json({ success: true, results });
});

// ── /print-cuisine : commande telephone recue ────────────────
app.post('/print-cuisine', async function(req, res) {
  var results = await doPrintCuisine(req.body);
  res.json({ success: true, results });
});

// ── /print-caisse : client telephone qui vient payer ────────
app.post('/print-caisse', async function(req, res) {
  var results = await doPrintCaisse(req.body);
  res.json({ success: true, results });
});

app.post('/test', async function(req, res) {
  var order = {
    num: 'TEST', date: new Date().toISOString(), total: 23.5, client: 'Weiss',
    service: 'Sur place', payment: 'CB',
    items: [
      { qty: 1, name: "O'Smash Smoke", total: 8.5, pid: 'b-smoke', cust: { retraits: ['Sans oignon'], sauces: [], version: 'Version Chicken' } },
      { qty: 1, name: 'Frites Twister', total: 3.0, pid: 'si-frit', cust: { sauce: 'Algerienne' } },
      { qty: 1, name: 'Milkshake Oreo', total: 6.0, pid: 'mk-oreo', cust: { type: 'Gros', toppings: ['Chantilly'] } },
      { qty: 1, name: 'Coca-Cola 33cl', total: 2.0, pid: 'dr-coca', cust: null },
    ]
  };
  var results = { caisse: 'ok', cuisine: 'ok', milkshake: 'skip' };
  try { await imprimer(CAISSE, buildCaisse(order), 8000); } catch(e) { results.caisse = e.message; }
  var mk = buildMilkshake(order);
  if (mk) { try { await imprimer(CAISSE, mk, 8000); results.milkshake = 'ok'; } catch(e) { results.milkshake = e.message; } }
  var cd = buildCuisine(order);
  if (cd) { var r = await imprimerCuisineAvecRetry(cd, 'TEST'); if (!r.ok) results.cuisine = r.err; }
  else { results.cuisine = 'skip'; }
  res.json({ success: true, results });
});

app.post('/test-cuisine', async function(req, res) {
  var order = {
    num: 'TEST-C', date: new Date().toISOString(), total: 0, client: 'Test',
    service: 'Sur place',
    items: [{ qty: 1, name: 'TEST CUISINE', total: 0, pid: 'b-test', cust: { retraits: ['Test reimpression'] } }]
  };
  var cd = buildCuisine(order);
  var r = { cuisine: 'skip' };
  if (cd) {
    var res2 = await imprimerCuisineAvecRetry(cd, 'TEST-C');
    r.cuisine = res2.ok ? 'ok' : res2.err;
  }
  res.json({ success: true, results: r });
});

// ── IMPRESSION VIA SUPABASE REALTIME ─────────────────────────────────────────
// L'app (navigateur) ne fait plus d'appel direct a ce serveur pour imprimer :
// elle pose un champ print_request ('full' | 'cuisine' | 'caisse') sur la
// commande dans Supabase. Ce serveur ecoute les changements en temps reel sur
// la table orders de SON restaurant, imprime des qu'il voit une valeur non
// vide, puis la remet a null. Ca marche aussi pour les commandes qui arrivent
// en retard depuis la file d'attente hors-ligne du navigateur.
//
// Valeurs fournies via .env (jamais commitees) - voir .env.example :
//   SUPABASE_URL, SUPABASE_SECRET_KEY (cle secrete, PAS la publishable key),
//   RESTAURANT_ID (id du restaurant, Supabase > Table Editor > restaurants)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const RESTAURANT_ID = process.env.RESTAURANT_ID;

function rowToPrintOrder(row) {
  return {
    num: row.num,
    date: row.cree_le,
    items: row.items || [],
    total: row.total,
    payment: row.payment,
    service: row.service,
    phone: row.phone,
    client: row.client
  };
}

function startRealtimePrinting() {
  var supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

  async function handleIncomingOrderRow(row) {
    if (!row || !row.print_request) return;
    var order = rowToPrintOrder(row);
    var kind = row.print_request;
    console.log('[REALTIME] Commande #' + order.num + ' -> impression ' + kind);
    try {
      if (kind === 'full') await doPrintFull(order);
      else if (kind === 'cuisine') await doPrintCuisine(order);
      else if (kind === 'caisse') await doPrintCaisse(order);
    } catch (e) {
      console.error('[REALTIME] Erreur impression #' + order.num + ':', e.message);
    }
    try {
      await supabaseAdmin.from('orders').update({ print_request: null }).eq('id', row.id);
    } catch (e) {
      console.error('[REALTIME] Erreur remise a zero print_request #' + order.num + ':', e.message);
    }
  }

  supabaseAdmin
    .channel('orders-print')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'orders',
      filter: 'restaurant_id=eq.' + RESTAURANT_ID
    }, function(payload) { handleIncomingOrderRow(payload.new); })
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'orders',
      filter: 'restaurant_id=eq.' + RESTAURANT_ID
    }, function(payload) { handleIncomingOrderRow(payload.new); })
    .subscribe(function(status) {
      console.log('[REALTIME] Statut abonnement impression : ' + status);
    });
}

app.listen(HTTP_PORT, '0.0.0.0', function() {
  console.log('');
  console.log('==========================================');
  console.log("  O'SMASH - Serveur V11");
  console.log('==========================================');
  console.log('  Caisse  : ' + CAISSE.ip + ':' + CAISSE.port);
  console.log('  Cuisine : ' + CUISINE.ip + ':' + CUISINE.port);
  console.log('  HTTP    : http://localhost:' + HTTP_PORT);
  if (SUPABASE_URL && SUPABASE_SECRET_KEY && RESTAURANT_ID) {
    console.log('  Realtime: active (restaurant ' + RESTAURANT_ID + ')');
  } else {
    console.log('  Realtime: DESACTIVE (SUPABASE_URL / SUPABASE_SECRET_KEY / RESTAURANT_ID manquant dans .env)');
  }
  console.log('==========================================');
  console.log('  Pret !');
  console.log('==========================================');

  if (SUPABASE_URL && SUPABASE_SECRET_KEY && RESTAURANT_ID) {
    startRealtimePrinting();
  }
});
