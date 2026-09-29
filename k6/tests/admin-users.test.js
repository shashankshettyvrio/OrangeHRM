/*
 * ============================================================================
 * TEST:      Admin - System Users
 * APIs:      GET /api/v2/admin/users?limit=50&offset=0&sortField=u.userName&sortOrder=ASC
 *                                                   (Admin > User Management > Users grid)
 *            GET /api/v2/admin/users?limit=50&offset=0&username=<user>
 *                                                   (Users grid filtered by username)
 *
 * VALIDATES: Both calls return HTTP 200 within the response-time budget with a JSON "data"
 *            array and numeric meta.total; list rows contain userName and userRole; the
 *            username filter returns at least one row and every row matches the requested
 *            username. The filtered username is the login user (ORANGEHRM_USERNAME /
 *            test-data/login.json), which is guaranteed to exist.
 *
 * SCENARIO:  Selected with -e SCENARIO=smoke|load|stress|spike (default: load).
 *            load   = ramp to 5 VUs, hold 1m          (baseline)
 *            stress = step 5 -> 10 -> 15 VUs          (find degradation)
 *            spike  = 1 VU, sudden burst to 15 VUs    (recovery behaviour)
 *            Each VU logs in once and reuses its session cookie.
 *
 * EXPECTED:  smoke/load: p95 < 2s, p99 < 3s, < 1% failed requests, > 99% checks passed.
 *            stress/spike: p95 < 4-5s and < 5% errors.
 * ============================================================================
 */

import { apiGet, hasTotal, isArrayData, thinkTime } from '../lib/api.js';
import { CREDENTIALS } from '../lib/config.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'admin-users';
const ENDPOINTS = ['admin_user_list', 'admin_user_search'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    apiGet('admin_user_list', '/admin/users?limit=50&offset=0&sortField=u.userName&sortOrder=ASC', {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
        'rows have userName and userRole': (b) => b.data.every((u) => typeof u.userName === 'string' && u.userRole && u.userRole.name),
    });

    thinkTime();

    const username = CREDENTIALS.username;
    apiGet('admin_user_search', `/admin/users?limit=50&offset=0&username=${encodeURIComponent(username)}`, {
        'data is array': isArrayData,
        'finds the user': (b) => b.data.length >= 1,
        'every row matches username': (b) => b.data.every((u) => u.userName.toLowerCase() === username.toLowerCase()),
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
