/*
 * ============================================================================
 * TEST:      Buzz - Social feed
 * APIs:      GET /api/v2/buzz/feed?limit=10&offset=0&sortOrder=DESC&sortField=share.createdAtUtc
 *                                               (Buzz newsfeed; limit=5 version also feeds the Dashboard widget)
 *            GET /api/v2/buzz/anniversaries?limit=5   (Upcoming Anniversaries panel)
 *
 * VALIDATES: Both calls return HTTP 200 within the response-time budget with a JSON "data"
 *            array; the feed returns at most 10 posts, and each post has an id, type and
 *            author employee. Sent in parallel like the Buzz page does.
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

import { apiBatch, isArrayData, thinkTime } from '../lib/api.js';
import { buildOptions } from '../lib/scenarios.js';
import { endTest, startTest } from '../lib/lifecycle.js';

const TEST_NAME = 'buzz-feed';
const ENDPOINTS = ['buzz_feed', 'buzz_anniversaries'];

export const options = buildOptions(TEST_NAME, ENDPOINTS);

export function setup() {
    return startTest(TEST_NAME, ENDPOINTS);
}

export default function () {
    apiBatch([
        {
            endpoint: 'buzz_feed',
            path: '/buzz/feed?limit=10&offset=0&sortOrder=DESC&sortField=share.createdAtUtc',
            validations: {
                'data is array': isArrayData,
                'at most 10 posts': (b) => b.data.length <= 10,
                'posts have id, type and author': (b) => b.data.every((p) => p.id && p.type && p.employee),
            },
        },
        { endpoint: 'buzz_anniversaries', path: '/buzz/anniversaries?limit=5', validations: { 'data is array': isArrayData } },
    ]);

    thinkTime();
}

export function teardown(data) {
    endTest(TEST_NAME, data);
}
