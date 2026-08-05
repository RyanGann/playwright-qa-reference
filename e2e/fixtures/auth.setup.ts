import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from './users';
import { STORAGE_STATE } from './test';

/**
 * Signs in once for the whole run and saves the session.
 *
 * Every authenticated spec then starts already signed in, which removes a login
 * step — and its failure modes — from most of the suite. Sign-in itself is still
 * tested explicitly in auth.spec.ts.
 */
setup('authenticate as the standard user', async ({ page }) => {
  const login = new LoginPage(page);
  const inventory = new InventoryPage(page);

  await login.open();
  await login.signInExpectingSuccess(USERS.standard.username, USERS.standard.password);
  await inventory.expectLoaded();

  await page.context().storageState({ path: STORAGE_STATE });
});
