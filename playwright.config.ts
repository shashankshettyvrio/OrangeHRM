import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load ORANGEHRM_BASE_URL, ORANGEHRM_USERNAME and ORANGEHRM_PASSWORD from the .env file
dotenv.config();

export default defineConfig({

  // Folder where Playwright looks for *.spec.ts files
  testDir: './tests',

  // Max time for one test. The public demo site is slow, so we allow 90 seconds.
  timeout: 90000,

  // Max time one expect() keeps retrying (default is 5 seconds; saving on the demo site can take longer)
  expect: { timeout: 20000 },

  // Run tests one by one (the demo site is shared and slow)
  workers: 1,

  // Retry a failed test once on CI, never locally
  retries: process.env.CI ? 1 : 0,

  // Reports: list = console output, html = Playwright report, allure = Allure report
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright']
  ],

  // Runs once before all tests: logs in and saves the session to playwright/.auth/user.json
  globalSetup: './global-setup.ts',

  // Settings shared by every test
  use: {
    baseURL: process.env.ORANGEHRM_BASE_URL,  // lets us write page.goto('/web/index.php/...')
    headless: process.env.CI ? true : false,  // hidden browser on CI, visible browser locally
    storageState: 'playwright/.auth/user.json', // start every test already logged in
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },

  // The browsers / devices to run on. Pick one with --project=<name>
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } }
  ]

});
