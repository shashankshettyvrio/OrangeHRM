/*
 * ============================================================================
 * TEST:      Attendance - Employee Attendance Records summary
 * APIs:      GET /api/v2/attendance/employees/summary?limit=50&offset=0&date=<today>
 *                           (Time > Attendance > Employee Records grid)
 *
 * VALIDATES: The call returns HTTP 200 within the response-time budget with a JSON "data"
 *            array and numeric meta.total; every row has an empNumber and a "sum" object with
 *            hours/minutes (the total attended time the grid displays). The date is today (UTC).
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

import { apiGet, hasTotal, isArrayData, thinkTime, today } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'attendance-summary';
const ENDPOINTS = ['attendance_employee_summary'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    apiGet('attendance_employee_summary', `/attendance/employees/summary?limit=50&offset=0&date=${today()}`, {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
        'rows have attended hours/minutes': (b) =>
            b.data.every((r) => typeof r.empNumber === 'number' && r.sum && typeof r.sum.hours === 'number' && typeof r.sum.minutes === 'number'),
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
