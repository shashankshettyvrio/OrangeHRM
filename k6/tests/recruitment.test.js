/*
 * ============================================================================
 * TEST:      Recruitment - Candidates & Vacancies
 * APIs:      GET /api/v2/recruitment/candidates?limit=50&offset=0&model=list
 *                &sortField=candidate.dateOfApplication&sortOrder=DESC        (Candidates grid)
 *            GET /api/v2/recruitment/vacancies?model=summary&limit=0&excludeInterviewers=false
 *                                                                           (Vacancy filter dropdown)
 *            GET /api/v2/recruitment/candidates/statuses                    (Status filter dropdown)
 *            These are the calls the browser makes when Recruitment > Candidates opens.
 *
 * VALIDATES: Each call returns HTTP 200 within the response-time budget with a JSON "data"
 *            array; the candidates grid has meta.total and rows with id/firstName/dateOfApplication
 *            and a status field (null for candidates not attached to a vacancy);
 *            vacancies have id/name; candidate statuses are a non-empty list.
 *            The two dropdown lookups are sent in parallel, then the grid is loaded.
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

import { apiBatch, apiGet, hasTotal, isArrayData, thinkTime } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'recruitment';
const ENDPOINTS = ['recruitment_vacancies', 'recruitment_candidate_statuses', 'recruitment_candidates'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    apiBatch([
        {
            endpoint: 'recruitment_vacancies',
            path: '/recruitment/vacancies?model=summary&limit=0&excludeInterviewers=false',
            validations: { 'data is array': isArrayData, 'rows have id and name': (b) => b.data.every((v) => v.id && v.name) },
        },
        {
            endpoint: 'recruitment_candidate_statuses',
            path: '/recruitment/candidates/statuses',
            validations: { 'non-empty list': (b) => Array.isArray(b.data) && b.data.length > 0 },
        },
    ]);

    apiGet(
        'recruitment_candidates',
        '/recruitment/candidates?limit=50&offset=0&model=list&sortField=candidate.dateOfApplication&sortOrder=DESC',
        {
            'data is array': isArrayData,
            'has meta.total': hasTotal,
            // status/vacancy are null for candidates not attached to a vacancy, so only presence is checked
            'rows have id, firstName, dateOfApplication and status field': (b) =>
                b.data.every((c) => c.id && 'firstName' in c && c.dateOfApplication && 'status' in c),
        },
    );

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
