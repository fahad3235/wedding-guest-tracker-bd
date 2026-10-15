'use strict';
/* Unit tests for wedding-guest-tracker-bd logic (node:test, no DOM). */
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

function guest(over) {
  return Object.assign({ id: 'g1', name: 'A', side: 'Bride', relation: 'Family', phone: '', plusOnes: 0, table: '', note: '', status: 'Invited', gifts: [], createdAt: 1 }, over);
}

test('RSVP transition legality matrix', () => {
  const legal = {
    'Invited': ['Confirmed', 'Declined', 'No Response'],
    'Confirmed': ['Attended', 'Declined'],
    'Attended': ['Confirmed'],
    'Declined': ['Invited'],
    'No Response': ['Invited', 'Confirmed', 'Declined']
  };
  for (const from of L.STATUSES) {
    for (const to of L.STATUSES) {
      assert.equal(L.canTransition(from, to), legal[from].includes(to), from + ' -> ' + to);
    }
    assert.deepEqual(L.legalTransitions(from).sort(), legal[from].sort());
  }
  assert.equal(L.canTransition('Invited', 'Attended'), false, 'Invited must NOT jump straight to Attended');
  assert.equal(L.canTransition('Attended', 'Declined'), false, 'Attended must NOT jump to Declined');
  assert.equal(L.canTransition('Declined', 'Attended'), false, 'Declined must NOT jump to Attended');
  assert.equal(L.canTransition('Bogus', 'Invited'), false);
});

test('hand-verified example: headcount, gift total, attendance rate', () => {
  // A Confirmed +1 plus-one, B Attended +0, C Declined +2
  const guests = [
    guest({ id: 'a', name: 'A', status: 'Confirmed', plusOnes: 1 }),
    guest({ id: 'b', name: 'B', status: 'Attended', plusOnes: 0 }),
    guest({ id: 'c', name: 'C', status: 'Declined', plusOnes: 2 })
  ];
  // headcount = (1+1) + (1+0) = 3 ; Declined contributes 0
  assert.equal(L.expectedHeadcount(guests), 3);
  // gifts: 5000 + 2500.50 = 7500.50 -> 750050 paisa
  const withGifts = [
    guest({ id: 'a', gifts: [{ id: 'x1', amountPaisa: L.toPaisa(5000), type: 'Cash', note: '', createdAt: 1 }] }),
    guest({ id: 'b', gifts: [{ id: 'x2', amountPaisa: L.toPaisa(2500.50), type: 'Envelope', note: '', createdAt: 1 }] })
  ];
  assert.equal(L.totalGiftPais(withGifts), 750050);
  assert.equal(L.formatMoney(750050, false), 'BDT 7,500.50');
  // attendance rate = attended / (confirmed + attended) = 1/2 = 50%
  assert.equal(L.attendanceRate(guests), 0.5);
  // empty denominator -> null
  assert.equal(L.attendanceRate([guest({ status: 'Invited' })]), null);
  assert.equal(L.attendanceRate([]), null);
});

test('integer-paisa money has no float error', () => {
  assert.equal(L.toPaisa(0.1) + L.toPaisa(0.2), L.toPaisa(0.3));
  assert.equal(L.toPaisa(2500.50), 250050);
  assert.equal(L.toPaisa(19.99), 1999);
  assert.equal(L.fromPaisa(750050), 7500.5);
  assert.equal(L.formatMoney(0, false), 'BDT 0.00');
  assert.equal(L.formatMoney(1000000, false), 'BDT 10,000.00');
});

test('gift add/delete totals', () => {
  const g = guest({ gifts: [] });
  g.gifts.push(L.createGift({ amountBDT: 1000, type: 'Cash', note: '' }, 100));
  g.gifts.push(L.createGift({ amountBDT: 500.25, type: 'Envelope', note: '' }, 101));
  assert.equal(L.guestGiftTotalPais(g), 150025);
  const removed = g.gifts[0].id;
  g.gifts = g.gifts.filter((x) => x.id !== removed);
  assert.equal(L.guestGiftTotalPais(g), 50025);
  assert.deepEqual(L.validateGiftInput({ amountBDT: 0, type: 'Cash' }), ['amountInvalid']);
  assert.deepEqual(L.validateGiftInput({ amountBDT: -5, type: 'Cash' }), ['amountInvalid']);
  assert.deepEqual(L.validateGiftInput({ amountBDT: NaN, type: 'Cash' }), ['amountInvalid']);
  assert.deepEqual(L.validateGiftInput({ amountBDT: 10, type: 'Gold' }), ['giftTypeInvalid']);
  assert.deepEqual(L.validateGiftInput({ amountBDT: 10, type: 'Cash' }), []);
});

test('phone validation (BD mobile)', () => {
  assert.equal(L.isValidPhone(''), true);
  assert.equal(L.isValidPhone('01712345678'), true);
  assert.equal(L.isValidPhone('01999999999'), true);
  assert.equal(L.isValidPhone('0171234567'), false, '10 digits');
  assert.equal(L.isValidPhone('017123456789'), false, '12 digits');
  assert.equal(L.isValidPhone('02712345678'), false, 'must start 01');
  assert.equal(L.isValidPhone('01712 345678'), false, 'space');
  assert.equal(L.isValidPhone('01712-345678'), false, 'dash');
  assert.equal(L.isValidPhone('01712a34567'), false, 'letter');
  assert.equal(L.isValidPhone(1712345678), false, 'number type');
});

test('plus-ones and guest validation', () => {
  const base = { name: 'Mina', side: 'Groom', relation: 'Friend', phone: '', plusOnes: 0, table: '', note: '' };
  assert.deepEqual(L.validateGuestInput(base), []);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { plusOnes: -1 })), ['plusOnesInvalid']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { plusOnes: 1.5 })), ['plusOnesInvalid']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { plusOnes: '2' })), ['plusOnesInvalid']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { name: '   ' })), ['nameRequired']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { name: '' })), ['nameRequired']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { phone: '123' })), ['phoneInvalid']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { side: 'Other' })), ['sideInvalid']);
  assert.deepEqual(L.validateGuestInput(Object.assign({}, base, { relation: 'Enemy' })), ['relationInvalid']);
});

test('import validation: 17 malformed payloads rejected, valid accepted', () => {
  const valid = { app: 'wedding-guest-tracker-bd', version: 1, exportedAt: 1, guests: [guest({ gifts: [{ id: 'gf1', amountPaisa: 50000, type: 'Cash', note: '', createdAt: 1 }] })] };
  assert.deepEqual(L.validateImportData(valid), []);
  const cases = [];
  cases.push(null);
  cases.push([]);
  cases.push('nope');
  cases.push(Object.assign({}, valid, { app: 'other-app' }));
  cases.push(Object.assign({}, valid, { version: 2 }));
  cases.push(Object.assign({}, valid, { guests: 'not-array' }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { name: '' })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { side: 'Cousin' })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { status: 'Maybe' })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { plusOnes: -1 })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { phone: '123' })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { gifts: [{ id: 'gf1', amountPaisa: -100, type: 'Cash', note: '', createdAt: 1 }] })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { gifts: [{ id: 'gf1', amountPaisa: 0, type: 'Cash', note: '', createdAt: 1 }] })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { gifts: [{ id: 'gf1', amountPaisa: 10.5, type: 'Cash', note: '', createdAt: 1 }] })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { gifts: [{ id: 'gf1', amountPaisa: 100, type: 'Gold', note: '', createdAt: 1 }] })] }));
  cases.push(Object.assign({}, valid, { guests: [guest({ id: 'dup' }), guest({ id: 'dup' })] }));
  cases.push(Object.assign({}, valid, { guests: [Object.assign({}, guest(), { gifts: 'x' })] }));
  assert.equal(cases.length, 17, 'malformed case count');
  for (const c of cases) {
    assert.ok(L.validateImportData(c).length > 0, 'should reject: ' + JSON.stringify(c).slice(0, 80));
  }
  // valid data is untouched by validation (no mutation)
  const snapshot = JSON.stringify(valid);
  L.validateImportData(valid);
  assert.equal(JSON.stringify(valid), snapshot);
});

test('search is Bangla-safe, filters and sort work', () => {
  const guests = [
    guest({ id: '1', name: 'Rahim', phone: '01711111111', note: 'cousin', side: 'Bride', status: 'Invited', relation: 'Family', createdAt: 3 }),
    guest({ id: '2', name: 'Karim', phone: '01822222222', note: '', side: 'Groom', status: 'Confirmed', relation: 'Friend', createdAt: 2 }),
    guest({ id: '3', name: 'Mina', phone: '', note: 'office', side: 'Joint', status: 'Attended', relation: 'Colleague', createdAt: 1 })
  ];
  assert.deepEqual(L.filterGuests(guests, { query: 'rahim' }).map((g) => g.id), ['1']);
  // Bengali digits in query match ASCII phone digits
  assert.deepEqual(L.filterGuests(guests, { query: '\u09e6\u09e7\u09ed\u09e7\u09e7\u09e7\u09e7\u09e7\u09e7\u09e7\u09e7' }).map((g) => g.id), ['1']);
  assert.deepEqual(L.filterGuests(guests, { query: 'office' }).map((g) => g.id), ['3']);
  assert.deepEqual(L.filterGuests(guests, { side: 'Groom' }).map((g) => g.id), ['2']);
  assert.deepEqual(L.filterGuests(guests, { status: 'Confirmed' }).map((g) => g.id), ['2']);
  assert.deepEqual(L.filterGuests(guests, { relation: 'Family' }).map((g) => g.id), ['1']);
  assert.deepEqual(L.filterGuests(guests, { sort: 'name' }).map((g) => g.name), ['Karim', 'Mina', 'Rahim']);
  assert.deepEqual(L.filterGuests(guests, { sort: 'recent' }).map((g) => g.id), ['1', '2', '3']);
});

test('dashboard stats', () => {
  const guests = [
    guest({ side: 'Bride', status: 'Confirmed', plusOnes: 1 }),
    guest({ side: 'Groom', status: 'Attended', plusOnes: 0 }),
    guest({ side: 'Joint', status: 'Declined', plusOnes: 0 }),
    guest({ side: 'Bride', status: 'No Response', plusOnes: 0 })
  ];
  const s = L.dashboardStats(guests);
  assert.equal(s.total, 4);
  assert.equal(s.headcount, 3);
  assert.equal(s.bySide['Bride'], 2);
  assert.equal(s.byStatus['No Response'], 1);
  assert.equal(s.attendanceRate, 0.5);
});

test('Bengali digits and money formatting', () => {
  assert.equal(L.toBengaliDigits('0123456789'), '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef');
  assert.equal(L.toAsciiDigits('\u09e6\u09e7\u09e8'), '012');
  assert.equal(L.formatMoney(750050, true), '\u09ed,\u09eb\u09e6\u09e6.\u09eb\u09e6 \u099f\u09be\u0995\u09be');
  assert.equal(L.formatMoney(750050, false), 'BDT 7,500.50');
});

test('export shape round-trips through import validation', () => {
  const exported = L.serializeExport([guest({ gifts: [] })], 123);
  assert.equal(exported.app, 'wedding-guest-tracker-bd');
  assert.equal(exported.version, 1);
  assert.deepEqual(L.validateImportData(JSON.parse(JSON.stringify(exported))), []);
});
