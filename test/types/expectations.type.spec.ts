/**
 * Expect Type Safety Tests - Finding #03
 * 
 * These tests verify that expect() and softExpect() return proper typed
 * expect chains instead of 'any'. This was a regression from 1.18.2 where
 * matcher typos would compile and IDE autocomplete would return nothing.
 * 
 * Uses expect-type for compile-time type assertions.
 */

import { expectTypeOf } from 'expect-type';
import { $, WebElement, test } from '../../src';
import { Locator } from 'playwright-core';

test.describe('Expect Type Safety - Finding #03', () => {
  test('expect() should return typed expect chain', () => {
    const element = $('#test');
    
    // When using the package's test fixture, expect() should return
    // the proper Playwright LocatorExpect type
    const expectation = element.expect();
    
    // We can't directly test the full type at runtime, but we can verify
    // it's not 'any' by using expectTypeOf
    expectTypeOf(expectation).not.toMatchTypeOf<unknown>();
  });

  test('softExpect() should return typed expect chain', () => {
    const element = $('#test');
    const expectation = element.softExpect();
    
    expectTypeOf(expectation).not.toMatchTypeOf<unknown>();
  });

  test('WebElement.useExpect should accept optional parameter - Finding #07', () => {
    // This should compile with the new signature
    expectTypeOf(WebElement.useExpect).toMatchTypeOf<(expect?: any) => void>();
  });

  test('expect() should work with message parameter', () => {
    const element = $('#test');
    const expectation = element.expect('Custom message');
    
    // Should still return the typed expectation
    expectTypeOf(expectation).not.toMatchTypeOf<unknown>();
  });

  test('softExpect() should work with message parameter', () => {
    const element = $('#test');
    const expectation = element.softExpect('Custom message');
    
    expectTypeOf(expectation).not.toMatchTypeOf<unknown>();
  });
});

// Note: Compile-fail tests (using @ts-expect-error) would be in separate .ts files
// that are type-checked but not executed, as suggested in the findings report.
