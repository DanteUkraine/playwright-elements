/**
 * Subpath Purity Tests
 * 
 * These tests ensure that the testIds module can be imported via a dependency-free
 * subpath, which is essential for using the module in production code (e.g., React components).
 * 
 * This addresses the issue where there was no way to import testIdProps into application React code
 * without loading the entire browser stack, making @playwright/test a production dependency.
 */

import { test, expect } from '../../src/playwright.test.fixtures';

test.describe('Subpath Purity', () => {
  test('testids subpath should load only 1 module (itself)', () => {
    // Clear the require cache for a clean measurement
    const cacheBefore = new Set(Object.keys(require.cache));
    
    // Load the builder module via the subpath
    const builder = require('../../lib/testIds/builder');
    
    // Count how many new modules were loaded
    const cacheAfter = new Set(Object.keys(require.cache));
    const newModules = [...cacheAfter].filter(m => !cacheBefore.has(m));
    
    // Filter to only playwright-elements modules (ignore Playwright internals like babelBundle.js)
    const playwrightElementsModules = newModules.filter(m => m.includes('playwright-elements/lib'));
    
    // Should only load 1 module from playwright-elements (the builder itself)
    expect(playwrightElementsModules.length).toBe(1);
    expect(playwrightElementsModules[0]).toContain('testIds/builder');
  });

  test('testids subpath should export all expected functions', () => {
    const builder = require('../../lib/testIds/builder');
    
    // All these should be exported
    expect(typeof builder.sid).toBe('function');
    expect(typeof builder.factory).toBe('function');
    expect(typeof builder.bareFactory).toBe('function');
    expect(typeof builder.testIdProps).toBe('function');
    expect(typeof builder.isIdFactory).toBe('function');
    expect(typeof builder.unsafeId).toBe('function');
    expect(typeof builder.ns).toBe('function');
    expect(typeof builder.assertNoPrefixCollisions).toBe('function');
  });

  test('testids subpath should not load playwright-core or @playwright/test', () => {
    // Clear the cache
    Object.keys(require.cache).forEach(key => {
      if (key.includes('playwright') || key.includes('playwright-core')) {
        delete require.cache[key];
      }
    });
    
    // Count playwright-elements modules before and after
    const cacheBeforePE = Object.keys(require.cache).filter(k => k.includes('playwright-elements/lib')).length;
    const builder = require('../../lib/testIds/builder');
    const cacheAfterPE = Object.keys(require.cache).filter(k => k.includes('playwright-elements/lib')).length;
    
    // Should only load 1 module from playwright-elements
    expect(cacheAfterPE - cacheBeforePE).toBe(1);
    
    // Verify no playwright-core or @playwright/test modules were loaded by our subpath
    // (filter out playwright internal modules like babelBundle.js which may be loaded by the test runner)
    const playwrightTestModules = Object.keys(require.cache).filter(key => 
      key.includes('playwright-core') || key.includes('@playwright/test')
    );
    
    // Our subpath should not load any playwright-core or @playwright/test modules
    expect(playwrightTestModules.length).toBe(0);
  });

  test('testids/builder should work for production React code', () => {
    // Simulate importing in a React component context
    const { sid, factory, testIdProps } = require('../../lib/testIds/builder');
    
    // Should be able to create test IDs
    const loginId = factory<'login'>('login');
    const usernameInputId = loginId('username-input');
    
    // Should be able to create test ID props
    const props = testIdProps(usernameInputId);
    
    expect(props).toEqual({ 'data-testid': 'login-username-input' });
  });
});
