import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LogoutPage } from '../pages/LogoutPage';
import { PIMPage } from '../pages/PIMPage';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { EmployeeDetailsPage } from '../pages/EmployeeDetailsPage';
import { AdminPage } from '../pages/AdminPage';
import { AddUserPage } from '../pages/AddUserPage';

// Fixtures create the page objects for us.
// A test just asks for them by name, for example: async ({ loginPage, dashboardPage }) => { ... }
// so we never have to write "new LoginPage(page)" inside a test.
type Pages = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    logoutPage: LogoutPage;
    pimPage: PIMPage;
    addEmployeePage: AddEmployeePage;
    employeeDetailsPage: EmployeeDetailsPage;
    adminPage: AdminPage;
    addUserPage: AddUserPage;
};

export const test = base.extend<Pages>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
    logoutPage: async ({ page }, use) => {
        await use(new LogoutPage(page));
    },
    pimPage: async ({ page }, use) => {
        await use(new PIMPage(page));
    },
    addEmployeePage: async ({ page }, use) => {
        await use(new AddEmployeePage(page));
    },
    employeeDetailsPage: async ({ page }, use) => {
        await use(new EmployeeDetailsPage(page));
    },
    adminPage: async ({ page }, use) => {
        await use(new AdminPage(page));
    },
    addUserPage: async ({ page }, use) => {
        await use(new AddUserPage(page));
    }
});

export { expect };
