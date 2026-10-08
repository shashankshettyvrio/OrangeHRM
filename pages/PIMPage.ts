import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

// PIM = the Employee module of OrangeHRM (Employee List page)
export class PIMPage extends BasePage {

    readonly pimMenu: Locator;
    readonly addButton: Locator;
    readonly employeeIdInput: Locator;
    readonly searchButton: Locator;
    readonly confirmDeleteButton: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.pimMenu = page.getByRole('link', { name: 'PIM' });
        this.addButton = page.getByRole('button', { name: 'Add' });
        this.employeeIdInput = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
        this.toastMessage = page.locator('.oxd-toast');
    }

    // Click "PIM" in the left menu. This opens the Employee List page.
    async openPIM(): Promise<void> {
        await this.openSideMenuIfHidden();
        await this.pimMenu.click();
        await expect(this.page).toHaveURL(/pim\/viewEmployeeList/);
    }

    // Click the green "+ Add" button. This opens the Add Employee page.
    async clickAddEmployee(): Promise<void> {
        await this.addButton.click();
    }

    async searchByEmployeeId(employeeId: string): Promise<void> {
        await this.openSearchFiltersIfHidden();
        await this.employeeIdInput.fill(employeeId);
        await this.searchButton.click();
    }

    // Find the table row that contains the employee id and click its trash (delete) icon
    async deleteEmployee(employeeId: string): Promise<void> {
        const employeeRow = this.page.locator('.oxd-table-card').filter({ hasText: employeeId });
        await employeeRow.locator('.bi-trash').click();
        await this.confirmDeleteButton.click();
    }

    async verifyToastMessage(message: string): Promise<void> {
        await expect(this.toastMessage).toContainText(message);
    }
}
