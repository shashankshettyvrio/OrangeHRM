// Load profiles shared by all k6 tests. Select one with -e SCENARIO=<name>.
//
// IMPORTANT: the target is the PUBLIC OrangeHRM demo, shared by many people.
// Every profile is deliberately small (max 15 VUs, ~2.5 min) and every
// iteration includes 1-3s of think time, so peak traffic stays at a few requests/second.

import http from 'k6/http';
import { SCENARIO } from './config.js';

const PROFILES = {
    // Quick sanity run: 1 VU, 3 iterations. Used to verify a script end-to-end.
    smoke: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 3,
        maxDuration: '1m',
    },

    // Baseline/load: normal expected traffic, ramp to 5 VUs and hold.
    load: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '30s', target: 5 },
            { duration: '1m', target: 5 },
            { duration: '15s', target: 0 },
        ],
        gracefulRampDown: '10s',
    },

    // Stress: step the load up beyond baseline (5 -> 10 -> 15 VUs) to find degradation.
    stress: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '20s', target: 5 },
            { duration: '30s', target: 5 },
            { duration: '20s', target: 10 },
            { duration: '30s', target: 10 },
            { duration: '20s', target: 15 },
            { duration: '30s', target: 15 },
            { duration: '20s', target: 0 },
        ],
        gracefulRampDown: '10s',
    },

    // Spike: quiet baseline, sudden burst to 15 VUs, then drop back to observe recovery.
    spike: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
            { duration: '20s', target: 1 },
            { duration: '5s', target: 15 },
            { duration: '30s', target: 15 },
            { duration: '5s', target: 1 },
            { duration: '30s', target: 1 },
            { duration: '5s', target: 0 },
        ],
        gracefulRampDown: '10s',
    },
};

// Stricter limits for smoke/load, relaxed limits under stress/spike where some degradation is expected.
const LIMITS = {
    smoke: { p95: 2000, p99: 3000, failRate: 0.01, checkRate: 0.99 },
    load: { p95: 2000, p99: 3000, failRate: 0.01, checkRate: 0.99 },
    stress: { p95: 4000, p99: 6000, failRate: 0.05, checkRate: 0.95 },
    spike: { p95: 5000, p99: 8000, failRate: 0.05, checkRate: 0.95 },
};

/**
 * Builds k6 options for a test.
 * @param {string} testName  identifier used in tags/metrics, e.g. 'pim-employee-list'
 * @param {string[]} endpoints endpoint tag values that get their own p95 threshold
 * @param {string} requestType 'api' (JSON API calls) or 'auth' (login flow)
 * @param {boolean} reuseSession false for tests that must start every iteration logged out
 */
export function buildOptions(testName, endpoints = [], requestType = 'api', reuseSession = true) {
    const profile = PROFILES[SCENARIO];
    if (!profile) {
        throw new Error(`Unknown SCENARIO "${SCENARIO}". Use one of: ${Object.keys(PROFILES).join(', ')}`);
    }
    const limits = LIMITS[SCENARIO];

    // Login (/auth/validate) and logout answer with 302 redirects - count them as successful responses.
    http.setResponseCallback(http.expectedStatuses(200, 302));

    const thresholds = {
        [`http_req_failed{type:${requestType}}`]: [`rate<${limits.failRate}`],
        [`http_req_duration{type:${requestType}}`]: [`p(95)<${limits.p95}`, `p(99)<${limits.p99}`],
        checks: [`rate>${limits.checkRate}`],
    };
    // One threshold per endpoint so the summary shows a p95 line for each API.
    for (const endpoint of endpoints) {
        thresholds[`http_req_duration{endpoint:${endpoint}}`] = [`p(95)<${limits.p95}`];
    }

    return {
        scenarios: {
            [SCENARIO]: { ...profile, tags: { profile: SCENARIO } },
        },
        thresholds,
        tags: { test: testName },
        // k6 clears cookies after every iteration by default; keep them so each VU reuses its login session.
        noCookiesReset: reuseSession,
        summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    };
}
