# Adding a test

The version I hand to clients is written against their application. This is the shape of it.

## The one rule

**Never put a selector in a spec file.** Selectors live in page objects. This single rule is what keeps a suite maintainable after the person who wrote it moves on: when a screen changes, exactly one file changes.

## Walkthrough — "a shopper can apply a promo code"

### 1. Add the locators to the page object

```ts
// e2e/pages/CartPage.ts
readonly promoInput: Locator;
readonly applyPromo: Locator;
readonly discountLabel: Locator;

constructor(page: Page) {
  super(page);
  this.promoInput = page.getByLabel('Promo code');
  this.applyPromo = page.getByRole('button', { name: 'Apply' });
  this.discountLabel = page.locator('[data-test="discount"]');
}
```

Locator preference, in order:

1. `getByRole`, `getByLabel`, `getByPlaceholder` — bound to what the user perceives
2. `getByText` — fine for stable copy, risky for marketing copy
3. `[data-test="..."]` — explicit test contract; ask the developers to add these
4. CSS classes — last resort, and note it in the handoff as fragile

### 2. Add the action, with its completion assertion

```ts
async applyPromoCode(code: string): Promise<void> {
  await this.promoInput.fill(code);
  await this.applyPromo.click();
  // The method waits for its own effect. Callers never have to guess.
  await expect(this.discountLabel).toBeVisible();
}
```

### 3. Write the spec

```ts
// e2e/specs/cart.spec.ts
test('a valid promo code reduces the total', async ({ inventoryPage, cartPage }) => {
  await inventoryPage.open();
  await inventoryPage.addToCart(PRODUCTS.backpack);
  await inventoryPage.openCart();

  const before = await cartPage.subtotal();
  await cartPage.applyPromoCode('SAVE10');

  expect(await cartPage.subtotal()).toBeLessThan(before);
});
```

### 4. Write the negative case in the same sitting

The positive case tells you the feature exists. The negative case is usually where the defect is.

```ts
test('an expired promo code is refused with a clear message', async ({ cartPage }) => {
  await cartPage.open();
  await cartPage.promoInput.fill('EXPIRED2019');
  await cartPage.applyPromo.click();

  await expect(cartPage.page.getByText(/no longer valid/i)).toBeVisible();
  await expect(cartPage.discountLabel).toHaveCount(0);
});
```

## Checklist before you commit

- [ ] No selector appears in a spec file
- [ ] No `waitForTimeout` — every wait is an assertion on a condition
- [ ] The test creates its own state and does not depend on another test
- [ ] The name describes user-visible behaviour, not implementation
- [ ] A negative or boundary case exists alongside the happy path
- [ ] It passes 5 consecutive local runs: `npx playwright test --repeat-each=5 -g "your test name"`

## Debugging a failure

```bash
npx playwright show-report                        # HTML report from the last run
npx playwright show-trace test-results/<dir>/trace.zip
npx playwright test --debug -g "your test name"   # step through with the inspector
npx playwright test --ui                          # time-travel through every step
```

Start with the trace. It records DOM snapshots at every step, so you can see the state of the page at the moment the assertion failed rather than reproducing it by hand.
