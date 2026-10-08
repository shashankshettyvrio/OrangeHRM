import { test, expect } from '@playwright/test';
import { Routes } from '../../constants/Routes';

// The "request" fixture sends API calls directly (no browser page).
// It uses the same baseURL and the same logged-in cookies (storageState) as the UI tests.
test('@regression Validate dashboard employee action summary API', async ({ request }) => {

    const response = await request.get(Routes.DASHBOARD_ACTION_SUMMARY_API);

    // Check the status code
    expect(response.status()).toBe(200);

    // Check the JSON body: it must have a "data" list with at least one item
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

});
