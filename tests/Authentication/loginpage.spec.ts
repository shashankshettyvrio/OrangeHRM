import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import loginData from '../../test-data/login.json';

// FIX: run without the shared logged-in storageState; otherwise the login page redirects to the dashboard and the username field never appears.
test.use({ storageState: { cookies: [], origins: [] } });

test('Login with valid credentials', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate to Login Page
    await loginPage.navigateToLoginPage();

    // Login with valid credentials
    await loginPage.login(
        loginData.admin.username,
        loginData.admin.password
    );

    // Verify Dashboard is displayed
    await dashboardPage.verifyDashboardLoaded();

});