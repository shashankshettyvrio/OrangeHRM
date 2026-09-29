/*
 * ============================================================================
 * TEST:      PIM - Employee Details (profile page)
 * APIs:      GET /api/v2/pim/employees/{empNumber}                               (employee header)
 *            GET /api/v2/pim/employees/{empNumber}/personal-details              (Personal Details form)
 *            GET /api/v2/pim/employees/{empNumber}/custom-fields?screen=personal (custom fields)
 *            These are the calls made when an employee profile (My Info / viewPersonalDetails) opens.
 *
 * VALIDATES: Each call returns HTTP 200 within the response-time budget with a JSON "data"
 *            member; the returned empNumber matches the one requested; personal-details
 *            contains firstName/lastName. Employee numbers are discovered at runtime in setup()
 *            from the employee list (the public demo data changes constantly, so no ids are hardcoded).
 *            Pool size is configurable with -e EMPLOYEE_POOL_SIZE (default 20).
 *
 * SCENARIO:  Selected with -e SCENARIO=smoke|load|stress|spike (default: load).
 *            load   = ramp to 5 VUs, hold 1m          (baseline)
 *            stress = step 5 -> 10 -> 15 VUs          (find degradation)
 *            spike  = 1 VU, sudden burst to 15 VUs    (recovery behaviour)
 *            Each VU logs in once and reuses its session cookie.
 *
 * EXPECTED:  smoke/load: p95 < 2s, p99 < 3s, < 1% failed requests, > 99% checks passed.
 *            stress/spike: p95 < 4-5s and < 5% errors. A small number of 422 errors can occur
 *            if another demo user deletes a sampled employee during the run.
 * ============================================================================
 */

import { fail } from 'k6';
import { apiBatch, apiGet, thinkTime } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'pim-employee-details';
const ENDPOINTS = ['pim_employee_summary', 'pim_employee_personal_details', 'pim_employee_custom_fields'];
const POOL_SIZE = Number(__ENV.EMPLOYEE_POOL_SIZE || 20);

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    const data = startTest(TEST_NAME, ENDPOINTS);
    const body = apiGet('pim_employee_list', `/pim/employees?limit=${POOL_SIZE}&offset=0&includeEmployees=onlyCurrent`);
    const empNumbers = body && Array.isArray(body.data) ? body.data.map((e) => e.empNumber) : [];
    if (empNumbers.length === 0) {
        fail(`[${TEST_NAME}] no employees found to test against`);
    }
    console.log(`==== [${TEST_NAME}] using ${empNumbers.length} employees: ${empNumbers.join(', ')}`);
    data.empNumbers = empNumbers;
    return data;
}

export default function (data) {
    const empNumber = data.empNumbers[Math.floor(Math.random() * data.empNumbers.length)];
    const matchesId = (b) => b.data.empNumber === empNumber;

    apiBatch([
        { endpoint: 'pim_employee_summary', path: `/pim/employees/${empNumber}`, validations: { 'empNumber matches': matchesId } },
        {
            endpoint: 'pim_employee_personal_details',
            path: `/pim/employees/${empNumber}/personal-details`,
            validations: { 'empNumber matches': matchesId, 'has first and last name': (b) => 'firstName' in b.data && 'lastName' in b.data },
        },
        {
            endpoint: 'pim_employee_custom_fields',
            path: `/pim/employees/${empNumber}/custom-fields?screen=personal`,
            validations: { 'data is object/array': (b) => typeof b.data === 'object' && b.data !== null },
        },
    ]);

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
