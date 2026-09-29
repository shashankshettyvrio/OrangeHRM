/*
 * ============================================================================
 * TEST:      Leave - Leave List page
 * APIs:      GET /api/v2/leave/leave-periods                                  (leave period dropdown)
 *            GET /api/v2/leave/leave-types?limit=0                            (leave type filter)
 *            GET /api/v2/leave/workweek?model=indexed                         (work week, for date pickers)
 *            GET /api/v2/leave/holidays?fromDate=<yyyy-01-01>&toDate=<yyyy-12-31>  (holidays, for date pickers)
 *            GET /api/v2/leave/employees/leave-requests?limit=50&offset=0&includeEmployees=onlyCurrent
 *                                                                              (Leave List grid)
 *            These are the calls the browser makes when Leave > Leave List opens.
 *
 * VALIDATES: Each call returns HTTP 200 within the response-time budget with a JSON "data"
 *            member; leave periods and leave types are non-empty arrays; the leave-requests
 *            grid is an array with meta.total and each request has an id and dates.
 *            The four lookup calls are sent in parallel, then the grid is loaded.
 *
 * SCENARIO:  Selected with -e SCENARIO=smoke|load|stress|spike (default: load).
 *            load   = ramp to 5 VUs, hold 1m          (baseline)
 *            stress = step 5 -> 10 -> 15 VUs          (find degradation)
 *            spike  = 1 VU, sudden burst to 15 VUs    (recovery behaviour)
 *            Each VU logs in once and reuses its session cookie.
 *
 * EXPECTED:  smoke/load: p95 < 2s, p99 < 3s, < 1% failed requests, > 99% checks passed.
 *            stress/spike: p95 < 4-5s and < 5% errors. (Measured baseline on the demo:
 *            p95 ~0.5s per endpoint at 5 VUs.)
 * ============================================================================
 */

import { apiBatch, apiGet, hasTotal, isArrayData, thinkTime } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'leave-list';
const ENDPOINTS = ['leave_periods', 'leave_types', 'leave_workweek', 'leave_holidays', 'leave_requests'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

const nonEmpty = (b) => Array.isArray(b.data) && b.data.length > 0;

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    const year = new Date().getUTCFullYear();

    apiBatch([
        { endpoint: 'leave_periods', path: '/leave/leave-periods', validations: { 'non-empty list': nonEmpty } },
        { endpoint: 'leave_types', path: '/leave/leave-types?limit=0', validations: { 'non-empty list': nonEmpty } },
        { endpoint: 'leave_workweek', path: '/leave/workweek?model=indexed', validations: { 'data is object/array': (b) => typeof b.data === 'object' && b.data !== null } },
        { endpoint: 'leave_holidays', path: `/leave/holidays?fromDate=${year}-01-01&toDate=${year}-12-31`, validations: { 'data is array': isArrayData } },
    ]);

    apiGet('leave_requests', '/leave/employees/leave-requests?limit=50&offset=0&includeEmployees=onlyCurrent', {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
        'requests have id and dates': (b) => b.data.every((r) => r.id && r.dates && r.dates.fromDate),
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
