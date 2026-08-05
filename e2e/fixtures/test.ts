import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

export const STORAGE_STATE = 'e2e/.auth/standard-user.json';

interface Pages {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

interface Options {
  /** Start signed in (default) or anonymous. */
  authenticated: boolean;
}

/**
 * Custom fixtures.
 *
 * Page objects are constructed once per test and injected, so specs contain no
 * `new SomePage(page)` noise and no beforeEach chains. Setting `authenticated`
 * to false in a describe block opts a spec out of the shared session.
 */
export const test = base.extend<Pages & Options>({
  authenticated: [true, { option: true }],

  storageState: async ({ authenticated }, use) => {
    await use(authenticated ? STORAGE_STATE : { cookies: [], origins: [] });
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
