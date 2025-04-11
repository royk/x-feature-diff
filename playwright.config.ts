import { defineConfig } from '@playwright/test';

// Create an async function to handle the imports
async function getConfig() {

  return defineConfig({
    testDir: './src',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.CI ? [['github'],
                                ['html'],
                                ]   
                                : [['list'], 
                                 ['playwright-feature-reporter', { outputFile: './README.md' }],
                                ['playwright-feature-reporter', {outputFormat: 'json', outputFile: './output.json'}],
                                 ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
      /* Base URL to use in actions like `await page.goto('/')`. */
      // baseURL: 'http://127.0.0.1:3000',

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: 'on-first-retry',
    },
    projects: [
      {
        name: 'no-browser'
      }
    ]
  });
}

// Export the config as a promise
export default getConfig();
