import { test, expect } from '../fixtures/test';
import { PRODUCTS, CHECKOUT_DETAILS } from '../fixtures/users';
import { equalMoney, toCents } from '../utils/money';

test.describe('checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.openCart();
  });

  test('a shopper can complete a purchase end to end', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.continueToOverview(CHECKOUT_DETAILS);
    await checkoutPage.finish();

    await expect(checkoutPage.confirmation).toContainText(/thank you for your order/i);
    // The cart must be empty afterwards — a stale badge here is a real defect
    // that teams miss because they stop testing at the confirmation screen.
    await checkoutPage.expectCartCount(0);
  });

  const requiredFields = [
    {
      name: 'first name',
      details: { firstName: '', lastName: 'Lovelace', postalCode: '35570' },
      error: /First Name is required/i,
    },
    {
      name: 'last name',
      details: { firstName: 'Ada', lastName: '', postalCode: '35570' },
      error: /Last Name is required/i,
    },
    {
      name: 'postal code',
      details: { firstName: 'Ada', lastName: 'Lovelace', postalCode: '' },
      error: /Postal Code is required/i,
    },
  ];

  for (const field of requiredFields) {
    test(`checkout is blocked when ${field.name} is missing`, async ({
      cartPage,
      checkoutPage,
      page,
    }) => {
      await cartPage.checkout();
      await checkoutPage.submitDetails(field.details);

      await checkoutPage.expectError(field.error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }

  test('the order total equals item total plus tax', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.continueToOverview(CHECKOUT_DETAILS);

    const itemTotal = await checkoutPage.itemTotal();
    const tax = await checkoutPage.tax();
    const total = await checkoutPage.total();

    expect(
      equalMoney(total, itemTotal + tax),
      `Expected ${total} to equal ${itemTotal} + ${tax}`,
    ).toBe(true);
    expect(toCents(tax)).toBeGreaterThan(0);
  });

  test('cancelling from the overview returns to the product list', async ({
    cartPage,
    checkoutPage,
    page,
  }) => {
    await cartPage.checkout();
    await checkoutPage.continueToOverview(CHECKOUT_DETAILS);
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/inventory\.html/);
    // Cancelling must not discard the cart — losing it here is a conversion bug.
    await checkoutPage.expectCartCount(1);
  });

  test('a multi-item order carries every line through to the overview', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // Adds two more on top of the backpack from beforeEach.
    await cartPage.continueShopping.click();
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.addToCart(PRODUCTS.onesie);
    await inventoryPage.openCart();

    const cartNames = await cartPage.itemNames();
    expect(cartNames).toHaveLength(3);

    await cartPage.checkout();
    await checkoutPage.continueToOverview(CHECKOUT_DETAILS);

    for (const name of cartNames) {
      await expect(checkoutPage.page.getByText(name).first()).toBeVisible();
    }
  });
});
