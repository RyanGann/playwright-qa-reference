# Playwright E2E Reference Suite

A working end-to-end suite built the way I build them for clients — page objects, typed fixtures, isolated test data, CI integration, and measured stability.

It runs against [SauceDemo](https://www.saucedemo.com), Sauce Labs' public practice application, so you can clone it and see a green run in about two minutes without any credentials of your own.

**This repository exists so you can judge the code before hiring me.** Read it, run it, then decide.

[![E2E](https://github.com/RyanGann/playwright-qa-reference/actions/workflows/e2e.yml/badge.svg)](https://github.com/RyanGann/playwright-qa-reference/actions/workflows/e2e.yml)

---

## Quick start

```bash
npm install
npx playwright install --with-deps chromium firefox
npm test
```

Other useful commands:

```bash
npm run test:ui        # interactive runner — best way to explore the suite
npm run test:headed    # watch it drive a real browser
npm run test:debug     # step through with the inspector
npm run report         # open the last HTML report
npm run flake-check    # run the suite 20x and report any instability
```

---

## What this suite demonstrates

| Practice | Where to look |
|---|---|
| Page-object model with typed locators | `e2e/pages/` |
| Custom fixtures instead of `beforeEach` chains | `e2e/fixtures/test.ts` |
| Session reuse via `storageState` | `e2e/fixtures/auth.setup.ts` |
| Data-driven tests from a single source of truth | `e2e/specs/inventory.spec.ts` |
| Web-first assertions, no arbitrary waits | everywhere — `grep -r "waitForTimeout" e2e/` returns nothing |
| Independent, order-agnostic tests | every spec creates the state it needs |
| Negative and permission cases, not just happy paths | `e2e/specs/auth.spec.ts` |
| Measured flake rate rather than a claim | `scripts/flake-check.sh` |
| CI with traces, screenshots, and video on failure | `.github/workflows/e2e.yml` |

## Deliberate choices

**No `waitForTimeout`, anywhere.** Every wait is an assertion on a condition. Fixed sleeps are the single largest cause of flaky suites: they are simultaneously too slow on a fast machine and too fast on a loaded CI runner.

**Locators resolve through user-visible attributes first.** Role, label, and text before `data-test`, and `data-test` before CSS. A test that binds to what the user sees survives a refactor; a test that binds to `.css-1x4kq2p` does not.

**Every test owns its state.** No test depends on another having run first, which is what makes `fullyParallel: true` safe and keeps the suite under a minute.

**Retries are visible, not hidden.** CI retries once, and a test that only passes on retry is reported as flaky rather than quietly counted as green. A suite that hides flakiness is a suite nobody will trust in six months.

**Assertions state intent.** `await expect(cart.badge).toHaveText('1')` rather than a boolean check, so a failure message tells you what was expected without opening the file.

---

## Repository layout

```
e2e/
  fixtures/
    auth.setup.ts      Signs in once; saves storage state for reuse
    test.ts            Custom fixtures: typed page objects, per-test data
    users.ts           Test accounts and their expected behaviour
  pages/
    BasePage.ts        Shared navigation and common elements
    LoginPage.ts
    InventoryPage.ts
    CartPage.ts
    CheckoutPage.ts
  specs/
    auth.spec.ts       Sign-in, locked accounts, sign-out, route protection
    inventory.spec.ts  Product listing, sorting, add and remove
    cart.spec.ts       Cart contents, badge counts, continue shopping
    checkout.spec.ts   The full purchase journey plus validation failures
  utils/
    money.ts           Currency parsing and total arithmetic
scripts/
  flake-check.sh       Runs the suite N times and summarises stability
docs/
  ADDING-A-TEST.md     How to extend the suite
```

---

## Stability

The claim on my Upwork listing is that every test I hand over passes 20 consecutive CI runs before delivery. `npm run flake-check` is how that gets measured:

```bash
npm run flake-check        # default: 20 iterations
ITERATIONS=50 npm run flake-check
```

It runs the full suite repeatedly with retries disabled, so a test that passes only intermittently shows up rather than being papered over. Output is a pass/fail count per iteration and a final flake rate.

---

## A note on the target application

SauceDemo is a public practice application maintained by Sauce Labs for exactly this purpose. It is intentionally stable, which makes it a good demonstration target — but it also means this suite does not have to handle everything a real client application does: third-party payment providers, email verification, MFA, feature flags, or a UI that changes weekly.

Client work involves all of those. What transfers is the structure, and that is what this repository is for.

---

## Author

Ryan Gann — QA engineer, US-based. Five years testing mission-critical systems for defense programs, now working with product teams on release confidence.

- Upwork: https://www.upwork.com/freelancers/~012434087e8d03ecbe
- GitHub: https://github.com/RyanGann
