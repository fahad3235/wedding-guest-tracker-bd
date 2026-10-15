# TEST RESULTS - wedding-guest-tracker-bd

Verified run: 2026-10-15. All numbers below are from real test runs, not estimates.

## Unit tests (Node, `node --test tests/test_logic.js`)

**11 / 11 passed** (0 failed), covering:

- RSVP transition legality matrix: all 5x5 from/to pairs checked against the
  legal-transition table, including 3 explicit illegal jumps
  (Invited -> Attended, Attended -> Declined, Declined -> Attended).
- Hand-verified example (also re-checked by hand below).
- Integer-paisa money: `toPaisa(0.1) + toPaisa(0.2) === toPaisa(0.3)`,
  `toPaisa(2500.50) === 250050`, `formatMoney(750050) === 'BDT 7,500.50'`.
- Gift add/delete totals: 1000 + 500.25 = 1500.25, after delete = 500.25;
  zero / negative / NaN amounts and bad gift types rejected.
- Phone validation: 10 cases (valid, empty, 10-digit, 12-digit, wrong prefix,
  space, dash, letter, number type).
- Plus-ones / guest validation: negative, fractional, string plus-ones and
  blank name / bad phone / bad side / bad relation all rejected.
- Import validation: **17 malformed payloads** rejected (null, array, string,
  wrong app, wrong version, guests-not-array, blank name, bad side, bad status,
  negative plus-ones, bad phone, negative gift amount, zero gift amount,
  fractional gift paisa, bad gift type, duplicate guest IDs, gifts-not-array).
  Valid payload accepted; validation does not mutate its input.
- Bangla-safe search: Bengali-digit query matches an ASCII phone number;
  name / note search, side / status / relation filters, name and recent sorts.
- Dashboard stats and Bengali digits / money formatting.
- Export shape round-trips through import validation.

## Headless-Chrome smoke tests (`node tests/smoke.mjs`, raw CDP, file:// URL)

**32 / 32 passed** (0 failed), covering end-to-end in a real browser:

- Empty state, dashboard totals start at 0, attendance rate shows `--`.
- Add-guest flow: total 1, card shows name, Invited headcount 0.
- RSVP: Confirmed button renders, illegal Attended button does NOT render from
  Invited; after Confirmed, headcount = 2 (1 guest + 1 plus-one); Attended and
  Declined buttons render from Confirmed.
- Gift add: guest total and dashboard total both show `BDT 5,000.00`.
- Invalid phone: inline error shown, guest NOT added.
- Search: non-matching query hides guests, clearing restores them.
- BN toggle: total renders Bengali digit `1`, `localStorage` lang = `bn`,
  language and digits persist after a full page reload.
- Export -> wipe -> import round-trip: typed-DELETE clears to 0, import
  restores the guest and the `BDT 5,000.00` gift total.
- Malformed import: inline error shown, existing data intact.
- Clear-all: lowercase `delete` keeps the confirm button disabled; exact
  `DELETE` wipes everything.
- 390px viewport: `scrollWidth <= 390` - no horizontal overflow.
- **ZERO console / page errors** (consoleAPICalled error, exceptionThrown,
  and Log entryAdded error all monitored).

## Hand-verified numbers (recomputed by hand, match the code)

Example: 3 guests - A Confirmed with +1 plus-one, B Attended with +0, C Declined with +2.

| Metric | Hand computation | Code result |
|---|---|---|
| Expected headcount | (1 + 1) + (1 + 0) + 0 [Declined excluded] = **3** | 3 |
| Gift total | 5000 + 2500.50 = **7500.50 BDT** (750050 paisa) | 750050 paisa, `BDT 7,500.50` |
| Attendance rate | attended / (confirmed + attended) = 1 / (1 + 1) = **50%** | 0.5 |
| Empty denominator | no Confirmed/Attended guests -> shown as `--` | null -> `--` |

## Repairs made

1. Smoke-test harness bug (test-only, not app code): the raw-CDP WebSocket
   client's `waitEvent` consumed waiters on non-matching messages, so the
   first page-load wait timed out. Fixed by keeping waiters until their
   predicate matches. No app code changed.
2. One unit-test expectation typo (test-only): the expected Bengali rendering
   of `BDT 7,500.50` was mistyped; the implementation's output
   (`7,500.50` with Bengali digits) was correct and the test was fixed.

## Source hygiene

- `grep -rP '[^\x00-\x7F]'` over `*.js`, `*.html`, `*.css`, `*.md` returns
  **zero matches** - all source files are pure ASCII; Bengali text exists only
  as `\uXXXX` escapes in JS strings and numeric character references in HTML.
- No secrets, no CDN, no external requests. Combined `index.html` + JS size:
  ~43 KB.
