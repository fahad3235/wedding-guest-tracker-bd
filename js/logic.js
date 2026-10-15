'use strict';
/* wedding-guest-tracker-bd \u2014 pure logic, no DOM. UMD: works in node and browser. */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.WeddingGuestLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var SIDES = ['Bride', 'Groom', 'Joint'];
  var RELATIONS = ['Family', 'Friend', 'Colleague', 'Neighbour', 'Other'];
  var STATUSES = ['Invited', 'Confirmed', 'Attended', 'Declined', 'No Response'];
  var GIFT_TYPES = ['Cash', 'Envelope', 'Gift item'];

  /* Legal RSVP transitions. No Response can return to Invited or resolve. */
  var TRANSITIONS = {
    'Invited': ['Confirmed', 'Declined', 'No Response'],
    'Confirmed': ['Attended', 'Declined'],
    'Attended': ['Confirmed'],
    'Declined': ['Invited'],
    'No Response': ['Invited', 'Confirmed', 'Declined']
  };

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];

  function isInt(n) { return typeof n === 'number' && isFinite(n) && Math.floor(n) === n; }
  function isNonEmptyString(s) { return typeof s === 'string' && s.trim().length > 0; }

  /* BD mobile: exactly 11 digits, starts with 01. Empty = not provided = valid. */
  function isValidPhone(phone) {
    if (phone === '' || phone === null || phone === undefined) return true;
    if (typeof phone !== 'string') return false;
    return /^01\d{9}$/.test(phone.trim());
  }

  function validateGuestInput(g) {
    var errors = [];
    if (!g || typeof g !== 'object') return ['guestInvalid'];
    if (!isNonEmptyString(g.name)) errors.push('nameRequired');
    if (SIDES.indexOf(g.side) === -1) errors.push('sideInvalid');
    if (RELATIONS.indexOf(g.relation) === -1) errors.push('relationInvalid');
    if (!isValidPhone(g.phone || '')) errors.push('phoneInvalid');
    if (!isInt(g.plusOnes) || g.plusOnes < 0) errors.push('plusOnesInvalid');
    if (g.table !== undefined && typeof g.table !== 'string') errors.push('tableInvalid');
    if (g.note !== undefined && typeof g.note !== 'string') errors.push('noteInvalid');
    return errors;
  }

  function canTransition(from, to) {
    if (TRANSITIONS[from] === undefined) return false;
    return TRANSITIONS[from].indexOf(to) !== -1;
  }

  function legalTransitions(status) {
    return TRANSITIONS[status] ? TRANSITIONS[status].slice() : [];
  }

  /* ---- Money: integer paisa everywhere, no float error ---- */
  function toPaisa(amountBDT) {
    if (typeof amountBDT !== 'number' || !isFinite(amountBDT)) return null;
    return Math.round(amountBDT * 100);
  }
  function fromPaisa(paisa) { return paisa / 100; }

  function groupThousands(intStr) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* Format integer paisa as "BDT 7,500.50" (EN) or Bengali digits + taka (BN). */
  function formatMoney(paisa, useBengaliDigits) {
    if (!isInt(paisa)) return '';
    var sign = paisa < 0 ? '-' : '';
    var abs = Math.abs(paisa);
    var whole = Math.floor(abs / 100);
    var frac = abs % 100;
    var str = sign + groupThousands(String(whole)) + '.' + (frac < 10 ? '0' + frac : String(frac));
    if (useBengaliDigits) return toBengaliDigits(str) + ' \u099f\u09be\u0995\u09be';
    return 'BDT ' + str;
  }

  function toBengaliDigits(input) {
    return String(input).replace(/[0-9]/g, function (d) { return BN_DIGITS[Number(d)]; });
  }
  function toAsciiDigits(input) {
    var out = String(input);
    for (var i = 0; i < 10; i++) out = out.split(BN_DIGITS[i]).join(String(i));
    return out;
  }

  /* ---- Guests ---- */
  function createGuest(data, nowMs) {
    return {
      id: data.id || ('g' + nowMs + '-' + Math.floor(nowMs % 100000)),
      name: (data.name || '').trim(),
      side: data.side || 'Joint',
      relation: data.relation || 'Other',
      phone: (data.phone || '').trim(),
      plusOnes: isInt(data.plusOnes) ? data.plusOnes : 0,
      table: data.table || '',
      note: data.note || '',
      status: data.status || 'Invited',
      gifts: Array.isArray(data.gifts) ? data.gifts : [],
      createdAt: isInt(data.createdAt) ? data.createdAt : nowMs
    };
  }

  function validateGiftInput(gift) {
    var errors = [];
    if (!gift || typeof gift !== 'object') return ['giftInvalid'];
    var paisa = toPaisa(gift.amountBDT);
    if (paisa === null || paisa <= 0) errors.push('amountInvalid');
    if (GIFT_TYPES.indexOf(gift.type) === -1) errors.push('giftTypeInvalid');
    if (gift.note !== undefined && typeof gift.note !== 'string') errors.push('giftNoteInvalid');
    return errors;
  }

  function createGift(data, nowMs) {
    return {
      id: data.id || ('gift' + nowMs + '-' + Math.floor(nowMs % 100000)),
      amountPaisa: toPaisa(data.amountBDT),
      type: data.type || 'Cash',
      note: data.note || '',
      createdAt: isInt(data.createdAt) ? data.createdAt : nowMs
    };
  }

  function guestGiftTotalPais(guest) {
    return (guest.gifts || []).reduce(function (sum, g) { return sum + (isInt(g.amountPaisa) ? g.amountPaisa : 0); }, 0);
  }

  function totalGiftPais(guests) {
    return guests.reduce(function (sum, g) { return sum + guestGiftTotalPais(g); }, 0);
  }

  /* Expected headcount: sum over Confirmed + Attended of (1 + plusOnes). */
  function expectedHeadcount(guests) {
    return guests.reduce(function (sum, g) {
      if (g.status === 'Confirmed' || g.status === 'Attended') return sum + 1 + (g.plusOnes || 0);
      return sum;
    }, 0);
  }

  /* Attendance rate: attended / (confirmed + attended); null when denominator is 0. */
  function attendanceRate(guests) {
    var confirmed = 0, attended = 0;
    guests.forEach(function (g) {
      if (g.status === 'Confirmed') confirmed++;
      if (g.status === 'Attended') attended++;
    });
    var denom = confirmed + attended;
    if (denom === 0) return null;
    return attended / denom;
  }

  function dashboardStats(guests) {
    var byStatus = {}, bySide = {};
    STATUSES.forEach(function (s) { byStatus[s] = 0; });
    SIDES.forEach(function (s) { bySide[s] = 0; });
    guests.forEach(function (g) {
      if (byStatus[g.status] !== undefined) byStatus[g.status]++;
      if (bySide[g.side] !== undefined) bySide[g.side]++;
    });
    return {
      total: guests.length,
      byStatus: byStatus,
      bySide: bySide,
      headcount: expectedHeadcount(guests),
      giftTotalPais: totalGiftPais(guests),
      attendanceRate: attendanceRate(guests)
    };
  }

  /* ---- Search / filter / sort. Query is Bangla-safe: Bengali digits normalized. ---- */
  function filterGuests(guests, opts) {
    opts = opts || {};
    var q = toAsciiDigits((opts.query || '').trim().toLowerCase());
    var list = guests.filter(function (g) {
      if (opts.side && opts.side !== 'All' && g.side !== opts.side) return false;
      if (opts.status && opts.status !== 'All' && g.status !== opts.status) return false;
      if (opts.relation && opts.relation !== 'All' && g.relation !== opts.relation) return false;
      if (q) {
        var hay = toAsciiDigits((g.name + ' ' + (g.phone || '') + ' ' + (g.note || '')).toLowerCase());
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    if (opts.sort === 'name') {
      list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else {
      list = list.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
    }
    return list;
  }

  /* ---- Export / import ---- */
  function serializeExport(guests, exportedAtMs) {
    return { app: 'wedding-guest-tracker-bd', version: 1, exportedAt: exportedAtMs || Date.now(), guests: guests };
  }

  function validateImportData(data) {
    var errors = [];
    if (!data || typeof data !== 'object' || Array.isArray(data)) return ['importNotObject'];
    if (data.app !== 'wedding-guest-tracker-bd') errors.push('importBadApp');
    if (data.version !== 1) errors.push('importBadVersion');
    if (!Array.isArray(data.guests)) { errors.push('importGuestsNotArray'); return errors; }
    var seenIds = {};
    data.guests.forEach(function (g, i) {
      var p = 'guests[' + i + ']';
      if (!g || typeof g !== 'object' || Array.isArray(g)) { errors.push(p + ':notObject'); return; }
      if (!isNonEmptyString(g.id)) errors.push(p + ':id');
      else if (seenIds[g.id]) errors.push(p + ':duplicateId');
      else seenIds[g.id] = true;
      if (!isNonEmptyString(g.name)) errors.push(p + ':name');
      if (SIDES.indexOf(g.side) === -1) errors.push(p + ':side');
      if (RELATIONS.indexOf(g.relation) === -1) errors.push(p + ':relation');
      if (typeof g.phone !== 'string' || !isValidPhone(g.phone)) errors.push(p + ':phone');
      if (!isInt(g.plusOnes) || g.plusOnes < 0) errors.push(p + ':plusOnes');
      if (typeof g.table !== 'string') errors.push(p + ':table');
      if (typeof g.note !== 'string') errors.push(p + ':note');
      if (STATUSES.indexOf(g.status) === -1) errors.push(p + ':status');
      if (!isInt(g.createdAt)) errors.push(p + ':createdAt');
      if (!Array.isArray(g.gifts)) { errors.push(p + ':giftsNotArray'); return; }
      var seenGiftIds = {};
      g.gifts.forEach(function (gift, j) {
        var gp = p + '.gifts[' + j + ']';
        if (!gift || typeof gift !== 'object' || Array.isArray(gift)) { errors.push(gp + ':notObject'); return; }
        if (!isNonEmptyString(gift.id)) errors.push(gp + ':id');
        else if (seenGiftIds[gift.id]) errors.push(gp + ':duplicateId');
        else seenGiftIds[gift.id] = true;
        if (!isInt(gift.amountPaisa) || gift.amountPaisa <= 0) errors.push(gp + ':amountPaisa');
        if (GIFT_TYPES.indexOf(gift.type) === -1) errors.push(gp + ':type');
        if (typeof gift.note !== 'string') errors.push(gp + ':note');
        if (!isInt(gift.createdAt)) errors.push(gp + ':createdAt');
      });
    });
    return errors;
  }

  return {
    SIDES: SIDES, RELATIONS: RELATIONS, STATUSES: STATUSES, GIFT_TYPES: GIFT_TYPES,
    TRANSITIONS: TRANSITIONS,
    isValidPhone: isValidPhone, validateGuestInput: validateGuestInput,
    canTransition: canTransition, legalTransitions: legalTransitions,
    toPaisa: toPaisa, fromPaisa: fromPaisa, formatMoney: formatMoney,
    toBengaliDigits: toBengaliDigits, toAsciiDigits: toAsciiDigits,
    createGuest: createGuest, validateGiftInput: validateGiftInput, createGift: createGift,
    guestGiftTotalPais: guestGiftTotalPais, totalGiftPais: totalGiftPais,
    expectedHeadcount: expectedHeadcount, attendanceRate: attendanceRate,
    dashboardStats: dashboardStats, filterGuests: filterGuests,
    serializeExport: serializeExport, validateImportData: validateImportData
  };
});
