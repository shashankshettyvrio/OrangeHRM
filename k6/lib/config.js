// Shared configuration for every k6 test.
// Reuses the same environment variable names as the Playwright framework (.env),
// and falls back to test-data/login.json for credentials so tests run out of the box.

const loginData = JSON.parse(open('../../test-data/login.json'));

export const BASE_URL = (__ENV.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com').replace(/\/+$/, '');
export const APP_URL = `${BASE_URL}/web/index.php`;
export const API_URL = `${APP_URL}/api/v2`;

export const CREDENTIALS = {
    username: __ENV.ORANGEHRM_USERNAME || loginData.admin.username,
    password: __ENV.ORANGEHRM_PASSWORD || loginData.admin.password,
};

// Selected load profile: smoke | load | stress | spike (default: load)
export const SCENARIO = (__ENV.SCENARIO || 'load').toLowerCase();

// Per-request response-time budget used in checks (ms). Defaults to the scenario's p99 threshold,
// so a single slow response under stress/spike is only flagged when it is a real outlier;
// the p95/p99 thresholds in scenarios.js remain the actual pass/fail gate.
const DEFAULT_CHECK_MAX_MS = { smoke: 3000, load: 3000, stress: 6000, spike: 8000 };
export const CHECK_MAX_MS = Number(__ENV.CHECK_MAX_MS || DEFAULT_CHECK_MAX_MS[SCENARIO] || 3000);

// Think time between iterations (seconds) - keeps traffic polite on the public demo
export const THINK_TIME_MIN = Number(__ENV.THINK_TIME_MIN || 1);
export const THINK_TIME_MAX = Number(__ENV.THINK_TIME_MAX || 3);

export const Routes = {
    LOGIN: '/auth/login',
    VALIDATE: '/auth/validate',
    LOGOUT: '/auth/logout',
    DASHBOARD: '/dashboard/index',
};
