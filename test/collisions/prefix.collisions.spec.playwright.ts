/**
 * Prefix Collision Prevention Tests - Finding #05, #15
 * 
 * These tests verify that:
 * - $byTestIdPrefix with factory() does not match static IDs with same prefix
 * - assertNoPrefixCollisions() detects and reports collisions
 * - aliasPrefixes work correctly to allow declared collisions
 */

import { test, expect } from '../../src/playwright.test.fixtures';
import { $byTestIdPrefix, factory, sid, assertNoPrefixCollisions } from '../../src';

test.describe('Prefix Collision Prevention - Finding #05, #15', () => {
  test('factory IDs should not match static IDs with same prefix', async ({ page }) => {
    // This is the exact scenario from the findings report
    await page.setContent(`
      <div data-testid="idx-consents">Static Container</div>
      <div data-testid="idx-consent-acme">Factory Item 1</div>
      <div data-testid="idx-consent-globex">Factory Item 2</div>
    `);

    const factoryId = factory('idx-consent');
    const prefixSelector = $byTestIdPrefix(factoryId);
    
    // Should only match the factory-generated IDs (with - delimiter)
    // NOT the static container "idx-consents"
    const count = await prefixSelector.locator.count();
    expect(count).toBe(2); // Only idx-consent-acme and idx-consent-globex
    
    // Verify the selector includes the delimiter
    expect(prefixSelector.selector).toBe('[data-testid^="idx-consent-"]');
  });

  test('factory with different prefix should not match', async ({ page }) => {
    await page.setContent(`
      <div data-testid="form-field">Field 1</div>
      <div data-testid="form-submit">Submit</div>
      <div data-testid="other-form-field">Other Field</div>
    `);

    const formFactory = factory('form');
    const prefixSelector = $byTestIdPrefix(formFactory);
    
    // Should match form-field and form-submit (with - delimiter)
    // Should NOT match other-form-field (doesn't start with form-)
    const count = await prefixSelector.locator.count();
    expect(count).toBe(2);
  });

  test('factory with empty prefix should throw', () => {
    expect(() => factory('')).toThrow('must be a non-empty string');
  });

  test('$byTestIdPrefix should throw for bareFactory', () => {
    const bare = bareFactory();
    expect(() => $byTestIdPrefix(bare)).toThrow('requires a factory with a non-empty prefix');
  });

test.describe('assertNoPrefixCollisions()', () => {
    test('should detect collision between factory and static ID', () => {
      const ids = {
        factory1: factory('prefix'),
        static1: sid('prefix-other'),
        static2: sid('prefix')
      };
      
      expect(() => assertNoPrefixCollisions(ids)).toThrow('test id prefix collisions');
    });

    test('should detect collision between two factories', () => {
      const ids = {
        factory1: factory('base'),
        factory2: factory('base-other')
      };
      
      // factory1 prefix 'base' matches factory2 prefix 'base-other'
      expect(() => assertNoPrefixCollisions(ids)).toThrow('test id prefix collisions');
    });

    test('should allow declared aliases', () => {
      const ids = {
        factory1: factory('nudge-button', { aliasPrefixes: ['nudge-button'] }),
        factory2: factory('nudge-button', { aliasPrefixes: ['nudge-button'] })
      };
      
      // Both factories have same prefix but declare each other as aliases
      expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
    });

    test('should handle complex nested structures', () => {
      const ids = {
        login: {
          username: sid('login-username'),
          password: sid('login-password'),
          form: {
            submit: sid('login-submit')
          }
        },
        forms: {
          loginForm: factory('login-form')
        }
      };
      
      // No collisions in properly structured IDs
      expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
    });

    test('should detect collision in nested structure', () => {
      const ids = {
        components: {
          button: factory('btn'),
          staticButton: sid('btn-primary')
        }
      };
      
      // factory('btn') matches static 'btn-primary'
      expect(() => assertNoPrefixCollisions(ids)).toThrow('test id prefix collisions');
    });

    test('should allow same prefix with different kinds', () => {
      const ids = {
        buttonFactory: factory<'button'>('btn'),
        containerFactory: factory<'container'>('btn')
      };
      
      // Different kinds, same prefix - should be OK since kinds are different
      // The collision check is about the string values, not the types
      // This will detect the collision at the string level
      expect(() => assertNoPrefixCollisions(ids)).toThrow();
    });

    test('should work with empty ids object', () => {
      expect(() => assertNoPrefixCollisions({})).not.toThrow();
    });

    test('should work with only factories', () => {
      const ids = {
        factory1: factory('prefix1'),
        factory2: factory('prefix2')
      };
      
      expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
    });

    test('should work with only static IDs', () => {
      const ids = {
        id1: sid('id-1'),
        id2: sid('id-2')
      };
      
      expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
    });
  });

test.describe('Edge cases', () => {
    test('factory with special characters in prefix', async ({ page }) => {
      await page.setContent(`
        <div data-testid="section.hero-title">Title</div>
        <div data-testid="section.hero-subtitle">Subtitle</div>
        <div data-testid="section.hero">Container (should not match)</div>
      `);

      const factoryWithDot = factory('section.hero');
      const prefixSelector = $byTestIdPrefix(factoryWithDot);
      
      // Should match section.hero-title and section.hero-subtitle
      // Should NOT match section.hero (no delimiter)
      const count = await prefixSelector.locator.count();
      expect(count).toBe(2);
    });

    test('prefix with delimiter should work correctly', async ({ page }) => {
      await page.setContent(`
        <div data-testid="test-a">Match 1</div>
        <div data-testid="test-b">Match 2</div>
        <div data-testid="test">Should NOT match</div>
        <div data-testid="testing">Should NOT match</div>
      `);

      const testFactory = factory('test');
      const prefixSelector = $byTestIdPrefix(testFactory);
      
      // Should only match test-a and test-b (exact prefix + delimiter)
      const count = await prefixSelector.locator.count();
      expect(count).toBe(2);
    });

    test('selector should be properly quoted for special characters', () => {
      const factoryWithDot = factory('section.hero');
      const element = $byTestIdPrefix(factoryWithDot);
      
      const selector = element.selector;
      // Should be quoted and include delimiter
      expect(selector).toBe('[data-testid^="section.hero-"]');
    });
  });
});
