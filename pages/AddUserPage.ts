import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Messages } from '../constants/Messages';

// Admin > Add User page
export class AddUserPage extends BasePage {

    readonly heading: Locator;
    readonly userRoleDropdown: Locator;
    readonly statusDropdown: Locator;
    readonly employeeNameInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly saveButton: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole('heading', { name: 'Add User' });
        this.userRoleDropdown = page.locator('.oxd-input-group').filter({ hasText: 'User Role' }).locator('.oxd-select-text');
        this.statusDropdown = page.locator('.oxd-input-group').filter({ hasText: 'Status' }).locator('.oxd-select-text');
        this.employeeNameInput = page.getByPlaceholder('Type for hints...');
        this.usernameInput = page.locator('.oxd-input-group').filter({ hasText: 'Username' }).locator('input');
        this.passwordInput = page.locator('.oxd-input-group').filter({ hasText: /^Password/ }).locator('input');
        this.confirmPasswordInput = page.locator('.oxd-input-group').filter({ hasText: 'Confirm Password' }).locator('input');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.toastMessage = page.locator('.oxd-toast');
    }

    async verifyAddUserPageOpened(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async selectUserRole(role: string): Promise<void> {
        await this.userRoleDropdown.click();
        await this.page.getByRole('option', { name: role }).click();
    }

    async selectStatus(status: string): Promise<void> {
        await this.statusDropdown.click();
        await this.page.getByRole('option', { name: status }).click();
    }

    // Type the name, wait for the suggestion list, then click the matching suggestion
    async selectEmployee(employeeName: string): Promise<void> {
        await this.employeeNameInput.fill(employeeName);
        await this.page.getByRole('option', { name: employeeName }).click();
    }

    async addUser(role: string, employeeName: string, status: string,
                  username: string, password: string): Promise<void> {
        await this.selectUserRole(role);
        await this.selectEmployee(employeeName);
        await this.selectStatus(status);
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(password);
        await this.saveButton.click();
    }

    async verifyUserSaved(): Promise<void> {
        await expect(this.toastMessage).toContainText(Messages.SUCCESSFULLY_SAVED);
        await expect(this.page).toHaveURL(/admin\/viewSystemUsers/);
    }
}
