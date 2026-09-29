/*
 * ============================================================================
 * TEST:      PIM - Employee List & Employee Search
 * APIs:      GET /api/v2/pim/employees?limit=50&offset=&model=detailed&includeEmployees=onlyCurrent
 *                &sortField=employee.firstName&sortOrder=ASC        (PIM > Employee List grid)
 *            GET /api/v2/pim/employees?nameOrId=<term>&limit=50&offset=0
 *                                                                   (employee name/ID search box)
 *
 * VALIDATES: Both calls return HTTP 200 within the response-time budget with a JSON "data"
 *            array and a numeric meta.total. The list page returns at most 50 rows, rows
 *            include empNumber/firstName, and the search returns no more rows than the limit.
 *            Pages (offset) and search terms are randomised to avoid hitting only one cached query.
 *            Search terms come from -e SEARCH_TERMS (comma separated), default "a,e,an,test".
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

const TEST_NAME = 'pim-employee-list';
const ENDPOINTS = ['pim_employee_list', 'pim_employee_search'];
const PAGE_SIZE = 50;
const SEARCH_TERMS = (__ENV.SEARCH_TERMS || 'a,e,an,test').split(',').map((t) => t.trim()).filter(Boolean);

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    const data = startTest(TEST_NAME, ENDPOINTS);
    // Find how many pages exist so VUs only request real pages (capped at the first 3).
    const body = apiGet('pim_employee_list', `/pim/employees?limit=1&offset=0&includeEmployees=onlyCurrent`, { 'has meta.total': hasTotal });
    const total = body && body.meta ? body.meta.total : 0;
    data.pageCount = Math.max(1, Math.min(3, Math.ceil(total / PAGE_SIZE)));
    console.log(`==== [${TEST_NAME}] ${total} current employees -> paging over ${data.pageCount} page(s); search terms: ${SEARCH_TERMS.join(', ')}`);
    return data;
}

export default function (data) {
    const offset = Math.floor(Math.random() * data.pageCount) * PAGE_SIZE;
    apiGet(
        'pim_employee_list',
        `/pim/employees?limit=${PAGE_SIZE}&offset=${offset}&model=detailed&includeEmployees=onlyCurrent&sortField=employee.firstName&sortOrder=ASC`,
        {
            'data is array': isArrayData,
            'has meta.total': hasTotal,
            'page size <= 50': (b) => b.data.length <= PAGE_SIZE,
            'rows have empNumber and firstName': (b) => b.data.every((e) => typeof e.empNumber === 'number' && 'firstName' in e),
        },
    );

    thinkTime();

    const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    apiGet('pim_employee_search', `/pim/employees?nameOrId=${encodeURIComponent(term)}&limit=${PAGE_SIZE}&offset=0`, {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
        'results within limit': (b) => b.data.length <= PAGE_SIZE,
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
