import { test } from '../../fixtures/fixtures';

// Start this test LOGGED OUT (empty session), because we want to test the login page itself
test.use({ storageState: { cookies: [], origins: [] } });

test('@smoke Login with valid credentials', async ({ loginPage, dashboardPage }) => {

    await loginPage.open();
    await loginPage.login(process.env.ORANGEHRM_USERNAME!, process.env.ORANGEHRM_PASSWORD!);

    await dashboardPage.verifyDashboardLoaded();

});
