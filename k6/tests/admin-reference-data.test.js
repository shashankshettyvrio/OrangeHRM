/*
 * ============================================================================
 * TEST:      Admin - Reference / lookup data (Job, Organization)
 * APIs:      GET /api/v2/admin/job-titles?limit=0            (Job Titles - used by PIM, Recruitment, Performance filters)
 *            GET /api/v2/admin/employment-statuses?limit=0   (Employment Status dropdown)
 *            GET /api/v2/admin/subunits                      (Organization structure / Sub Unit dropdown)
 *            These are loaded together by the PIM Employee List filter panel and several other screens.
 *
 * VALIDATES: Each call returns HTTP 200 within the response-time budget with a non-empty JSON
 *            "data" array; job titles have id/title, employment statuses have id/name,
 *            subunits include the root unit (level 0). Sent in parallel like the browser does.
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

import { apiBatch, thinkTime } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'admin-reference-data';
const ENDPOINTS = ['admin_job_titles', 'admin_employment_statuses', 'admin_subunits'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

const nonEmpty = (b) => Array.isArray(b.data) && b.data.length > 0;

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    apiBatch([
        {
            endpoint: 'admin_job_titles',
            path: '/admin/job-titles?limit=0',
            validations: { 'non-empty list': nonEmpty, 'rows have id and title': (b) => b.data.every((j) => j.id && j.title) },
        },
        {
            endpoint: 'admin_employment_statuses',
            path: '/admin/employment-statuses?limit=0',
            validations: { 'non-empty list': nonEmpty, 'rows have id and name': (b) => b.data.every((s) => s.id && s.name) },
        },
        {
            endpoint: 'admin_subunits',
            path: '/admin/subunits',
            validations: { 'non-empty list': nonEmpty, 'contains root unit': (b) => b.data.some((u) => u.level === 0) },
        },
    ]);

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
