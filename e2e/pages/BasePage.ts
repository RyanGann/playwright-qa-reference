import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Shared behaviour for every page object.
 *
 * Anything that appears on more than one screen lives here so specs never reach
 * for a raw selector.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  protected constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * The badge is absent — not zero — when the cart is empty, so callers need a
   * single helper rather than two different assertions.
   */
  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async signOut(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
  }
}
