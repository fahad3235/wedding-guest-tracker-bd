# Wedding Guest Tracker BD

An offline, bilingual (English / Bangla) wedding and event guest tracker. Manage
guests, RSVPs, plus-ones, seating, and gift/envelope records - entirely in the
browser. No accounts, no server, no data ever leaves the device.

Ships **empty** (no demo guests). This is a personal tool, not a hosted service.

## Problem

Wedding guest lists in Bangladesh usually live in scattered notebooks, chats, and
spreadsheets. Counting expected headcount, tracking who confirmed or attended,
and recording cash/envelope gifts becomes error-prone - especially when the
numbers decide catering, seating, and thank-you lists. This app keeps one
authoritative list, offline, in two languages.

## Features

1. **Guest CRUD** - name (required), side (Bride / Groom / Joint), relation
   (Family / Friend / Colleague / Neighbour / Other), phone (optional; if given
   must be a valid BD mobile: 11 digits starting with `01`), plus-ones
   (integer >= 0), table/seat (free text), note. Edit and delete per guest.
2. **RSVP status machine** - `Invited -> Confirmed -> Attended`, plus `Declined`
   and `No Response`. Only legal transitions are offered as buttons:
   Invited can go to Confirmed / Declined / No Response; Confirmed to Attended /
   Declined; Attended back to Confirmed; Declined back to Invited; No Response to
   Invited / Confirmed / Declined. Illegal transition buttons never render.
3. **Gift / envelope log per guest** - amount in BDT (integer-paisa math, no
   float error), gift type (Cash / Envelope / Gift item), note. Add/delete gift
   entries per guest; each guest's total gift is shown.
4. **Dashboard** - total guests, confirmed, attended, declined, no-response,
   expected headcount (sum over Confirmed + Attended of `1 + plusOnes`), total
   gift amount (BDT), attendance rate = attended / (confirmed + attended) as a
   percentage (`--` when the denominator is 0), per-side breakdown
   (Bride / Groom / Joint), and RSVP distribution bars.
5. **Search + filters + sort** - search across name/phone/note (Bangla-safe:
   Bengali digits in a query match ASCII phone digits); filters for side, RSVP
   status, relation; sort by name A-Z or recently added.
6. **JSON export / import + clear-all** - download a JSON backup; import with
   strict validation (wrong shape, wrong types, bad enum values, negative
   plus-ones, negative/zero gift amounts, duplicate IDs are all rejected with an
   inline error and existing data left intact). Clear-all requires typing
   `DELETE` to confirm.
7. **EN / Bangla toggle** persisted in `localStorage`, Bengali digit rendering
   (0-9) when Bangla is active, `localStorage` persistence across reloads,
   390px mobile layout with no horizontal overflow, empty states for the guest
   list and gift lists, inline validation errors (no `alert()`).

## Stack

Vanilla HTML / CSS / JavaScript. No build step, no framework, no CDN, no
network requests. `js/logic.js` holds pure functions (no DOM) so it is unit
testable in Node; `js/app.js` is the DOM glue.

## Prerequisites

Any modern browser. For tests: Node.js 18+ and Chromium (the smoke test uses
`/opt/meta-chromium/chrome` when present, otherwise `chromium` from PATH).

## Install

No install. Clone or download, then open `index.html` in a browser - or serve
the folder with any static server.

## Dev commands

```bash
node --test tests/test_logic.js   # unit tests (pure logic)
node tests/smoke.mjs              # headless-Chrome end-to-end smoke test
```

## Environment

None. There are no secrets, API keys, or environment variables. All data lives
in the browser's `localStorage` under keys `wgt.guests.v1` and `wgt.lang.v1`.

## Testing

See `TEST_RESULTS.md` for the real numbers from the verified run.

## Deployment

GitHub Pages: publish the repository and enable Pages on the `main` branch -
the app is a static site with relative asset paths.

## Limitations

- Data lives only in one browser's `localStorage` (per origin). Clearing site
  data wipes it - use JSON export for backups. There is no sync, no
  multi-device sharing, and no multi-user access.
- No real authentication. Anyone with access to the browser can read or edit
  the list.
- Phone validation checks format only (11 digits starting with `01`); it does
  not verify that a number is real or reachable.
- Gift amounts must be positive; a zero-amount gift entry is rejected.
- `No Response -> Invited / Confirmed / Declined` is a design decision: a
  no-response guest can be re-invited or resolved directly.

## Status

Complete MVP. Unit tests 11/11 and headless-Chrome smoke tests 32/32, zero
console/page errors. Hand-verified math in `TEST_RESULTS.md`.
