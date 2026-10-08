import { test } from '../../fixtures/fixtures';

// Use a fresh session for this test. If we logged out of the SHARED session,
// every test that runs after this one would no longer be logged in.
test.use({ storageState: { cookies: [], origins: [] } });

test('@smoke Logout', async ({ loginPage, dashboardPage, logoutPage }) => {

    // Step 1: log in
    await loginPage.open();
    await loginPage.login(process.env.ORANGEHRM_USERNAME!, process.env.ORANGEHRM_PASSWORD!);
    await dashboardPage.verifyDashboardLoaded();

    // Step 2: log out
    await logoutPage.logout();
    await logoutPage.verifyLoggedOut();

    // Step 3: the dashboard must not open any more without logging in again
    await logoutPage.verifyDashboardNotAccessible();

});
