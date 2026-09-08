/**
 * CSS Selector Edge Cases - Finding #04
 * 
 * These tests verify that selectors properly handle problematic characters
 * in test IDs. The issue was that $byTestIdPrefix emitted unquoted values,
 * causing SyntaxError for IDs containing special characters.
 * 
 * Tests cover: . : / # % leading digits whitespace " \
 */

import { test, expect } from '@playwright/test';
import { $byTestId, $byTestIdPrefix, $byTestIdContaining, $byTestIdEndingWith, factory, sid } from '../../src';

test.describe('CSS Selector Edge Cases - Finding #04', () => {
  // Problematic IDs from the findings report
  const problematicIds = [
    'a.b',         // Dot - common in namespaced IDs
    'a:b',         // Colon
    '1a',          // Leading digit
    'a b',         // Space
    'a"b',        // Quote
    'a\\b',       // Backslash
    'a/b',         // Forward slash
    'a#b',         // Hash
    'a%b',         // Percent
  ];

  describe('$byTestId with problematic characters', () => {
    problematicIds.forEach(id => {
      test(`should handle ID: "${id}" in $byTestId`, () => {
        const testId = sid(id);
        const element = $byTestId(testId);
        
        // Should not throw SyntaxError
        expect(() => element.selector).not.toThrow();
        
        // Should produce valid CSS attribute selector
        const selector = element.selector;
        expect(selector).toContain('[');
        expect(selector).toContain(']');
        expect(selector).toContain('=');
        expect(selector).toContain('data-testid');
      });
    });

    test('should properly escape quotes in ID', () => {
      const idWithQuote = sid('id"with"quotes');
      const element = $byTestId(idWithQuote);
      const selector = element.selector;
      
      // Should be properly quoted and escaped
      expect(selector).toMatch(/^\[data-testid=".*"\]$/);
      expect(selector).toContain('id\\"with\\"quotes');
    });

    test('should properly escape backslashes in ID', () => {
      const idWithBackslash = sid('path\\to\\file');
      const element = $byTestId(idWithBackslash);
      const selector = element.selector;
      
      expect(selector).toMatch(/^\[data-testid=".*"\]$/);
      expect(selector).toContain('path\\\\to\\\\file');
    });
  });

  describe('$byTestIdPrefix with problematic characters', () => {
    test('should properly quote and escape prefix with dots', () => {
      const factoryWithDot = factory('section.hero');
      const element = $byTestIdPrefix(factoryWithDot);
      const selector = element.selector;
      
      // Should be quoted and escaped, with delimiter
      expect(selector).toMatch(/^\[data-testid\^=".*"\]$/);
      expect(selector).toContain('section.hero-');
    });

    test('should properly handle prefix with colons', () => {
      const factoryWithColon = factory('ns:prefix');
      const element = $byTestIdPrefix(factoryWithColon);
      const selector = element.selector;
      
      expect(selector).toMatch(/^\[data-testid\^=".*"\]$/);
      expect(selector).toContain('ns:prefix-');
    });

    test('should properly handle prefix with leading digits', () => {
      const factoryWithDigit = factory('1prefix');
      const element = $byTestIdPrefix(factoryWithDigit);
      const selector = element.selector;
      
      expect(selector).toMatch(/^\[data-testid\^=".*"\]$/);
      expect(selector).toContain('1prefix-');
    });

    test('should include delimiter in prefix selection', () => {
      const f = factory('idx-consent');
      const element = $byTestIdPrefix(f);
      const selector = element.selector;
      
      // Should select on "idx-consent-" not just "idx-consent"
      expect(selector).toBe('[data-testid^="idx-consent-"]');
    });
  });

  describe('$byTestIdContaining with problematic characters', () => {
    problematicIds.forEach(id => {
      test(`should handle ID: "${id}" in $byTestIdContaining`, () => {
        const element = $byTestIdContaining(id);
        
        expect(() => element.selector).not.toThrow();
        expect(element.selector).toContain('*=');
      });
    });
  });

  describe('$byTestIdEndingWith with problematic characters', () => {
    problematicIds.forEach(id => {
      test(`should handle ID: "${id}" in $byTestIdEndingWith`, () => {
        const element = $byTestIdEndingWith(id);
        
        expect(() => element.selector).not.toThrow();
        expect(element.selector).toContain('$=');
      });
    });
  });

  describe('All selector types with same problematic ID', () => {
    problematicIds.forEach(id => {
      test(`all selector types should handle: "${id}"`, () => {
        const testId = sid(id);
        
        // All selector types should work without throwing
        const byId = $byTestId(testId);
        const byPrefix = $byTestIdPrefix(factory(id));
        const byContaining = $byTestIdContaining(id);
        const byEndingWith = $byTestIdEndingWith(id);
        
        expect(byId.selector).toBeDefined();
        expect(byPrefix.selector).toBeDefined();
        expect(byContaining.selector).toBeDefined();
        expect(byEndingWith.selector).toBeDefined();
      });
    });
  });

  test('selector generation should be consistent', () => {
    const id = sid('test-id');
    const element = $byTestId(id);
    
    // Run multiple times to ensure consistency
    for (let i = 0; i < 3; i++) {
      expect(element.selector).toBe('[data-testid="test-id"]');
    }
  });
});
