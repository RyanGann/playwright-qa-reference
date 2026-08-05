/**
 * Currency helpers.
 *
 * Money in tests is a common source of false failures: floating-point drift
 * makes `29.99 + 9.99 === 39.98` unreliable, so comparisons round to cents.
 */

/** Extracts the first currency amount from a string. "Total: $32.39" -> 32.39 */
export function parseMoney(text: string): number {
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    throw new Error(`No currency amount found in: "${text}"`);
  }
  return Number.parseFloat(match[0]);
}

/** Rounds to cents so floating-point noise never fails an assertion. */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** True when two amounts match to the cent. */
export function equalMoney(a: number, b: number): boolean {
  return toCents(a) === toCents(b);
}

export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}
