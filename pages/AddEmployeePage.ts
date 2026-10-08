import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddEmployeePage extends BasePage {

    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly employeeIdInput: Locator;
    readonly profilePictureInput: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.middleNameInput = page.getByPlaceholder('Middle Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        // The "Employee Id" box has no placeholder, so we find the field group by its label text
        this.employeeIdInput = page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
        this.profilePictureInput = page.locator('input[type="file"]');
        this.saveButton = page.getByRole('button', { name: 'Save' });
    }

    async addEmployee(firstName: string, middleName: string, lastName: string,
                      employeeId: string, profilePicture: string): Promise<void> {
        await this.firstNameInput.fill(firstName);
        await this.middleNameInput.fill(middleName);
        await this.lastNameInput.fill(lastName);
        await this.employeeIdInput.fill(employeeId);   // fill() replaces the auto-generated id
        await this.profilePictureInput.setInputFiles(profilePicture);
        await this.saveButton.click();
    }

    // After saving, OrangeHRM opens the new employee's "Personal Details" page
    async verifyEmployeeCreated(): Promise<void> {
        await expect(this.page).toHaveURL(/viewPersonalDetails/);
        await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
    }
}
