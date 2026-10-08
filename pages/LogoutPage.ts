import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Routes } from '../constants/Routes';

export class LogoutPage extends BasePage {

    readonly userDropdown: Locator;
    readonly logoutOption: Locator;

    constructor(page: Page) {
        super(page);
        // The profile picture + name in the top right corner
        this.userDropdown = page.locator('.oxd-userdropdown-tab');
        this.logoutOption = page.getByRole('menuitem', { name: 'Logout' });
    }

    async logout(): Promise<void> {
        await this.userDropdown.click();
        await this.logoutOption.click();
    }

    async verifyLoggedOut(): Promise<void> {
        await expect(this.page).toHaveURL(/auth\/login/);
    }

    // After logout, opening the dashboard must send us back to the login page
    async verifyDashboardNotAccessible(): Promise<void> {
        await this.page.goto(Routes.DASHBOARD);
        await expect(this.page).toHaveURL(/auth\/login/);
    }
}
