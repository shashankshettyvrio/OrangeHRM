/*
 * ============================================================================
 * TEST:      Authentication / Login flow
 * APIs:      GET  /web/index.php/auth/login      (login page, issues CSRF token + session cookie)
 *            POST /web/index.php/auth/validate   (form login: _token, username, password)
 *            GET  /web/index.php/api/v2/dashboard/shortcuts  (proves the new session is authenticated)
 *            GET  /web/index.php/auth/logout     (ends the session)
 *
 * VALIDATES: Login page returns 200 and contains a CSRF token; valid credentials return
 *            302 -> /dashboard/index; the new session can call an API (200 JSON); logout
 *            returns 302 and the session is rejected afterwards (401).
 *            setup() also verifies that INVALID credentials are rejected (302 -> /auth/login).
 *            Unlike the other tests, this one logs in on EVERY iteration on purpose -
 *            the login itself is what is being measured. Cookies are reset every iteration.
 *
 * SCENARIO:  Selected with -e SCENARIO=smoke|load|stress|spike (default: load).
 *            load   = ramp to 5 VUs, hold 1m          (baseline login rate)
 *            stress = step 5 -> 10 -> 15 VUs          (concurrent logins)
 *            spike  = 1 VU, sudden burst to 15 VUs    (e.g. start-of-day login rush)
 *
 * EXPECTED:  smoke/load: auth requests p95 < 2s, p99 < 3s, < 1% failed, > 99% checks passed.
 *            stress/spike: p95 < 4-5s and < 5% errors. Note: the 302 responses count as
 *            successful because 302 is declared an expected status.
 * ============================================================================
 */

import http from 'k6/http';
import { check, fail } from 'k6';
import { API_URL, APP_URL, CREDENTIALS, Routes } from '../lib/config.js';
import { fetchLoginToken, login, logout } from '../lib/auth.js';
import { thinkTime } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'auth-login';
const ENDPOINTS = ['auth_login_page', 'auth_validate', 'auth_session_check', 'auth_logout'];

export const options = buildOptions(TEST_NAME, ENDPOINTS, 'auth', false);

function sessionCheck(expectedStatus) {
    const res = http.get(`${API_URL}/dashboard/shortcuts`, {
        headers: { Accept: 'application/json' },
        tags: { type: 'auth', endpoint: 'auth_session_check', name: 'auth_session_check' },
        responseCallback: http.expectedStatuses(expectedStatus),
    });
    return res;
}

export function setup() {
    // Negative check (once), done BEFORE the preflight login: a logged-in session would be
    // redirected away from /auth/login and no CSRF token would be issued.
    // A wrong password must be redirected back to the login page.
    const token = fetchLoginToken({ phase: 'setup' });
    if (!token) {
        fail(`[${TEST_NAME}] could not read the CSRF token from the login page`);
    }
    const res = http.post(
        `${APP_URL}${Routes.VALIDATE}`,
        { _token: token, username: CREDENTIALS.username, password: `${CREDENTIALS.password}-invalid` },
        { redirects: 0, tags: { type: 'auth', endpoint: 'auth_validate_invalid', name: 'auth_validate_invalid', phase: 'setup' } },
    );
    const location = res.headers.Location || res.headers.location || '';
    const rejected = check(res, {
        '[auth_validate_invalid] invalid password redirects to login page': (r) =>
            r.status === 302 && location.includes(Routes.LOGIN) && !location.includes(Routes.DASHBOARD),
    });
    if (!rejected) {
        fail(`[${TEST_NAME}] invalid credentials were not rejected (status ${res.status}, location "${location}")`);
    }
    console.log(`==== [${TEST_NAME}] negative check passed: invalid password rejected`);

    // Preflight with the real credentials (fails fast if they are wrong).
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    if (!login()) {
        thinkTime();
        return;
    }

    const authed = sessionCheck(200);
    check(authed, {
        '[auth_session_check] logged-in session can call API (200)': (r) => r.status === 200,
    });

    logout();

    const afterLogout = sessionCheck(401);
    check(afterLogout, {
        '[auth_session_check] session rejected after logout (401)': (r) => r.status === 401,
    });

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
