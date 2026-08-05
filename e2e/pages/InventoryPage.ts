import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from '../utils/money';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.items = page.locator('.inventory_item');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
  }

  async open(): Promise<void> {
    await this.goto('/inventory.html');
    await this.expectLoaded();
  }

  /** Single definition of "the product list is up", reused by specs and setup. */
  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  /** Scopes to a single product card so actions cannot hit the wrong row. */
  card(productName: string): Locator {
    return this.items.filter({ hasText: productName });
  }

  async addToCart(productName: string): Promise<void> {
    const card = this.card(productName);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    // Web-first assertion: the button flipping to Remove is the signal that the
    // action completed. No sleep, no polling loop.
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
  }

  async removeFromCart(productName: string): Promise<void> {
    const card = this.card(productName);
    await card.getByRole('button', { name: 'Remove' }).click();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async productNames(): Promise<string[]> {
    return this.items.locator('.inventory_item_name').allTextContents();
  }

  async productPrices(): Promise<number[]> {
    const raw = await this.items.locator('.inventory_item_price').allTextContents();
    return raw.map(parseMoney);
  }

  async openProduct(productName: string): Promise<void> {
    await this.card(productName).locator('.inventory_item_name').click();
    await expect(this.page).toHaveURL(/inventory-item\.html/);
  }
}
