// @ts-check
const { devices } = require('@playwright/test');
require('dotenv').config();

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testDir: './e2e',
    globalSetup: require.resolve('./e2e/global-setup.js'),
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry',
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],
};

module.exports = config;
