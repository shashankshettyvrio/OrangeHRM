/*
 * ============================================================================
 * TEST:      Time - Employee Timesheets
 * APIs:      GET /api/v2/time/employees/timesheets/list?limit=50&offset=0
 *                           (Time > Timesheets > Employee Timesheets - "Timesheets Pending Action" grid)
 *
 * VALIDATES: The call returns HTTP 200 within the response-time budget with a JSON "data"
 *            array and numeric meta.total; every timesheet row has an id, an employee,
 *            a status and a startDate/endDate period.
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
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'time-timesheets';
const ENDPOINTS = ['time_timesheets_list'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    apiGet('time_timesheets_list', '/time/employees/timesheets/list?limit=50&offset=0', {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
        'rows have employee, status and period': (b) =>
            b.data.every((t) => t.id && t.employee && t.status && t.status.id && t.startDate && t.endDate),
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
