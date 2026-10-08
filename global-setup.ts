import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Runs ONCE before all tests (see globalSetup in playwright.config.ts).
// It logs in and saves the cookies to playwright/.auth/user.json,
// so every test can start already logged in (storageState).
async function globalSetup() {

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(process.env.ORANGEHRM_BASE_URL + '/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill(process.env.ORANGEHRM_USERNAME!);
    await page.getByPlaceholder('Password').fill(process.env.ORANGEHRM_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard/index');

    // Save the logged-in session
    await page.context().storageState({ path: 'playwright/.auth/user.json' });

    await browser.close();
}

export default globalSetup;
