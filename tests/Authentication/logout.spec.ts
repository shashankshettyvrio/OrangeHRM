import { test } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { LogoutPage } from '../../pages/LogoutPage';
// FIX: import LoginPage and login data so this test uses its own session.
import { LoginPage } from '../../pages/LoginPage';
import loginData from '../../test-data/login.json';

// FIX: use a fresh session; logging out with the shared storageState invalidated it server-side and broke later tests (Smoke, Employee E2E).
test.use({ storageState: { cookies: [], origins: [] } });

test('Logout', async ({ page }) => {

    const dashboardPage = new DashboardPage(page);
    const logoutPage = new LogoutPage(page);

    // FIX: log in with a dedicated session instead of relying on the shared one.
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.login(loginData.admin.username, loginData.admin.password);

    await dashboardPage.verifyDashboardLoaded();
    await logoutPage.logout();
    await logoutPage.verifyLogout();
    await logoutPage.verifySessionInvalidated();

});