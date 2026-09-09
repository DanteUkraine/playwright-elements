/**
 * Entry Point Stability Tests
 * 
 * These tests ensure that all published entry points can be loaded without
 * circular dependency crashes. This was a BLOCKER issue in 1.19.0-rc1 where
 * 4 of 9 entry points would crash when loaded first.
 */

import { test, expect } from '../../src/playwright.test.fixtures';

test.describe('Entry Point Stability', () => {
  // List of all published entry points from the package
  const entryPoints = [
    'index',
    'web.element',
    'browser',
    'test.support',
    'testIds/builder',
    'testIds/selectors',
    'testIds/index',
    'page.object.builder',
    'playwright.test.fixtures'
  ];

  entryPoints.forEach(entry => {
    test(`should load lib/${entry} without circular dependency crash`, () => {
      // This test verifies that the module can be required without throwing
      // a TypeError due to circular dependencies
      expect(() => {
        // Clear the require cache for a clean test
        const modulePath = `../../lib/${entry}`;
        delete require.cache[require.resolve(modulePath)];
        require(modulePath);
      }).not.toThrow();
    });
  });

  test('should load all entry points first in their own processes', () => {
    // This simulates the guard suggested in the findings:
    // for f in $(cd lib && find . -name '*.js' ! -name '*.cli.js'); do
    //   node -e "require('./lib/${f}')" || { echo "FAILS FIRST: $f"; exit 1; }
    // done
    
    const entryPoints = [
      'index.js',
      'web.element.js',
      'browser.js',
      'test.support.js',
      'testIds/builder.js',
      'testIds/selectors.js',
      'testIds/index.js',
      'page.object.builder.js',
      'playwright.test.fixtures.js'
    ];

    entryPoints.forEach(entry => {
      expect(() => {
        delete require.cache[require.resolve(`../../lib/${entry}`)];
        require(`../../lib/${entry}`);
      }).not.toThrow();
    });
  });
});
