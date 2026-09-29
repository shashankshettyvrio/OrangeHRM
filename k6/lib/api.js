// Reusable API request + validation helpers for the OrangeHRM /api/v2 endpoints.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { API_URL, CHECK_MAX_MS, THINK_TIME_MAX, THINK_TIME_MIN } from './config.js';
import { ensureSession, invalidateSession } from './auth.js';

function requestParams(endpoint) {
    return {
        headers: { Accept: 'application/json' },
        // "name" groups URLs with dynamic ids/query strings into one metric series
        tags: { type: 'api', endpoint, name: endpoint },
    };
}

function parseJson(res) {
    try {
        return res.json();
    } catch (e) {
        return null;
    }
}

/**
 * Runs the standard checks for an OrangeHRM API response:
 * status 200, response time within budget, JSON body with a "data" member,
 * plus any endpoint-specific validations.
 * @param {object} res k6 response
 * @param {string} endpoint endpoint tag, used as the check prefix
 * @param {Object<string, function(object): boolean>} validations extra checks receiving the parsed JSON body
 */
export function checkApiResponse(res, endpoint, validations = {}) {
    const body = parseJson(res);
    const checks = {
        [`[${endpoint}] status is 200`]: (r) => r.status === 200,
        [`[${endpoint}] response time < ${CHECK_MAX_MS}ms`]: (r) => r.timings.duration < CHECK_MAX_MS,
        [`[${endpoint}] body has data`]: () => body !== null && body.data !== undefined,
    };
    for (const [name, fn] of Object.entries(validations)) {
        checks[`[${endpoint}] ${name}`] = () => {
            try {
                return body !== null && fn(body) === true;
            } catch (e) {
                return false;
            }
        };
    }

    const passed = check(res, checks);
    if (!passed) {
        console.warn(`[${endpoint}] check failed - status ${res.status}, ${Math.round(res.timings.duration)}ms, body: ${String(res.body).substring(0, 200)}`);
    }
    return body;
}

/**
 * Authenticated GET against /api/v2. Logs in once per VU, and re-logs in once if the session expired (401).
 * @param {string} endpoint endpoint tag, e.g. 'pim_employee_list'
 * @param {string} path path relative to /api/v2, including query string
 * @param {object} validations endpoint-specific checks (see checkApiResponse)
 * @returns {object|null} parsed JSON body
 */
export function apiGet(endpoint, path, validations = {}) {
    ensureSession();
    let res = http.get(`${API_URL}${path}`, requestParams(endpoint));

    if (res.status === 401) {
        console.warn(`[${endpoint}] session expired (401) - logging in again`);
        invalidateSession();
        ensureSession();
        res = http.get(`${API_URL}${path}`, requestParams(endpoint));
    }

    return checkApiResponse(res, endpoint, validations);
}

/**
 * Sends several authenticated GETs in parallel, like the browser does when a page loads.
 * @param {Array<{endpoint: string, path: string, validations?: object}>} requests
 * @param {boolean} retried internal - true on the single retry after a 401
 * @returns {object[]} parsed JSON bodies in the same order
 */
export function apiBatch(requests, retried = false) {
    ensureSession();
    const responses = http.batch(
        requests.map((r) => ['GET', `${API_URL}${r.path}`, null, requestParams(r.endpoint)]),
    );

    if (!retried && responses.some((res) => res.status === 401)) {
        console.warn('[batch] session expired (401) - logging in again');
        invalidateSession();
        return apiBatch(requests, true);
    }

    return responses.map((res, i) => checkApiResponse(res, requests[i].endpoint, requests[i].validations || {}));
}

/** Random think time between iterations to simulate a real user and keep load gentle. */
export function thinkTime() {
    sleep(THINK_TIME_MIN + Math.random() * (THINK_TIME_MAX - THINK_TIME_MIN));
}

/** Today's date as YYYY-MM-DD (UTC). */
export function today() {
    return new Date().toISOString().slice(0, 10);
}

/** Common validators */
export const isArrayData = (body) => Array.isArray(body.data);
export const hasTotal = (body) => body.meta && typeof body.meta.total === 'number';
