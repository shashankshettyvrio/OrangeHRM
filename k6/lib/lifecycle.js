// setup()/teardown() helpers shared by every test: console banners + credential preflight.

import { BASE_URL, CREDENTIALS, SCENARIO } from './config.js';
import { ensureSession } from './auth.js';

/**
 * Prints the start banner and verifies that login works before any load is generated,
 * so a bad password fails fast instead of producing thousands of 401s.
 * setup() runs in its own VU with its own cookie jar, so each load VU still creates its own session;
 * the setup session can be used to look up test data (e.g. employee ids) with apiGet().
 */
export function startTest(testName, apis) {
    console.log(`==== [${testName}] scenario=${SCENARIO} target=${BASE_URL} user=${CREDENTIALS.username}`);
    console.log(`==== [${testName}] APIs under test: ${apis.join(', ')}`);
    ensureSession();
    return { startedAt: new Date().toISOString() };
}

export function endTest(testName, data) {
    console.log(`==== [${testName}] scenario=${SCENARIO} finished (started ${data.startedAt}, ended ${new Date().toISOString()})`);
}
