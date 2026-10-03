import { test, expect } from '../fixtures/test';
import { USERS, INVALID_CREDENTIALS } from '../fixtures/users';

/**
 * Sign-in, including the cases that matter more than the happy path: refused
 * credentials, locked accounts, and whether a signed-out user can reach a
 * protected route by typing the URL.
 */
test.describe('authentication', () => {
  // These tests need to start signed out.
  test.use({ authenticated: false });

  test('a valid user reaches the product list', async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.signInExpectingSuccess(USERS.standard.username, USERS.standard.password);

    await inventoryPage.expectLoaded();
  });

  // Data-driven: one source of truth in users.ts, four generated tests, each
  // reported separately so a failure names the exact case.
  for (const credentials of INVALID_CREDENTIALS) {
    test(`sign-in is refused: ${credentials.name}`, async ({ loginPage, page }) => {
      await loginPage.open();
      await loginPage.signIn(credentials.username, credentials.password);

      await loginPage.expectError(credentials.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('a locked-out account is refused with a clear message', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.signIn(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectError(/locked out/i);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('a signed-out user cannot reach the product list directly', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    // Whatever the mechanism, the user must not see product data.
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.submit).toBeVisible();
  });

  test('a slow account still completes sign-in without a fixed wait', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.open();
    await loginPage.signIn(USERS.slow.username, USERS.slow.password);

    // performance_glitch_user responds several seconds late. Nothing here sleeps:
    // the assertion waits on the condition, which is the whole point.
    await expect(inventoryPage.title).toHaveText('Products', { timeout: 20_000 });
  });
});

test.describe('sign-out', () => {
  test('signing out returns the user to the sign-in screen', async ({
    inventoryPage,
    loginPage,
    page,
  }) => {
    await inventoryPage.open();
    await inventoryPage.signOut();

    await expect(loginPage.submit).toBeVisible();
    // And the session is genuinely gone, not just visually.
    await page.goto('/inventory.html');
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.submit).toBeVisible();
  });
});
