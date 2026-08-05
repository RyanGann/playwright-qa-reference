import { test, expect } from '../fixtures/test';
import { PRODUCTS } from '../fixtures/users';

test.describe('product listing', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('every product shows a name, price, and add-to-cart control', async ({ inventoryPage }) => {
    const count = await inventoryPage.items.count();
    expect(count).toBeGreaterThan(0);

    // Soft assertions: one missing price should not hide the other five.
    for (let i = 0; i < count; i++) {
      const card = inventoryPage.items.nth(i);
      await expect.soft(card.locator('.inventory_item_name')).not.toBeEmpty();
      await expect.soft(card.locator('.inventory_item_price')).toContainText('$');
      await expect.soft(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    }
  });

  const sortCases = [
    {
      option: 'az' as const,
      label: 'name A to Z',
      check: (names: string[]) => expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b))),
    },
    {
      option: 'za' as const,
      label: 'name Z to A',
      check: (names: string[]) => expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a))),
    },
  ];

  for (const { option, label, check } of sortCases) {
    test(`sorting by ${label} orders the list correctly`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      check(await inventoryPage.productNames());
    });
  }

  test('sorting by price low to high orders the list correctly', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorting by price high to low orders the list correctly', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('adding and removing a product keeps the badge accurate', async ({ inventoryPage }) => {
    await inventoryPage.expectCartCount(0);

    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.expectCartCount(2);

    await inventoryPage.removeFromCart(PRODUCTS.backpack);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.removeFromCart(PRODUCTS.bikeLight);
    await inventoryPage.expectCartCount(0);
  });

  test('cart contents survive a page reload', async ({ inventoryPage, page }) => {
    await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
    await inventoryPage.expectCartCount(1);

    await page.reload();

    await inventoryPage.expectCartCount(1);
    await expect(
      inventoryPage.card(PRODUCTS.fleeceJacket).getByRole('button', { name: 'Remove' }),
    ).toBeVisible();
  });

  test('opening a product shows its detail page', async ({ inventoryPage, page }) => {
    await inventoryPage.openProduct(PRODUCTS.onesie);

    await expect(page.getByText(PRODUCTS.onesie)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to products' })).toBeVisible();
  });
});
