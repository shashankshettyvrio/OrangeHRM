// Authentication helpers for OrangeHRM (verified against the live demo network traffic).
//
// Login flow used by the real UI:
//   1. GET  /web/index.php/auth/login     -> HTML containing <auth-login :token="&quot;<csrf>&quot;">
//                                            and sets the "orangehrm" session cookie
//   2. POST /web/index.php/auth/validate  -> form fields _token, username, password
//                                            302 -> /dashboard/index on success, 302 -> /auth/login on failure
//   3. The "orangehrm" cookie authenticates all /api/v2/* calls (401 {"error":{"message":"Session expired"}} without it)
//
// Each VU logs in ONCE and reuses its session cookie for all iterations. Sessions are
// per-VU (not shared from setup) because PHP locks a session while a request runs, so
// one shared session would serialise concurrent VUs and distort the results.

import http from 'k6/http';
import { check, fail } from 'k6';
import { APP_URL, CREDENTIALS, Routes } from './config.js';

const TOKEN_PATTERN = /:token="&quot;([^&"]+)&quot;"/;

let vuLoggedIn = false;

/** GET the login page and extract the CSRF token. */
export function fetchLoginToken(tags = {}) {
    const res = http.get(`${APP_URL}${Routes.LOGIN}`, {
        tags: { type: 'auth', endpoint: 'auth_login_page', name: 'auth_login_page', ...tags },
    });
    const match = res.body ? res.body.match(TOKEN_PATTERN) : null;

    check(res, {
        '[auth_login_page] status is 200': (r) => r.status === 200,
        '[auth_login_page] CSRF token present': () => match !== null,
    });

    return match ? match[1] : null;
}

/**
 * Performs the full UI login flow for the current VU.
 * Redirects are not followed, so the dashboard HTML is not downloaded.
 * @returns {boolean} true when the server redirected to the dashboard
 */
export function login(username = CREDENTIALS.username, password = CREDENTIALS.password, tags = {}) {
    const token = fetchLoginToken(tags);
    if (!token) {
        return false;
    }

    const res = http.post(
        `${APP_URL}${Routes.VALIDATE}`,
        { _token: token, username, password },
        {
            redirects: 0,
            tags: { type: 'auth', endpoint: 'auth_validate', name: 'auth_validate', ...tags },
        },
    );

    const location = res.headers.Location || res.headers.location || '';
    const ok = check(res, {
        '[auth_validate] status is 302': (r) => r.status === 302,
        '[auth_validate] redirects to dashboard': () => location.includes(Routes.DASHBOARD),
    });

    if (!ok) {
        console.warn(`[auth] login failed for user "${username}" - status ${res.status}, location "${location}"`);
    }
    return ok;
}

/** Logs out the current VU session (GET /auth/logout -> 302 /auth/login). */
export function logout(tags = {}) {
    const res = http.get(`${APP_URL}${Routes.LOGOUT}`, {
        redirects: 0,
        tags: { type: 'auth', endpoint: 'auth_logout', name: 'auth_logout', ...tags },
    });
    check(res, {
        '[auth_logout] status is 302': (r) => r.status === 302,
    });
    vuLoggedIn = false;
}

/** Logs in once per VU; subsequent calls are no-ops while the session is valid. */
export function ensureSession() {
    if (!vuLoggedIn) {
        vuLoggedIn = login();
        if (!vuLoggedIn) {
            fail('Could not establish an OrangeHRM session - check ORANGEHRM_USERNAME / ORANGEHRM_PASSWORD');
        }
    }
}

/** Forces the next ensureSession() call to log in again (used after a 401). */
export function invalidateSession() {
    vuLoggedIn = false;
}
