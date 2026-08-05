import { test, expect } from '../fixtures/test';
import { PRODUCTS } from '../fixtures/users';
import { equalMoney } from '../utils/money';

test.describe('cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    // Each test builds the state it needs, so the suite is order-independent
    // and safe to run fully parallel.
    await inventoryPage.open();
  });

  test('the cart lists exactly what was added', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.boltTshirt);
    await inventoryPage.openCart();

    const names = await cartPage.itemNames();
    expect(names).toHaveLength(2);
    expect(names).toContain(PRODUCTS.backpack);
    expect(names).toContain(PRODUCTS.boltTshirt);
  });

  test('removing an item from the cart updates the badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.openCart();

    await cartPage.remove(PRODUCTS.backpack);

    await expect(cartPage.items).toHaveCount(1);
    await cartPage.expectCartCount(1);
    expect(await cartPage.itemNames()).not.toContain(PRODUCTS.backpack);
  });

  test('empty-cart checkout is permitted — pinned as a known defect', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.open();
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.expectCartCount(0);

    // The application lets a shopper start checkout with nothing in the cart.
    // On a client engagement this is a defect report, not a passing test. It is
    // pinned here deliberately: if the behaviour is ever corrected, this test
    // fails and we find out immediately rather than months later.
    await cartPage.checkout();
    await expect(checkoutPage.continueButton).toBeVisible();
  });

  test('continue shopping returns to the product list with the cart intact', async ({
    inventoryPage,
    cartPage,
    page,
  }) => {
    await inventoryPage.addToCart(PRODUCTS.onesie);
    await inventoryPage.openCart();

    await cartPage.continueShopping.click();

    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.expectCartCount(1);
  });

  test('the cart subtotal equals the sum of its line items', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
    await inventoryPage.openCart();

    const lineItemTotal = await cartPage.subtotal();
    await cartPage.checkout();
    await checkoutPage.continueToOverview({
      firstName: 'Ada',
      lastName: 'Lovelace',
      postalCode: '35570',
    });

    // Rounded to cents — comparing raw floats here is a classic false failure.
    expect(equalMoney(await checkoutPage.itemTotal(), lineItemTotal)).toBe(true);
  });
});
