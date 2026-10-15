'use strict';
/* wedding-guest-tracker-bd \u2014 DOM glue. All Bengali strings live here as \u escapes. */
(function () {
  var L = window.WeddingGuestLogic;
  var LS_GUESTS = 'wgt.guests.v1';
  var LS_LANG = 'wgt.lang.v1';

  var I18N = {
    en: {
      appTitle: 'Wedding Guest Tracker',
      subtitle: 'Guests, RSVPs and gifts for your wedding \u2014 fully offline. Nothing leaves your browser.',
      dashboard: 'Dashboard',
      totalGuests: 'Total guests',
      confirmed: 'Confirmed',
      attended: 'Attended',
      declined: 'Declined',
      noResponse: 'No Response',
      headcount: 'Expected headcount',
      totalGifts: 'Total gifts',
      attendanceRate: 'Attendance rate',
      sideBreakdown: 'By side',
      rsvpDist: 'RSVP distribution',
      searchPlaceholder: 'Search name / phone / note',
      filterSide: 'Side',
      filterStatus: 'RSVP status',
      filterRelation: 'Relation',
      sort: 'Sort',
      sortName: 'Name A\u2013Z',
      sortRecent: 'Recently added',
      all: 'All',
      addGuest: 'Add guest',
      exportBtn: 'Export (JSON)',
      importBtn: 'Import (JSON)',
      clearAllBtn: 'Clear all',
      name: 'Name',
      side: 'Side',
      relation: 'Relation',
      phone: 'Phone (optional)',
      plusOnes: 'Plus-ones',
      tableSeat: 'Table / seat',
      note: 'Note',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      gifts: 'Gifts',
      addGift: 'Add gift',
      amount: 'Amount (BDT)',
      giftType: 'Gift type',
      giftNote: 'Note',
      emptyGuests: 'No guests yet. Add your first guest to get started.',
      emptyGifts: 'No gifts recorded yet.',
      guestTotal: 'Guest gift total',
      status: 'Status',
      invited: 'Invited',
      bride: 'Bride',
      groom: 'Groom',
      joint: 'Joint',
      family: 'Family',
      friend: 'Friend',
      colleague: 'Colleague',
      neighbour: 'Neighbour',
      other: 'Other',
      cash: 'Cash',
      envelope: 'Envelope',
      giftItem: 'Gift item',
      langToggle: '\u09ac\u09be\u0982\u09b2\u09be',
      confirmClearTitle: 'Clear all data?',
      confirmClearText: 'This permanently deletes every guest and gift. Type DELETE to confirm.',
      confirmClearBtn: 'Delete everything',
      errNameRequired: 'Name is required.',
      errPhoneInvalid: 'Phone must be 11 digits starting with 01 (e.g. 01712345678).',
      errPlusOnesInvalid: 'Plus-ones must be a whole number, 0 or more.',
      errAmountInvalid: 'Amount must be more than 0.',
      errImport: 'Import failed \u2014 your existing data is unchanged.',
      importOk: 'Import successful.',
      saved: 'Saved.',
      deleted: 'Deleted.',
      cleared: 'All data cleared.',
      giftAdded: 'Gift added.',
      disclaimer: 'Personal tool \u2014 demo only. All data stays in this browser (localStorage). No accounts, no server, no data leaves your device.'
    },
    bn: {
      appTitle: '\u09ac\u09bf\u09af\u09bc\u09c7\u09b0 \u0985\u09a4\u09bf\u09a5\u09bf \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0',
      subtitle: '\u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09bf\u09af\u09bc\u09c7\u09b0 \u0985\u09a4\u09bf\u09a5\u09bf, \u0986\u09b0\u098f\u09b8\u09ad\u09bf\u09aa\u09bf \u0993 \u0989\u09aa\u09b9\u09be\u09b0 \u2014 \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09ab\u09b2\u09be\u0987\u09a8\u09c7\u0964 \u0995\u09cb\u09a8\u09cb \u09a4\u09a5\u09cd\u09af \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u09b0 \u09ac\u09be\u0987\u09b0\u09c7 \u09af\u09be\u09af\u09bc \u09a8\u09be\u0964',
      dashboard: '\u09a1\u09cd\u09af\u09be\u09b6\u09ac\u09cb\u09b0\u09cd\u09a1',
      totalGuests: '\u09ae\u09cb\u099f \u0985\u09a4\u09bf\u09a5\u09bf',
      confirmed: '\u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4',
      attended: '\u0989\u09aa\u09b8\u09cd\u09a5\u09bf\u09a4',
      declined: '\u09aa\u09cd\u09b0\u09a4\u09cd\u09af\u09be\u0996\u09cd\u09af\u09be\u09a8',
      noResponse: '\u0989\u09a4\u09cd\u09a4\u09b0 \u09a8\u09c7\u0987',
      headcount: '\u09aa\u09cd\u09b0\u09a4\u09cd\u09af\u09be\u09b6\u09bf\u09a4 \u0985\u09a4\u09bf\u09a5\u09bf \u09b8\u0982\u0996\u09cd\u09af\u09be',
      totalGifts: '\u09ae\u09cb\u099f \u0989\u09aa\u09b9\u09be\u09b0',
      attendanceRate: '\u0989\u09aa\u09b8\u09cd\u09a5\u09bf\u09a4\u09bf\u09b0 \u09b9\u09be\u09b0',
      sideBreakdown: '\u09aa\u0995\u09cd\u09b7 \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0',
      rsvpDist: '\u0986\u09b0\u098f\u09b8\u09ad\u09bf\u09aa\u09bf \u09ac\u09bf\u09a4\u09b0\u09a3',
      searchPlaceholder: '\u0996\u09c1\u0981\u099c\u09c1\u09a8 (\u09a8\u09be\u09ae / \u09ab\u09cb\u09a8 / \u09a8\u09cb\u099f)',
      filterSide: '\u09aa\u0995\u09cd\u09b7',
      filterStatus: '\u0986\u09b0\u098f\u09b8\u09ad\u09bf\u09aa\u09bf \u0985\u09ac\u09b8\u09cd\u09a5\u09be',
      filterRelation: '\u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995',
      sort: '\u09b8\u09be\u099c\u09be\u09a8',
      sortName: '\u09a8\u09be\u09ae (\u0985\u2013\u09b9)',
      sortRecent: '\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995',
      all: '\u09b8\u09ac',
      addGuest: '\u0985\u09a4\u09bf\u09a5\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      exportBtn: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f (JSON)',
      importBtn: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f (JSON)',
      clearAllBtn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8',
      name: '\u09a8\u09be\u09ae',
      side: '\u09aa\u0995\u09cd\u09b7',
      relation: '\u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995',
      phone: '\u09ab\u09cb\u09a8 (\u0990\u099a\u09cd\u099b\u09bf\u0995)',
      plusOnes: '\u09b8\u0999\u09cd\u0997\u09c0 \u09b8\u0982\u0996\u09cd\u09af\u09be',
      tableSeat: '\u099f\u09c7\u09ac\u09bf\u09b2 / \u0986\u09b8\u09a8',
      note: '\u09a8\u09cb\u099f',
      save: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3',
      cancel: '\u09ac\u09be\u09a4\u09bf\u09b2',
      edit: '\u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be',
      delete: '\u09ae\u09c1\u099b\u09c1\u09a8',
      gifts: '\u0989\u09aa\u09b9\u09be\u09b0',
      addGift: '\u0989\u09aa\u09b9\u09be\u09b0 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      amount: '\u09aa\u09b0\u09bf\u09ae\u09be\u09a3 (\u099f\u09be\u0995\u09be)',
      giftType: '\u0989\u09aa\u09b9\u09be\u09b0\u09c7\u09b0 \u09a7\u09b0\u09a8',
      giftNote: '\u09a8\u09cb\u099f',
      emptyGuests: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u0985\u09a4\u09bf\u09a5\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09a8\u09bf\u0964 \u09aa\u09cd\u09b0\u09a5\u09ae \u0985\u09a4\u09bf\u09a5\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c7 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8\u0964',
      emptyGifts: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u0989\u09aa\u09b9\u09be\u09b0 \u09a8\u09c7\u0987\u0964',
      guestTotal: '\u098f\u0987 \u0985\u09a4\u09bf\u09a5\u09bf\u09b0 \u09ae\u09cb\u099f \u0989\u09aa\u09b9\u09be\u09b0',
      status: '\u0985\u09ac\u09b8\u09cd\u09a5\u09be',
      invited: '\u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09bf\u09a4',
      bride: '\u0995\u09a8\u09c7\u09b0 \u09aa\u0995\u09cd\u09b7',
      groom: '\u09ac\u09b0\u09c7\u09b0 \u09aa\u0995\u09cd\u09b7',
      joint: '\u09af\u09cc\u09a5',
      family: '\u09aa\u09b0\u09bf\u09ac\u09be\u09b0',
      friend: '\u09ac\u09a8\u09cd\u09a7\u09c1',
      colleague: '\u09b8\u09b9\u0995\u09b0\u09cd\u09ae\u09c0',
      neighbour: '\u09aa\u09cd\u09b0\u09a4\u09bf\u09ac\u09c7\u09b6\u09c0',
      other: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af',
      cash: '\u09a8\u0997\u09a6',
      envelope: '\u0996\u09be\u09ae',
      giftItem: '\u0989\u09aa\u09b9\u09be\u09b0 \u09b8\u09be\u09ae\u0997\u09cd\u09b0\u09c0',
      langToggle: 'English',
      confirmClearTitle: '\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09ac\u09c7\u09a8?',
      confirmClearText: '\u098f\u09a4\u09c7 \u09b8\u09ac \u0985\u09a4\u09bf\u09a5\u09bf \u0993 \u0989\u09aa\u09b9\u09be\u09b0 \u09b8\u09cd\u09a5\u09be\u09af\u09bc\u09c0\u09ad\u09be\u09ac\u09c7 \u09ae\u09c1\u099b\u09c7 \u09af\u09be\u09ac\u09c7\u0964 \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      confirmClearBtn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
      errNameRequired: '\u09a8\u09be\u09ae \u0986\u09ac\u09b6\u09cd\u09af\u0995\u0964',
      errPhoneInvalid: '\u09ab\u09cb\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0 \u09e7\u09e7 \u09b8\u0982\u0996\u09cd\u09af\u09be\u09b0 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7 \u098f\u09ac\u0982 \u09e6\u09e7 \u09a6\u09bf\u09af\u09bc\u09c7 \u09b6\u09c1\u09b0\u09c1 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7 (\u09af\u09c7\u09ae\u09a8 \u09e6\u09e7\u09ed\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee)\u0964',
      errPlusOnesInvalid: '\u09b8\u0999\u09cd\u0997\u09c0 \u09b8\u0982\u0996\u09cd\u09af\u09be \u09e6 \u09ac\u09be \u09a4\u09be\u09b0 \u09ac\u09c7\u09b6\u09bf \u09aa\u09c2\u09b0\u09cd\u09a3\u09b8\u0982\u0996\u09cd\u09af\u09be \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      errAmountInvalid: '\u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09e6-\u098f\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      errImport: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5 \u2014 \u0986\u09aa\u09a8\u09be\u09b0 \u0986\u0997\u09c7\u09b0 \u09a4\u09a5\u09cd\u09af \u0985\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09bf\u09a4 \u0986\u099b\u09c7\u0964',
      importOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2\u0964',
      saved: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4\u0964',
      deleted: '\u09ae\u09cb\u099b\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      cleared: '\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09cb\u099b\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      giftAdded: '\u0989\u09aa\u09b9\u09be\u09b0 \u09af\u09cb\u0997 \u0995\u09b0\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      disclaimer: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09c1\u09b2 \u2014 \u09b6\u09c1\u09a7\u09c1 \u09a1\u09c7\u09ae\u09cb\u0964 \u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 (localStorage) \u09a5\u09be\u0995\u09c7\u0964 \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09a8\u09c7\u0987, \u0995\u09cb\u09a8\u09cb \u09b8\u09be\u09b0\u09cd\u09ad\u09be\u09b0 \u09a8\u09c7\u0987, \u0995\u09cb\u09a8\u09cb \u09a4\u09a5\u09cd\u09af \u0986\u09aa\u09a8\u09be\u09b0 \u09a1\u09bf\u09ad\u09be\u0987\u09b8 \u099b\u09be\u09a1\u09bc\u09c7 \u09a8\u09be\u0964'
    }
  };

  var SIDE_LABEL = { Bride: 'bride', Groom: 'groom', Joint: 'joint' };
  var REL_LABEL = { Family: 'family', Friend: 'friend', Colleague: 'colleague', Neighbour: 'neighbour', Other: 'other' };
  var STATUS_LABEL = { Invited: 'invited', Confirmed: 'confirmed', Attended: 'attended', Declined: 'declined', 'No Response': 'noResponse' };
  var GIFT_LABEL = { Cash: 'cash', Envelope: 'envelope', 'Gift item': 'giftItem' };

  var state = { guests: [], lang: 'en', editingId: null, giftForms: {} };
  var idCounter = 0;

  function $(id) { return document.getElementById(id); }
  function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key; }
  function isBn() { return state.lang === 'bn'; }
  function fmtNum(n) { return isBn() ? L.toBengaliDigits(String(n)) : String(n); }
  function fmtMoney(paisa) { return L.formatMoney(paisa, isBn()); }

  function uid(prefix) {
    idCounter++;
    return prefix + Date.now().toString(36) + '-' + idCounter;
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS_GUESTS);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.guests)) state.guests = parsed.guests;
        else if (Array.isArray(parsed)) state.guests = parsed;
      }
    } catch (e) { state.guests = []; }
    var lang = localStorage.getItem(LS_LANG);
    if (lang === 'bn' || lang === 'en') state.lang = lang;
  }

  function save() {
    localStorage.setItem(LS_GUESTS, JSON.stringify({ app: 'wedding-guest-tracker-bd', version: 1, guests: state.guests }));
    localStorage.setItem(LS_LANG, state.lang);
  }

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function showInlineError(el, msg) {
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }

  /* ---------- static text ---------- */
  function applyStaticText() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' && el.type !== 'button' && el.type !== 'submit') {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    document.querySelectorAll('[data-i18n-option]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n-option'));
    });
    $('langToggle').textContent = t('langToggle');
    buildSelectOptions();
  }

  function buildSelectOptions() {
    var sideSel = $('filterSide'), statusSel = $('filterStatus'), relSel = $('filterRelation');
    var sortSel = $('sortBy');
    var cur = { side: sideSel.value, status: statusSel.value, rel: relSel.value, sort: sortSel.value };
    sideSel.innerHTML = '<option value="All">' + t('all') + '</option>' +
      L.SIDES.map(function (s) { return '<option value="' + s + '">' + t(SIDE_LABEL[s]) + '</option>'; }).join('');
    statusSel.innerHTML = '<option value="All">' + t('all') + '</option>' +
      L.STATUSES.map(function (s) { return '<option value="' + s + '">' + t(STATUS_LABEL[s]) + '</option>'; }).join('');
    relSel.innerHTML = '<option value="All">' + t('all') + '</option>' +
      L.RELATIONS.map(function (s) { return '<option value="' + s + '">' + t(REL_LABEL[s]) + '</option>'; }).join('');
    sortSel.innerHTML = '<option value="recent">' + t('sortRecent') + '</option><option value="name">' + t('sortName') + '</option>';
    sideSel.value = cur.side || 'All';
    statusSel.value = cur.status || 'All';
    relSel.value = cur.rel || 'All';
    sortSel.value = cur.sort || 'recent';
    // form selects
    $('fSide').innerHTML = L.SIDES.map(function (s) { return '<option value="' + s + '">' + t(SIDE_LABEL[s]) + '</option>'; }).join('');
    $('fRelation').innerHTML = L.RELATIONS.map(function (s) { return '<option value="' + s + '">' + t(REL_LABEL[s]) + '</option>'; }).join('');
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    var s = L.dashboardStats(state.guests);
    $('statTotal').textContent = fmtNum(s.total);
    $('statConfirmed').textContent = fmtNum(s.byStatus['Confirmed']);
    $('statAttended').textContent = fmtNum(s.byStatus['Attended']);
    $('statDeclined').textContent = fmtNum(s.byStatus['Declined']);
    $('statNoResponse').textContent = fmtNum(s.byStatus['No Response']);
    $('statHeadcount').textContent = fmtNum(s.headcount);
    $('statGifts').textContent = fmtMoney(s.giftTotalPais);
    $('statRate').textContent = s.attendanceRate === null ? '\u2014' : fmtNum(Math.round(s.attendanceRate * 100)) + '%';

    $('sideBreakdown').innerHTML = L.SIDES.map(function (side) {
      return '<div class="side-row"><span>' + t(SIDE_LABEL[side]) + '</span><strong>' + fmtNum(s.bySide[side]) + '</strong></div>';
    }).join('');

    $('rsvpBars').innerHTML = L.STATUSES.map(function (st) {
      var count = s.byStatus[st];
      var pct = s.total === 0 ? 0 : Math.round((count / s.total) * 100);
      return '<div class="bar-row"><span class="bar-label">' + t(STATUS_LABEL[st]) + '</span>' +
        '<div class="bar-track"><div class="bar-fill bar-' + st.replace(/\s/g, '') + '" style="width:' + pct + '%"></div></div>' +
        '<span class="bar-count">' + fmtNum(count) + '</span></div>';
    }).join('');
  }

  /* ---------- guest list ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function guestCard(g) {
    var transitions = L.legalTransitions(g.status);
    var buttons = transitions.map(function (to) {
      return '<button class="btn btn-small btn-transition" data-action="transition" data-id="' + g.id + '" data-to="' + esc(to) + '">' + t(STATUS_LABEL[to]) + '</button>';
    }).join('');
    var giftsHtml = (g.gifts || []).map(function (gift) {
      return '<li class="gift-item"><span>' + t(GIFT_LABEL[gift.type]) + ' \u2014 ' + fmtMoney(gift.amountPaisa) +
        (gift.note ? ' <em>(' + esc(gift.note) + ')</em>' : '') + '</span>' +
        '<button class="btn btn-small btn-danger" data-action="delete-gift" data-id="' + g.id + '" data-gift="' + gift.id + '">' + t('delete') + '</button></li>';
    }).join('');
    return '<article class="guest-card" data-guest-id="' + g.id + '">' +
      '<div class="guest-head"><h3>' + esc(g.name) + '</h3>' +
      '<span class="badge badge-status">' + t(STATUS_LABEL[g.status]) + '</span></div>' +
      '<p class="guest-meta">' + t(SIDE_LABEL[g.side]) + ' \u00b7 ' + t(REL_LABEL[g.relation]) +
      (g.phone ? ' \u00b7 ' + esc(g.phone) : '') + ' \u00b7 +' + fmtNum(g.plusOnes) +
      (g.table ? ' \u00b7 ' + esc(g.table) : '') + '</p>' +
      (g.note ? '<p class="guest-note">' + esc(g.note) + '</p>' : '') +
      '<div class="transition-row"><span class="lbl">' + t('status') + ':</span> ' + buttons + '</div>' +
      '<div class="card-actions">' +
      '<button class="btn btn-small" data-action="edit" data-id="' + g.id + '">' + t('edit') + '</button>' +
      '<button class="btn btn-small btn-danger" data-action="delete" data-id="' + g.id + '">' + t('delete') + '</button>' +
      '</div>' +
      '<div class="gifts"><h4>' + t('gifts') + ' \u2014 ' + t('guestTotal') + ': ' + fmtMoney(L.guestGiftTotalPais(g)) + '</h4>' +
      ((g.gifts || []).length === 0 ? '<p class="empty-inline">' + t('emptyGifts') + '</p>' : '<ul>' + giftsHtml + '</ul>') +
      '<form class="gift-form" data-gift-form="' + g.id + '">' +
      '<input type="number" min="0.01" step="0.01" inputmode="decimal" required placeholder="' + t('amount') + '" data-gift-amount>' +
      '<select data-gift-type>' + L.GIFT_TYPES.map(function (gt) { return '<option value="' + gt + '">' + t(GIFT_LABEL[gt]) + '</option>'; }).join('') + '</select>' +
      '<input type="text" placeholder="' + t('giftNote') + '" data-gift-note>' +
      '<button type="submit" class="btn btn-small btn-primary">' + t('addGift') + '</button>' +
      '<div class="inline-error" data-gift-error></div>' +
      '</form></div></article>';
  }

  function renderList() {
    var filtered = L.filterGuests(state.guests, {
      query: $('searchInput').value,
      side: $('filterSide').value,
      status: $('filterStatus').value,
      relation: $('filterRelation').value,
      sort: $('sortBy').value === 'name' ? 'name' : 'recent'
    });
    var listEl = $('guestList');
    if (filtered.length === 0) {
      listEl.innerHTML = '<p class="empty-state" id="emptyGuests">' + t('emptyGuests') + '</p>';
    } else {
      listEl.innerHTML = filtered.map(guestCard).join('');
    }
    // wire gift forms
    listEl.querySelectorAll('[data-gift-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var gid = form.getAttribute('data-gift-form');
        var amountVal = parseFloat(form.querySelector('[data-gift-amount]').value);
        var gift = { amountBDT: amountVal, type: form.querySelector('[data-gift-type]').value, note: form.querySelector('[data-gift-note]').value || '' };
        var errs = L.validateGiftInput(gift);
        var errEl = form.querySelector('[data-gift-error]');
        if (errs.length > 0) { showInlineError(errEl, t('errAmountInvalid')); return; }
        var guest = state.guests.find(function (x) { return x.id === gid; });
        if (!guest) return;
        guest.gifts.push(L.createGift(gift, Date.now()));
        save(); renderAll();
        toast(t('giftAdded'));
      });
    });
  }

  function renderAll() { renderDashboard(); renderList(); }

  /* ---------- guest form ---------- */
  function openForm(guest) {
    state.editingId = guest ? guest.id : null;
    $('formTitle').textContent = guest ? t('edit') : t('addGuest');
    $('fName').value = guest ? guest.name : '';
    $('fSide').value = guest ? guest.side : 'Joint';
    $('fRelation').value = guest ? guest.relation : 'Other';
    $('fPhone').value = guest ? guest.phone : '';
    $('fPlusOnes').value = guest ? guest.plusOnes : 0;
    $('fTable').value = guest ? guest.table : '';
    $('fNote').value = guest ? guest.note : '';
    showInlineError($('formError'), '');
    $('guestForm').hidden = false;
    $('fName').focus();
  }
  function closeForm() { $('guestForm').hidden = true; state.editingId = null; }

  function submitForm(e) {
    e.preventDefault();
    var plusRaw = $('fPlusOnes').value.trim();
    var plus = plusRaw === '' ? NaN : Number(plusRaw);
    var data = {
      name: $('fName').value,
      side: $('fSide').value,
      relation: $('fRelation').value,
      phone: $('fPhone').value.trim(),
      plusOnes: plus,
      table: $('fTable').value.trim(),
      note: $('fNote').value.trim()
    };
    var errs = L.validateGuestInput(data);
    if (errs.length > 0) {
      var msg = errs[0] === 'nameRequired' ? t('errNameRequired') :
        errs[0] === 'phoneInvalid' ? t('errPhoneInvalid') :
        errs[0] === 'plusOnesInvalid' ? t('errPlusOnesInvalid') : errs[0];
      showInlineError($('formError'), msg);
      return;
    }
    if (state.editingId) {
      var g = state.guests.find(function (x) { return x.id === state.editingId; });
      if (g) { g.name = data.name.trim(); g.side = data.side; g.relation = data.relation; g.phone = data.phone; g.plusOnes = data.plusOnes; g.table = data.table; g.note = data.note; }
    } else {
      state.guests.push(L.createGuest(data, Date.now()));
    }
    save(); renderAll(); closeForm();
    toast(t('saved'));
  }

  /* ---------- export / import / clear ---------- */
  function doExport() {
    var blob = new Blob([JSON.stringify(L.serializeExport(state.guests), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'wedding-guests-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function doImport(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var errEl = $('importError');
      var parsed;
      try { parsed = JSON.parse(reader.result); } catch (e) { showInlineError(errEl, t('errImport')); return; }
      var errs = L.validateImportData(parsed);
      if (errs.length > 0) { showInlineError(errEl, t('errImport') + ' (' + errs.slice(0, 3).join(', ') + ')'); return; }
      state.guests = parsed.guests;
      save(); renderAll();
      showInlineError(errEl, '');
      toast(t('importOk'));
    };
    reader.readAsText(file);
  }

  function openClear() {
    $('clearInput').value = '';
    showInlineError($('clearError'), '');
    $('clearDialog').hidden = false;
    $('clearInput').focus();
  }

  /* ---------- events ---------- */
  function bindEvents() {
    $('langToggle').addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'bn' : 'en';
      save(); applyStaticText(); renderAll();
    });
    $('addGuestBtn').addEventListener('click', function () { openForm(null); });
    $('cancelFormBtn').addEventListener('click', closeForm);
    $('guestFormEl').addEventListener('submit', submitForm);
    $('searchInput').addEventListener('input', renderList);
    ['filterSide', 'filterStatus', 'filterRelation', 'sortBy'].forEach(function (id) {
      $(id).addEventListener('change', renderList);
    });
    $('exportBtn').addEventListener('click', doExport);
    $('importBtn').addEventListener('click', function () { $('importFile').click(); });
    $('importFile').addEventListener('change', function () {
      if (this.files && this.files[0]) doImport(this.files[0]);
      this.value = '';
    });
    $('clearAllBtn').addEventListener('click', openClear);
    $('cancelClearBtn').addEventListener('click', function () { $('clearDialog').hidden = true; });
    $('clearInput').addEventListener('input', function () {
      $('confirmClearBtn').disabled = this.value !== 'DELETE';
    });
    $('confirmClearBtn').addEventListener('click', function () {
      if ($('clearInput').value !== 'DELETE') { showInlineError($('clearError'), t('confirmClearText')); return; }
      state.guests = [];
      save(); renderAll();
      $('clearDialog').hidden = true;
      toast(t('cleared'));
    });
    $('guestList').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var id = btn.getAttribute('data-id');
      var guest = state.guests.find(function (x) { return x.id === id; });
      if (!guest) return;
      if (action === 'edit') { openForm(guest); return; }
      if (action === 'delete') {
        state.guests = state.guests.filter(function (x) { return x.id !== id; });
        save(); renderAll(); toast(t('deleted'));
        return;
      }
      if (action === 'transition') {
        var to = btn.getAttribute('data-to');
        if (L.canTransition(guest.status, to)) { guest.status = to; save(); renderAll(); }
        return;
      }
      if (action === 'delete-gift') {
        var giftId = btn.getAttribute('data-gift');
        guest.gifts = (guest.gifts || []).filter(function (gf) { return gf.id !== giftId; });
        save(); renderAll(); toast(t('deleted'));
      }
    });
  }

  /* ---------- boot ---------- */
  load();
  applyStaticText();
  bindEvents();
  renderAll();
})();
