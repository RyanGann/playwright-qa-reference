import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from '../utils/money';

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.error = page.locator('[data-test="error"]');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.confirmation = page.locator('.complete-header');
  }

  async fillDetails(details: Partial<CheckoutDetails>): Promise<void> {
    if (details.firstName !== undefined) await this.firstName.fill(details.firstName);
    if (details.lastName !== undefined) await this.lastName.fill(details.lastName);
    if (details.postalCode !== undefined) await this.postalCode.fill(details.postalCode);
  }

  async submitDetails(details: Partial<CheckoutDetails>): Promise<void> {
    await this.fillDetails(details);
    await this.continueButton.click();
  }

  async continueToOverview(details: CheckoutDetails): Promise<void> {
    await this.submitDetails(details);
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toContainText(message);
  }

  /** Parses the money out of "Item total: $29.99" and friends. */
  private async amountFrom(label: Locator): Promise<number> {
    const text = (await label.textContent()) ?? '';
    return parseMoney(text);
  }

  async itemTotal(): Promise<number> {
    return this.amountFrom(this.subtotalLabel);
  }

  async tax(): Promise<number> {
    return this.amountFrom(this.taxLabel);
  }

  async total(): Promise<number> {
    return this.amountFrom(this.totalLabel);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.confirmation).toBeVisible();
  }
}
