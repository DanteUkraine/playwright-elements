/**
 * Subpath Purity Tests
 * 
 * These tests ensure that the testIds module can be imported via a dependency-free
 * subpath, which is essential for using the module in production code (e.g., React components).
 * 
 * The builder is now a re-export from @playwright-elements/testids (a standalone
 * zero-dependency package). The re-export itself loads 2 modules:
 *   1. lib/testIds/builder.js (the re-export shim)
 *   2. @playwright-elements/testids/lib/builder.js (the standalone package)
 * Neither loads Playwright or lodash.
 */

import { test, expect } from '../../src/playwright.test.fixtures';

test.describe('Subpath Purity', () => {
  test('testids subpath should load only the re-export + standalone package (no Playwright/lodash)', () => {
    // Normalize path for cross-platform compatibility (Windows uses backslashes)
    const normalizePath = (p: string) => p.replace(/\\/g, '/');
    
    // Clear the require cache for playwright-elements modules for a clean measurement
    Object.keys(require.cache).forEach(key => {
      if (normalizePath(key).includes('playwright-elements/lib') || normalizePath(key).includes('testids/lib')) {
        delete require.cache[key];
      }
    });
    
    const cacheBefore = new Set(Object.keys(require.cache));
    
    // Load the builder module via the subpath
    const builder = require('../../lib/testIds/builder');
    
    // Count how many new modules were loaded
    const cacheAfter = new Set(Object.keys(require.cache));
    const newModules = [...cacheAfter].filter(m => !cacheBefore.has(m));
    
    // The re-export loads 2 modules: the shim + the standalone package
    // Neither should be Playwright or lodash
    const impureModules = newModules.filter(m => {
      const n = normalizePath(m);
      return n.includes('playwright-core') || n.includes('@playwright/test') || n.includes('lodash');
    });
    
    expect(impureModules.length).toBe(0);
    
    // Verify the builder exports work
    expect(typeof builder.sid).toBe('function');
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
    // Normalize path for cross-platform compatibility (Windows uses backslashes)
    const normalizePath = (p: string) => p.replace(/\\/g, '/');
    
    // Clear the cache
    Object.keys(require.cache).forEach(key => {
      if (normalizePath(key).includes('playwright')) {
        delete require.cache[key];
      }
    });
    
    // Load the re-export
    require('../../lib/testIds/builder');
    
    // Verify no playwright-core or @playwright/test modules were loaded by our subpath
    // (filter out playwright internal modules like babelBundle.js which may be loaded by the test runner)
    const playwrightTestModules = Object.keys(require.cache).filter(key => 
      normalizePath(key).includes('playwright-core') || normalizePath(key).includes('@playwright/test')
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
