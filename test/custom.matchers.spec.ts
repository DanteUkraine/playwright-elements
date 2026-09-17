/**
 * Custom Matchers Integration Tests
 * 
 * These tests verify that custom matchers added via expect.extend()
 * work correctly with WebElement.expect() and provide the expected
 * assertion functionality.
 */

import { test, expect } from '../src/playwright.test.fixtures';
import { $ } from '../src';

// Extend Playwright's expect with custom matchers
expect.extend({
  async toHaveCustomValue(locator: any, expected: string) {
    const actual = await locator.getAttribute('data-custom');
    return {
      pass: actual === expected,
      message: () => `Expected element to have custom value ${expected}, but got ${actual}`
    };
  },
  
  async toBeInCustomState(locator: any, state: string) {
    const actual = await locator.getAttribute('data-state');
    return {
      pass: actual === state,
      message: () => `Expected element to be in state ${state}, but got ${actual}`
    };
  }
});

test.describe('Custom Matchers Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(`
      <div data-custom="test-value" data-state="active">Test Element</div>
      <div data-custom="wrong-value" data-state="inactive">Wrong Element</div>
    `);
  });

  test('custom matcher toHaveCustomValue should work with expect()', async ({ page }) => {
    const element = $('[data-custom="test-value"]');
    
    // Custom matcher should work with WebElement.expect()
    await element.expect().toHaveCustomValue('test-value');
  });

  test('custom matcher toBeInCustomState should work with expect()', async ({ page }) => {
    const element = $('[data-state="active"]');
    
    await element.expect().toBeInCustomState('active');
  });

  test('custom matchers should work with softExpect()', async ({ page }) => {
    const element = $('[data-custom="test-value"]');
    
    // Custom matchers should also work with softExpect
    await element.softExpect().toHaveCustomValue('test-value');
    await element.softExpect().toBeInCustomState('active');
  });

  test('custom matchers should fail correctly when assertion fails', async ({ page }) => {
    const element = $('[data-custom="test-value"]');
    
    await expect(
      element.expect().toHaveCustomValue('wrong-value')
    ).rejects.toMatch(/Expected element to have custom value wrong-value, but got test-value/);
  });

  test('standard Playwright matchers should still work', async ({ page }) => {
    const element = $('[data-custom="test-value"]');
    
    // Standard matchers should continue to work
    await element.expect().toHaveText('Test Element');
    await element.expect().toHaveAttribute('data-custom', 'test-value');
  });

  test('custom matchers with message parameter', async ({ page }) => {
    const element = $('[data-custom="test-value"]');
    
    // Custom matchers should work with custom message
    await element.expect('Element should have correct custom value').toHaveCustomValue('test-value');
  });
});
