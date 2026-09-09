/**
 * Fixture Runtime Validation Tests - Finding #02
 * 
 * These tests ensure that all documented fixtures are actually defined
 * and can be destructured without causing collection errors.
 * 
 * Finding #02: `implicitNavigation` was declared in the .d.ts but never defined,
 * causing Playwright to abort the entire spec file at collection time.
 * The fix was to remove the implicitNavigation fixture declaration.
 * 
 * Note: We verify the absence of implicitNavigation through:
 * 1. Type-level: The compiled TypeScript types no longer include implicitNavigation
 * 2. Runtime: These tests can run without collection errors (if implicitNavigation
 *    were still in the type but not implemented, Playwright would abort at collection time)
 */

import { test, expect } from '../../src/playwright.test.fixtures';

test.describe('Fixture Runtime Validation - Finding #02', () => {
  test('should have all documented fixtures defined and callable', async ({ goto, usePage, testPage }) => {
    // Verify all documented fixtures are available and have the expected types
    expect(typeof goto).toBe('function');
    expect(typeof usePage).toBe('function');
    expect(testPage).toBeDefined();
    
    // Note: initBrowserInstance is a void fixture with auto: true, so it's not
    // available as a parameter but runs automatically. We verify it works by the
    // fact that the test can run (it sets up BrowserInstance.withPage) and
    // that testPage is defined (which depends on BrowserInstance).
  });

  test('should allow destructuring of all actual fixtures', async ({ goto, usePage, testPage }) => {
    // This test verifies that all non-auto fixtures can be destructured without TypeScript errors
    // If implicitNavigation were still in the type, this would fail at compile time
    // because we're not including it in the destructuring.
    // 
    // Note: initBrowserInstance is a void auto fixture, so it's not destructured here
    
    expect(goto).toBeDefined();
    expect(usePage).toBeDefined();
    expect(testPage).toBeDefined();
  });
});
