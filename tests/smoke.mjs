'use strict';
/* Headless-Chrome smoke test for wedding-guest-tracker-bd.
   Raw CDP over a minimal WebSocket client (no npm deps).
   Fails on ANY console/page error. Usage: node tests/smoke.mjs */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '..');
const PAGE_URL = 'file://' + path.join(ROOT, 'index.html');
const CHROME = fs.existsSync('/opt/meta-chromium/chrome') ? '/opt/meta-chromium/chrome' : 'chromium';
const PORT = 9224;

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; failures.push(name); console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

/* ---------- minimal WS client ---------- */
function connectWS(wsUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(wsUrl);
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request({
      host: u.hostname, port: u.port, path: u.pathname + u.search,
      headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13' }
    });
    req.on('upgrade', (res, socket) => {
      let buf = Buffer.alloc(0);
      let curOpcode = null, curPayload = Buffer.alloc(0);
      const listeners = new Map(); // id -> resolver
      const events = [];
      const waiters = [];
      socket.on('data', (chunk) => {
        buf = Buffer.concat([buf, chunk]);
        for (;;) {
          if (buf.length < 2) break;
          const fin = (buf[0] & 0x80) !== 0;
          const opcode = buf[0] & 0x0f;
          let len = buf[1] & 0x7f;
          let off = 2;
          if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
          else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
          const masked = (buf[1] & 0x80) !== 0;
          if (masked) off += 4;
          if (buf.length < off + len) break;
          let payload = buf.subarray(off, off + len);
          buf = buf.subarray(off + len);
          if (opcode === 0x9) { socket.write(buildFrame(Buffer.alloc(0), 0xA)); continue; }
          if (opcode === 0x8) { socket.end(); continue; }
          if (opcode === 0x1 || opcode === 0x0) {
            if (opcode === 0x1) { curOpcode = opcode; curPayload = payload; }
            else curPayload = Buffer.concat([curPayload, payload]);
            if (fin) {
              const msg = JSON.parse(curPayload.toString('utf8'));
              if (msg.id && listeners.has(msg.id)) { listeners.get(msg.id)(msg); listeners.delete(msg.id); }
              else {
                events.push(msg);
                for (let i = waiters.length - 1; i >= 0; i--) {
                  if (waiters[i].pred(msg)) { clearTimeout(waiters[i].timer); waiters.splice(i, 1)[0].resolve(msg); }
                }
              }
            }
          }
        }
      });
      function buildFrame(payload, opcode) {
        const mask = crypto.randomBytes(4);
        const masked = Buffer.alloc(payload.length);
        for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];
        let header;
        if (payload.length < 126) { header = Buffer.from([0x80 | opcode, 0x80 | payload.length]); }
        else if (payload.length < 65536) { header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2); }
        else { header = Buffer.alloc(10); header[0] = 0x80 | opcode; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(payload.length), 2); }
        return Buffer.concat([header, mask, masked]);
      }
      resolve({
        send: (obj) => new Promise((res) => {
          const id = ++connectWS._id;
          listeners.set(id, res);
          socket.write(buildFrame(Buffer.from(JSON.stringify(Object.assign({ id }, obj))), 0x1));
        }),
        waitEvent: (pred, timeoutMs) => new Promise((res, rej) => {
          for (let i = 0; i < events.length; i++) if (pred(events[i])) return res(events.splice(i, 1)[0]);
          const entry = { pred, resolve: res, timer: null };
          entry.timer = setTimeout(() => {
            const ix = waiters.indexOf(entry);
            if (ix !== -1) waiters.splice(ix, 1);
            rej(new Error('timeout waiting for event'));
          }, timeoutMs || 8000);
          waiters.push(entry);
        }),
        close: () => socket.end()
      });
    });
    req.on('error', reject);
    req.end();
  });
}
connectWS._id = 0;

function getJson(p) {
  return new Promise((res, rej) => http.get('http://127.0.0.1:' + PORT + p, (r) => {
    let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d)));
  }).on('error', rej));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-proxy-server',
    '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/wgt-smoke-profile', 'about:blank'],
    { stdio: 'ignore' });
  const errors = [];
  try {
    for (let i = 0; i < 50; i++) { try { await getJson('/json/version'); break; } catch { await sleep(200); } }
    const targets = await getJson('/json/list');
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('no page target');
    const ws = await connectWS(page.webSocketDebuggerUrl);
    await ws.send({ method: 'Runtime.enable' });
    await ws.send({ method: 'Log.enable' });
    await ws.send({ method: 'Page.enable' });
    const loadPromise = ws.waitEvent((m) => m.method === 'Page.loadEventFired', 10000);
    await ws.send({ method: 'Page.navigate', params: { url: PAGE_URL } });
    await loadPromise;
    await sleep(300);

    async function ev(expr) {
      const r = await ws.send({ method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } });
      if (r.result && r.result.exceptionDetails) throw new Error('evaluate threw: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
      return r.result ? r.result.result.value : undefined;
    }
    // collect console/page errors from now on (best-effort via polling is avoided; use events)
    const errPromise = (async () => {
      for (;;) {
        const m = await ws.waitEvent((x) =>
          (x.method === 'Runtime.consoleAPICalled' && x.params && x.params.type === 'error') ||
          (x.method === 'Runtime.exceptionThrown') ||
          (x.method === 'Log.entryAdded' && x.params && x.params.entry && (x.params.entry.level === 'error')),
          60000).catch(() => null);
        if (!m) break;
        errors.push(JSON.stringify(m).slice(0, 400));
      }
    })();
    void errPromise;

    const text = (sel) => ev(`(document.querySelector(${JSON.stringify(sel)})||{}).textContent||''`);
    const exists = (sel) => ev(`!!document.querySelector(${JSON.stringify(sel)})`);

    // 1. empty state
    check('page loads, empty state visible', await ev(`!!document.querySelector('#guestList .empty-state')`));
    check('dashboard total starts at 0', (await text('#statTotal')).trim() === '0');
    check('attendance rate shows dash when no confirmed/attended', (await text('#statRate')).trim() === '—');

    // 2. add guest end-to-end
    await ev(`document.querySelector('#addGuestBtn').click()`);
    await ev(`document.querySelector('#fName').value='Test Guest'`);
    await ev(`document.querySelector('#fSide').value='Groom'`);
    await ev(`document.querySelector('#fRelation').value='Friend'`);
    await ev(`document.querySelector('#fPhone').value='01712345678'`);
    await ev(`document.querySelector('#fPlusOnes').value='1'`);
    await ev(`document.querySelector('#fTable').value='T1'`);
    await ev(`document.querySelector('#fNote').value='test note'`);
    await ev(`document.querySelector('#guestFormEl').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
    await sleep(200);
    check('add guest: total becomes 1', (await text('#statTotal')).trim() === '1');
    check('add guest: card shows name', (await text('.guest-card h3')).includes('Test Guest'));
    check('add guest: Invited headcount is 0', (await text('#statHeadcount')).trim() === '0');

    // 3. RSVP transition Invited -> Confirmed
    check('transition button to Confirmed renders', await exists('button[data-action="transition"][data-to="Confirmed"]'));
    check('illegal transition to Attended does NOT render from Invited', !(await exists('button[data-action="transition"][data-to="Attended"]')));
    await ev(`document.querySelector('button[data-action="transition"][data-to="Confirmed"]').click()`);
    await sleep(150);
    check('RSVP: status becomes Confirmed', (await text('.guest-card .badge')).includes('Confirmed'));
    check('RSVP: headcount becomes 2 (1 + 1 plus-one)', (await text('#statHeadcount')).trim() === '2');
    check('Confirmed -> Attended button renders', await exists('button[data-action="transition"][data-to="Attended"]'));
    check('Confirmed -> Declined button renders', await exists('button[data-action="transition"][data-to="Declined"]'));

    // 4. gift add updates totals
    await ev(`document.querySelector('[data-gift-amount]').value='5000'`);
    await ev(`document.querySelector('[data-gift-type]').value='Cash'`);
    await ev(`document.querySelector('[data-gift-note]').value='envelope'`);
    await ev(`document.querySelector('[data-gift-form]').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
    await sleep(200);
    check('gift add: guest total shows BDT 5,000.00', (await text('.guest-card .gifts h4')).includes('BDT 5,000.00'));
    check('gift add: dashboard total gifts shows BDT 5,000.00', (await text('#statGifts')).includes('BDT 5,000.00'));

    // 5. invalid phone rejected inline
    await ev(`document.querySelector('#addGuestBtn').click()`);
    await ev(`document.querySelector('#fName').value='Bad Phone'`);
    await ev(`document.querySelector('#fPhone').value='123'`);
    await ev(`document.querySelector('#guestFormEl').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
    await sleep(150);
    check('invalid phone: inline error shown', await ev(`document.querySelector('#formError').style.display==='block' && document.querySelector('#formError').textContent.length>0`));
    check('invalid phone: guest NOT added (total still 1)', (await text('#statTotal')).trim() === '1');
    await ev(`document.querySelector('#cancelFormBtn').click()`);

    // 6. search filters
    await ev(`{const i=document.querySelector('#searchInput'); i.value='zzz'; i.dispatchEvent(new Event('input',{bubbles:true}));}`);
    await sleep(150);
    check('search: non-matching query hides guests', !(await exists('.guest-card')));
    await ev(`{const i=document.querySelector('#searchInput'); i.value=''; i.dispatchEvent(new Event('input',{bubbles:true}));}`);
    await sleep(150);
    check('search: clearing query restores guest', await exists('.guest-card'));

    // 7. BN toggle renders Bengali digits + persists after reload
    await ev(`document.querySelector('#langToggle').click()`);
    await sleep(200);
    check('BN toggle: total shows Bengali digit 1', (await text('#statTotal')).trim() === '১');
    check('BN toggle: lang persisted in localStorage', await ev(`localStorage.getItem('wgt.lang.v1')==='bn'`));
    const reloadPromise = ws.waitEvent((m) => m.method === 'Page.loadEventFired', 10000);
    await ws.send({ method: 'Page.reload' });
    await reloadPromise;
    await sleep(400);
    check('BN toggle: lang persists after reload', await ev(`localStorage.getItem('wgt.lang.v1')==='bn'`));
    check('BN toggle: Bengali digits still rendered after reload', (await text('#statTotal')).trim() === '১');
    // back to EN for the remaining steps
    await ev(`document.querySelector('#langToggle').click()`);
    await sleep(200);

    // 8. export -> wipe -> import round-trip
    const backup = await ev(`localStorage.getItem('wgt.guests.v1')`);
    check('export payload exists in localStorage', typeof backup === 'string' && backup.includes('Test Guest'));
    await ev(`document.querySelector('#clearAllBtn').click()`);
    await ev(`{const i=document.querySelector('#clearInput'); i.value='DELETE'; i.dispatchEvent(new Event('input',{bubbles:true}));}`);
    await ev(`document.querySelector('#confirmClearBtn').click()`);
    await sleep(200);
    check('typed-DELETE clears all guests', (await text('#statTotal')).trim() === '0');
    await ev(`{const f=new File([${JSON.stringify(backup)}],'backup.json',{type:'application/json'}); const dt=new DataTransfer(); dt.items.add(f); const inp=document.querySelector('#importFile'); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true}));}`);
    await sleep(400);
    check('import round-trip restores guest', (await text('#statTotal')).trim() === '1');
    check('import round-trip restores gift total', (await text('#statGifts')).includes('BDT 5,000.00'));

    // 9. malformed import rejected, data intact
    await ev(`{const f=new File(['{"app":"wrong","version":1,"guests":[]}'],'bad.json',{type:'application/json'}); const dt=new DataTransfer(); dt.items.add(f); const inp=document.querySelector('#importFile'); inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true}));}`);
    await sleep(300);
    check('malformed import: inline error shown', await ev(`document.querySelector('#importError').style.display==='block'`));
    check('malformed import: existing data intact', (await text('#statTotal')).trim() === '1');

    // 10. typed-DELETE requires exact DELETE
    await ev(`document.querySelector('#clearAllBtn').click()`);
    await ev(`{const i=document.querySelector('#clearInput'); i.value='delete'; i.dispatchEvent(new Event('input',{bubbles:true}));}`);
    check('clear: lowercase delete keeps confirm disabled', await ev(`document.querySelector('#confirmClearBtn').disabled===true`));
    await ev(`{const i=document.querySelector('#clearInput'); i.value='DELETE'; i.dispatchEvent(new Event('input',{bubbles:true}));}`);
    await ev(`document.querySelector('#confirmClearBtn').click()`);
    await sleep(200);
    check('clear: exact DELETE wipes all', (await text('#statTotal')).trim() === '0');

    // 11. 390px viewport: no horizontal overflow
    await ws.send({ method: 'Emulation.setDeviceMetricsOverride', params: { width: 390, height: 700, deviceScaleFactor: 1, mobile: true } });
    await sleep(300);
    const sw = await ev(`Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)`);
    check('390px: no horizontal overflow (scrollWidth<=390)', sw <= 390, 'scrollWidth=' + sw);
    await ws.send({ method: 'Emulation.clearDeviceMetricsOverride' });

    // 12. zero console/page errors
    await sleep(300);
    check('ZERO console/page errors', errors.length === 0, errors.join(' | ').slice(0, 500));

    ws.close();
  } finally {
    chrome.kill();
  }
  console.log('\nSMOKE: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) { console.log('Failures: ' + failures.join(', ')); process.exit(1); }
}

main().catch((e) => { console.error('SMOKE ERROR:', e); process.exit(1); });
