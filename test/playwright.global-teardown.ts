// Global teardown for Playwright unit tests

async function globalTeardown() {
  // No special teardown needed for unit tests
  // Playwright's own fixtures handle browser cleanup
  // The initBrowserInstance fixture handles BrowserInstance state cleanup per test
}

export default globalTeardown;
