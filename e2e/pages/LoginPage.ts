import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The sign-in screen.
 *
 * Locators prefer accessible attributes (placeholder, role) over CSS so that a
 * styling refactor does not break the suite.
 */
export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.submit = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async open(): Promise<void> {
    await this.goto('/');
    await expect(this.submit).toBeVisible();
  }

  /** Fills and submits the form. Does not assert the outcome — the test does. */
  async signIn(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  async signInExpectingSuccess(username: string, password: string): Promise<void> {
    await this.signIn(username, password);
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toContainText(message);
  }
}
