import { test } from '../../fixtures/fixtures';

test('@smoke Admin - Verify Navigation to Add User page', async ({ dashboardPage, adminPage, addUserPage }) => {

    await dashboardPage.open();
    await dashboardPage.verifyDashboardLoaded();

    await adminPage.openAdmin();
    await adminPage.clickAddUser();

    await addUserPage.verifyAddUserPageOpened();

});
