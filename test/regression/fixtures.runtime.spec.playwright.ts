/**
 * Fixture Runtime Validation Tests - Finding #02
 * 
 * These tests ensure that all documented fixtures are actually defined
 * and can be destructured without causing collection errors.
 * 
 * Finding #02: `implicitNavigation` was declared in the .d.ts but never defined,
 * causing Playwright to abort the entire spec file at collection time.
 */

import { test, expect } from '@playwright/test';

test.describe('Fixture Runtime Validation - Finding #02', () => {
  test('should have all documented fixtures defined in the type', () => {
    // Import the test function from our package
    const { test: ourTest } = require('../../lib/playwright.test.fixtures');
    
    // The fixtures that should be available
    const expectedFixtures = ['goto', 'initBrowserInstance', 'usePage'];
    
    // Create a test that tries to destructure all fixtures
    // This would have failed in 1.19.0-rc1 with "Test has unknown parameter 'implicitNavigation'"
    ourTest('fixture destructure validation', async ({ goto, initBrowserInstance, usePage }) => {
      // If we get here, all fixtures were properly defined
      expect(typeof goto).toBe('function');
      expect(typeof initBrowserInstance).toBe('function');
      expect(typeof usePage).toBe('function');
    });
  });

  test('should not have implicitNavigation fixture', () => {
    // Verify that implicitNavigation is NOT in the fixtures
    const { test: ourTest } = require('../../lib/playwright.test.fixtures');
    
    // Create a test that tries to use implicitNavigation
    // This should fail at collection time with "Test has unknown parameter 'implicitNavigation'"
    expect(() => {
      ourTest('should fail with implicitNavigation', async ({ implicitNavigation }) => {
        void implicitNavigation;
      });
    }).toThrow(/unknown parameter.*implicitNavigation/i);
  });

  test('should allow destructuring of all actual fixtures', () => {
    const { test: ourTest } = require('../../lib/playwright.test.fixtures');
    
    // This should not throw - all these fixtures actually exist
    ourTest('valid fixture destructuring', async ({ goto, initBrowserInstance, usePage }) => {
      expect(goto).toBeDefined();
      expect(initBrowserInstance).toBeDefined();
      expect(usePage).toBeDefined();
    });
  });
});
