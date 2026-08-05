import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  // Tests own their state, so they are safe to run in parallel.
  fullyParallel: true,
  // A stray .only should fail the pipeline, not silently skip the suite.
  forbidOnly: CI,
  // One retry on CI to separate genuine failures from infrastructure noise.
  // A test that only passes on retry is reported as flaky, not counted as green.
  retries: CI ? 1 : 0,
  workers: CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    // Artifacts only on failure: a red run is debuggable without reproducing it,
    // and a green run does not fill the runner with gigabytes of video.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // Signs in once and writes storage state; every authenticated project reuses it.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
  ],
});
