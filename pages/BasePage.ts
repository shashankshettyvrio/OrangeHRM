import { Page } from '@playwright/test';

// Parent class for every page object.
// It stores the Playwright "page" and holds code that many pages need.
export class BasePage {

    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // On small (mobile) screens the left side menu is hidden behind a "hamburger" icon.
    // This opens the menu if that icon is shown. On desktop it does nothing.
    async openSideMenuIfHidden(): Promise<void> {
        await this.page.locator('.oxd-topbar-header').waitFor();

        const hamburgerIcon = this.page.locator('.oxd-topbar-header-hamburger');
        if (await hamburgerIcon.isVisible()) {
            await hamburgerIcon.click();
        }
    }

    // On small (mobile) screens the search filters above a table (Employee List, System Users)
    // are folded away. This clicks the small arrow button to show them. On desktop it does nothing.
    async openSearchFiltersIfHidden(): Promise<void> {
        await this.page.locator('.oxd-table-filter').waitFor();

        const searchButton = this.page.getByRole('button', { name: 'Search' });
        if (!(await searchButton.isVisible())) {
            await this.page.locator('.oxd-table-filter-header-options button').click();
        }
    }
}
