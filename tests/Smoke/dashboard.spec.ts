import { test } from '../../fixtures/fixtures';

// We are already logged in (global-setup.ts + storageState)
test('@smoke Verify Dashboard Loads', async ({ dashboardPage }) => {

    await dashboardPage.open();
    await dashboardPage.verifyDashboardLoaded();

});
