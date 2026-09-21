import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({

  // FIX: raised per-test timeout from the 30s default to 90s; the public demo site is slow and the multi-step Add User flow (add employee + add user + search) legitimately exceeds 30s.
  timeout: 90000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 
  [
    ['html'],
    ['allure-playwright']
  ],
  globalSetup: './global-setup.ts',

  use: {

    baseURL: process.env.ORANGEHRM_BASE_URL,
    headless: process.env.CI ? true : false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'

  },

projects: [

{
    name: 'chromium',

    use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json'
    }
},
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      storageState: 'playwright/.auth/user.json'
    }
  },

{
  name: 'mobile-chrome',
  use: {
    ...devices['Pixel 5'],
    storageState: 'playwright/.auth/user.json'
  }
},

  {
    name: 'mobile-safari',
    use: {
      ...devices['iPhone 13'],
      storageState: 'playwright/.auth/user.json'
    }
  }

]

});