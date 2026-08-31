// Global setup for Playwright unit tests
// This replaces the mocha setup

async function globalSetup() {
  // No special setup needed for unit tests
  // The BrowserInstance in src handles its own initialization
  // We just ensure the module is loaded
  
  // Import to initialize the module
  await import('../src');
}

export default globalSetup;
