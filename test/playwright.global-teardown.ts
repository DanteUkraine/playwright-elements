import { BrowserInstance } from '../src';

// Global teardown for Playwright unit tests

async function globalTeardown() {
  // Close any remaining browser instances
  try {
    await BrowserInstance.close();
  } catch (error) {
    // Ignore errors during teardown
    console.warn('Error during global teardown:', error);
  }
}

export default globalTeardown;
