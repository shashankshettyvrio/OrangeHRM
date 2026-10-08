import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

// Admin > User Management > System Users page
export class AdminPage extends BasePage {

    readonly adminMenu: Locator;
    readonly addButton: Locator;
    readonly usernameSearchInput: Locator;
    readonly searchButton: Locator;
    readonly resultTable: Locator;

    constructor(page: Page) {
        super(page);
        this.adminMenu = page.getByRole('link', { name: 'Admin' });
        this.addButton = page.getByRole('button', { name: 'Add' });
        this.usernameSearchInput = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('input');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resultTable = page.locator('.oxd-table-body');
    }

    // Click "Admin" in the left menu
    async openAdmin(): Promise<void> {
        await this.openSideMenuIfHidden();
        await this.adminMenu.click();
        await expect(this.page).toHaveURL(/admin\/viewSystemUsers/);
    }

    // Click the green "+ Add" button. This opens the Add User page.
    async clickAddUser(): Promise<void> {
        await this.addButton.click();
    }

    async searchUser(username: string): Promise<void> {
        await this.openSearchFiltersIfHidden();
        await this.usernameSearchInput.fill(username);
        await this.searchButton.click();
    }

    async verifyUserInResults(username: string): Promise<void> {
        await expect(this.resultTable.getByText(username, { exact: true })).toBeVisible();
    }
}
