import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from '../utils/money';

export class CartPage extends BasePage {
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShopping: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShopping = page.locator('[data-test="continue-shopping"]');
  }

  async open(): Promise<void> {
    await this.goto('/cart.html');
    await expect(this.checkoutButton).toBeVisible();
  }

  row(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async itemNames(): Promise<string[]> {
    return this.items.locator('.inventory_item_name').allTextContents();
  }

  async subtotal(): Promise<number> {
    const prices = await this.items.locator('.inventory_item_price').allTextContents();
    return prices.map(parseMoney).reduce((a, b) => a + b, 0);
  }

  async remove(productName: string): Promise<void> {
    const before = await this.items.count();
    await this.row(productName).getByRole('button', { name: 'Remove' }).click();
    await expect(this.items).toHaveCount(before - 1);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }
}
