/*
 * ============================================================================
 * TEST:      Employee Directory
 * APIs:      GET /api/v2/directory/employees?limit=14&offset=<n>             (Directory card grid, infinite scroll)
 *            GET /api/v2/directory/employees?limit=14&offset=0&nameOrId=<term> (Directory name search)
 *
 * VALIDATES: Both calls return HTTP 200 within the response-time budget with a JSON "data"
 *            array and numeric meta.total; a page holds at most 14 cards (the UI page size);
 *            cards contain empNumber, name and the jobTitle/location objects the UI renders.
 *            The grid call scrolls to a random page within the first 5 (like a user scrolling).
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

const TEST_NAME = 'directory';
const ENDPOINTS = ['directory_employees', 'directory_search'];
const PAGE_SIZE = 14;
const SEARCH_TERMS = (__ENV.SEARCH_TERMS || 'a,e,an,test').split(',').map((t) => t.trim()).filter(Boolean);

export const options = buildOptions(TEST_NAME, ENDPOINTS);

const isCard = (e) => typeof e.empNumber === 'number' && 'firstName' in e && 'jobTitle' in e && 'location' in e;

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    const offset = Math.floor(Math.random() * 5) * PAGE_SIZE;
    apiGet('directory_employees', `/directory/employees?limit=${PAGE_SIZE}&offset=${offset}`, {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
        'page size <= 14': (b) => b.data.length <= PAGE_SIZE,
        'cards have name, jobTitle, location': (b) => b.data.every(isCard),
    });

    thinkTime();

    const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    apiGet('directory_search', `/directory/employees?limit=${PAGE_SIZE}&offset=0&nameOrId=${encodeURIComponent(term)}`, {
        'data is array': isArrayData,
        'has meta.total': hasTotal,
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
