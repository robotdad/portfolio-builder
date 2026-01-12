import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for portfolio E2E tests
 * 
 * Test structure:
 * - tests/e2e/ - End-to-end test specs
 * - tests/fixtures/ - Test data and helpers
 * 
 * Usage:
 * - npm run test:e2e - Run all E2E tests
 * - npm run test:e2e:ui - Run with Playwright UI
 * - npm run test:populate - Populate test data via API
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Reporter configuration */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL for the dev server */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: 'cd src && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
