import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Routes } from '../constants/Routes';

export class DashboardPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    async open(): Promise<void> {
        await this.page.goto(Routes.DASHBOARD);
    }

    async verifyDashboardLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/dashboard\/index/);
    }
}
