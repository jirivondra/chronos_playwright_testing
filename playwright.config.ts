import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import { cleanEnv, str, url } from 'envalid'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

cleanEnv(process.env, {
  BASE_URL: url(),
  API_BASE_URL: url(),
  API_USERNAME: str(),
  API_PASSWORD: str(),
})

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
})
