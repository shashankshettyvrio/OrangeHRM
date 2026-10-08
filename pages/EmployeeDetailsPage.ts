import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Messages } from '../constants/Messages';

// The employee profile page (Personal Details, Job, ... tabs)
export class EmployeeDetailsPage extends BasePage {

    readonly jobTab: Locator;
    readonly jobTitleDropdown: Locator;
    readonly employmentStatusDropdown: Locator;
    readonly dropdownOptions: Locator;
    readonly saveButton: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.jobTab = page.getByRole('link', { name: 'Job' });
        this.jobTitleDropdown = page.locator('.oxd-input-group').filter({ hasText: 'Job Title' }).locator('.oxd-select-text');
        this.employmentStatusDropdown = page.locator('.oxd-input-group').filter({ hasText: 'Employment Status' }).locator('.oxd-select-text');
        this.dropdownOptions = page.getByRole('option');
        this.saveButton = page.getByRole('button', { name: 'Save' }).first();
        this.toastMessage = page.locator('.oxd-toast');
    }

    async openJobTab(): Promise<void> {
        await this.jobTab.click();
        await expect(this.page).toHaveURL(/viewJobDetails/);
    }

    // Option 0 is "-- Select --", so we pick option 1 (the first real value)
    async selectFirstJobTitle(): Promise<void> {
        await this.jobTitleDropdown.click();
        await this.dropdownOptions.nth(1).click();
    }

    async selectFirstEmploymentStatus(): Promise<void> {
        await this.employmentStatusDropdown.click();
        await this.dropdownOptions.nth(1).click();
    }

    async clickSave(): Promise<void> {
        await this.saveButton.click();
    }

    async verifyJobDetailsUpdated(): Promise<void> {
        await expect(this.toastMessage).toContainText(Messages.SUCCESSFULLY_UPDATED);
    }
}
