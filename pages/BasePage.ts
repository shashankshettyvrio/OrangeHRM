import { Page } from '@playwright/test';

export class BasePage 
{

    protected readonly page: Page;

    constructor(page: Page) 
    {
        this.page = page;
    }

    async navigate(url: string): Promise<void> 
    {
        await this.page.goto(url);
    }

    // FIX: on narrow (mobile) viewports the side menu is collapsed behind a hamburger button; open it so menu items become clickable.
    async openSideMenuIfCollapsed(): Promise<void>
    {
        // FIX: '.oxd-main-menu' stays "visible" in the DOM while off-screen, so only the hamburger's visibility is used to detect a collapsed menu.
        const toggle = this.page.locator('.oxd-topbar-header-hamburger') /* FIX: the hamburger is an <i> icon, not a <button> */;
        // FIX: wait for the top bar to render first; isVisible() returns immediately, so the hamburger was skipped when the page had not loaded yet.
        await this.page.locator('.oxd-topbar-header').waitFor({ state: 'visible' });
        if (await toggle.isVisible())
        {
            await toggle.click();
        }
    }
}
