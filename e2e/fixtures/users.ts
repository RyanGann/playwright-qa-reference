/**
 * Test accounts and the behaviour each one is expected to exhibit.
 *
 * Keeping the expectation next to the credential means a spec reads as a
 * statement about behaviour rather than a list of magic strings.
 */
export interface TestUser {
  username: string;
  password: string;
  description: string;
}

const PASSWORD = process.env.TEST_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: {
    username: 'standard_user',
    password: PASSWORD,
    description: 'behaves normally',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORD,
    description: 'is refused at sign-in',
  },
  problem: {
    username: 'problem_user',
    password: PASSWORD,
    description: 'has known UI defects — used for negative coverage',
  },
  slow: {
    username: 'performance_glitch_user',
    password: PASSWORD,
    description: 'responds slowly — proves the suite waits on conditions, not timers',
  },
} as const satisfies Record<string, TestUser>;

export const INVALID_CREDENTIALS = [
  {
    name: 'unknown username',
    username: 'no_such_user',
    password: PASSWORD,
    error: /Username and password do not match/i,
  },
  {
    name: 'wrong password',
    username: USERS.standard.username,
    password: 'wrong_password',
    error: /Username and password do not match/i,
  },
  {
    name: 'empty username',
    username: '',
    password: PASSWORD,
    error: /Username is required/i,
  },
  {
    name: 'empty password',
    username: USERS.standard.username,
    password: '',
    error: /Password is required/i,
  },
] as const;

/** Products referenced by name so a price change never breaks a test. */
export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTshirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
} as const;

export const CHECKOUT_DETAILS = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '35570',
} as const;
