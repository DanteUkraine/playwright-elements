import { chromium } from '@playwright/test';

// Global setup for Playwright unit tests
// This replaces the mocha setup

async function globalSetup() {
  // No special setup needed for unit tests
  // The BrowserInstance in src handles its own initialization
  // We just ensure the module is loaded
  
  // Import the configureWebElementExpect to set up Playwright expect
  // This is similar to what was in mocha.setup.ts
  const { configureWebElementExpect } = await import('../src');
  configureWebElementExpect();
}

export default globalSetup;
