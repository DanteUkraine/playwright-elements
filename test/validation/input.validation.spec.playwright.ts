/**
 * Input Validation Tests - Finding #16
 * 
 * These tests verify that sid() and factory() properly validate their inputs
 * and throw descriptive errors for empty, null, or invalid values.
 * 
 * This prevents silently producing empty or colliding IDs which can cause
 * hard-to-debug issues in production.
 */

import { test, expect } from '../../src/playwright.test.fixtures';
import { sid, factory, bareFactory } from '../../src/testIds/builder';

test.describe('Input Validation - Finding #16', () => {
  test.describe('sid() validation', () => {
    test('should throw for empty arguments', () => {
      expect(() => sid()).toThrow('[playwright-elements] sid() needs at least one part');
    });

    test('should throw for null first part', () => {
      expect(() => sid(null as any)).toThrow('must be a non-empty string');
    });

    test('should throw for undefined first part', () => {
      expect(() => sid(undefined as any)).toThrow('must be a non-empty string');
    });

    test('should throw for empty string first part', () => {
      expect(() => sid('')).toThrow('must be a non-empty string');
    });

    test('should throw for whitespace-only first part', () => {
      expect(() => sid('   ')).toThrow('must be a non-empty string');
    });

    test('should throw for tab-only first part', () => {
      expect(() => sid('\t')).toThrow('must be a non-empty string');
    });

    test('should throw for newline-only first part', () => {
      expect(() => sid('\n')).toThrow('must be a non-empty string');
    });

    test('should accept single valid part', () => {
      const result = sid('valid');
      expect(result).toBe('valid');
    });

    test('should accept multiple valid parts', () => {
      const result = sid('valid', 'parts', 'here');
      expect(result).toBe('valid-parts-here');
    });

    test('should filter out null and undefined in subsequent parts', () => {
      const result = sid('valid', null as any, 'parts', undefined as any);
      expect(result).toBe('valid-parts');
    });

    test('should filter out empty strings in subsequent parts', () => {
      const result = sid('valid', '', 'parts', '');
      expect(result).toBe('valid-parts');
    });

    test('should work with numbers in parts', () => {
      const result = sid('part', 1, 'another', 2);
      expect(result).toBe('part-1-another-2');
    });

    test('should work with numeric parts only', () => {
      const result = sid(1, 2, 3);
      expect(result).toBe('1-2-3');
    });
  });

  test.describe('factory() validation', () => {
    test('should throw for empty prefix', () => {
      expect(() => factory('')).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for null prefix', () => {
      expect(() => factory(null as any)).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for undefined prefix', () => {
      expect(() => factory(undefined as any)).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for whitespace prefix', () => {
      expect(() => factory('   ')).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for empty key', () => {
      const f = factory('prefix');
      expect(() => f('')).toThrow("factory('prefix') key must be a non-empty string");
    });

    test('should throw for null key', () => {
      const f = factory('prefix');
      expect(() => f(null as any)).toThrow("factory('prefix') key must be a non-empty string");
    });

    test('should throw for undefined key', () => {
      const f = factory('prefix');
      expect(() => f(undefined as any)).toThrow("factory('prefix') key must be a non-empty string");
    });

    test('should throw for whitespace key', () => {
      const f = factory('prefix');
      expect(() => f('   ')).toThrow("factory('prefix') key must be a non-empty string");
    });

    test('should accept valid prefix and key', () => {
      const f = factory('btn');
      const result = f('submit');
      expect(result).toBe('btn-submit');
    });

    test('should work with numeric key', () => {
      const f = factory('item');
      const result = f(0);
      expect(result).toBe('item-0');
    });

    test('should filter out null/undefined in key', () => {
      // This should throw because the key itself is invalid
      const f = factory('prefix');
      expect(() => f(null as any)).toThrow();
    });

    test('should work with factory options', () => {
      const f = factory('prefix', { aliasPrefixes: ['alias'] });
      const result = f('key');
      expect(result).toBe('prefix-key');
      expect(f.prefix).toBe('prefix');
      expect(f.aliasPrefixes).toEqual(['alias']);
    });
  });

  test.describe('bareFactory() validation', () => {
    test('should accept numeric keys including 0', () => {
      const f = bareFactory();
      expect(f(0)).toBe('0');
      expect(f(123)).toBe('123');
    });

    test('should accept empty string key', () => {
      const f = bareFactory();
      expect(f('')).toBe('');
    });

    test('should accept whitespace key', () => {
      const f = bareFactory();
      expect(f('   ')).toBe('   ');
    });

    test('should accept special character keys', () => {
      const f = bareFactory();
      expect(f('.class')).toBe('.class');
      expect(f('#id')).toBe('#id');
      expect(f('a/b')).toBe('a/b');
    });

    test('should throw for null key', () => {
      const f = bareFactory();
      expect(() => f(null as any)).toThrow('bareFactory() key cannot be null or undefined');
    });

    test('should throw for undefined key', () => {
      const f = bareFactory();
      expect(() => f(undefined as any)).toThrow('bareFactory() key cannot be null or undefined');
    });

    test('should work with typed bareFactory', () => {
      const f = bareFactory<'entity'>();
      const result = f(123);
      // Type should be TestId<'entity'>
      expect(result).toBe('123');
    });
  });

  test.describe('Error message quality', () => {
    test('error messages should be descriptive', () => {
      try {
        sid();
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('sid()');
        expect(error.message).toContain('at least one part');
      }
    });

    test('factory error messages should include prefix info', () => {
      try {
        factory('');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('factory()');
        expect(error.message).toContain('prefix');
        expect(error.message).toContain('non-empty string');
      }
    });

    test('factory key error messages should include factory prefix', () => {
      try {
        const f = factory('my-prefix');
        f('');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain("factory('my-prefix')");
        expect(error.message).toContain('key');
        expect(error.message).toContain('non-empty string');
      }
    });
  });
});
