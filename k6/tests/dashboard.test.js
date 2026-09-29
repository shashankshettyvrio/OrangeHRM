/*
 * ============================================================================
 * TEST:      Dashboard widgets API
 * APIs:      GET /api/v2/dashboard/employees/action-summary   (My Actions widget)
 *            GET /api/v2/dashboard/shortcuts                  (Quick Launch widget)
 *            GET /api/v2/dashboard/employees/leaves?date=      (Employees on Leave Today)
 *            GET /api/v2/dashboard/employees/time-at-work      (Time at Work widget)
 *            GET /api/v2/dashboard/employees/subunit           (Employee Distribution by Sub Unit)
 *            GET /api/v2/dashboard/employees/locations         (Employee Distribution by Location)
 *            These are the exact calls the browser makes when /dashboard/index loads.
 *
 * VALIDATES: Each widget API returns HTTP 200 within the response-time budget, with a JSON
 *            "data" member; action-summary/leaves/time-at-work/subunit return arrays,
 *            shortcuts returns an object of feature flags, time-at-work returns 7 days.
 *            The six calls are sent in parallel (http.batch) to mirror a real page load.
 *
 * SCENARIO:  Selected with -e SCENARIO=smoke|load|stress|spike (default: load).
 *            load   = ramp to 5 VUs, hold 1m          (baseline)
 *            stress = step 5 -> 10 -> 15 VUs          (find degradation)
 *            spike  = 1 VU, sudden burst to 15 VUs    (recovery behaviour)
 *            Each VU logs in once and reuses its session cookie.
 *
 * EXPECTED:  All thresholds pass for smoke/load: p95 < 2s, p99 < 3s, < 1% failed requests,
 *            > 99% checks passed. Under stress/spike, p95 < 4-5s and < 5% errors.
 * ============================================================================
 */

import { apiBatch, isArrayData, thinkTime, today } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'dashboard';
const ENDPOINTS = [
    'dashboard_action_summary',
    'dashboard_shortcuts',
    'dashboard_employees_on_leave',
    'dashboard_time_at_work',
    'dashboard_subunit_distribution',
    'dashboard_location_distribution',
];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    const date = today();
    const time = new Date().toISOString().slice(11, 16);

    apiBatch([
        { endpoint: 'dashboard_action_summary', path: '/dashboard/employees/action-summary', validations: { 'data is array': isArrayData } },
        { endpoint: 'dashboard_shortcuts', path: '/dashboard/shortcuts', validations: { 'data is object': (b) => typeof b.data === 'object' && !Array.isArray(b.data) } },
        { endpoint: 'dashboard_employees_on_leave', path: `/dashboard/employees/leaves?date=${date}`, validations: { 'data is array': isArrayData } },
        {
            endpoint: 'dashboard_time_at_work',
            path: `/dashboard/employees/time-at-work?timezoneOffset=0&currentDate=${date}&currentTime=${time}`,
            validations: { 'returns 7 work days': (b) => Array.isArray(b.data) && b.data.length === 7 },
        },
        { endpoint: 'dashboard_subunit_distribution', path: '/dashboard/employees/subunit', validations: { 'data is array': isArrayData } },
        { endpoint: 'dashboard_location_distribution', path: '/dashboard/employees/locations', validations: { 'data is array': isArrayData } },
    ]);

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
