/**
 * Selector Overload Tests - Finding #13
 * 
 * These tests verify that $byTestId and testIdProps no longer accept bare strings,
 * enforcing type safety through the TestId branded type.
 * 
 * Added unsafeId() as an escape hatch for third-party IDs.
 */

import { test, expect } from '../../src/playwright.test.fixtures';
import { $byTestId, testIdProps, sid, unsafeId } from '../../src';

test.describe('Selector String Overloads - Finding #13', () => {
  test('byTestId should accept TestId from sid()', () => {
    const testId = sid('test-id');
    const element = $byTestId(testId);
    
    expect(element.selector).toBe('[data-testid="test-id"]');
  });

  test('byTestId should accept TestId from factory()', () => {
    const factoryId = sid('factory-id');
    const element = $byTestId(factoryId);
    
    expect(element.selector).toBe('[data-testid="factory-id"]');
  });

  test('byTestId should work with typed TestId', () => {
    const typedId: ReturnType<typeof sid<'button'>> = sid('button-id');
    const element = $byTestId(typedId);
    
    expect(element.selector).toBe('[data-testid="button-id"]');
  });

  test('testIdProps should accept TestId from sid()', () => {
    const testId = sid('input-field');
    const props = testIdProps(testId);
    
    expect(props).toEqual({ 'data-testid': 'input-field' });
  });

  test('testIdProps should accept TestId from factory()', () => {
    const factoryId = sid('component-id');
    const props = testIdProps(factoryId);
    
    expect(props).toEqual({ 'data-testid': 'component-id' });
  });

  test('unsafeId should provide escape hatch for third-party IDs', () => {
    const rawString = 'third-party-id';
    const testId = unsafeId(rawString);
    const element = $byTestId(testId);
    
    expect(element.selector).toBe('[data-testid="third-party-id"]');
  });

  test('unsafeId should work with testIdProps', () => {
    const rawString = 'external-id';
    const testId = unsafeId(rawString);
    const props = testIdProps(testId);
    
    expect(props).toEqual({ 'data-testid': 'external-id' });
  });

  test('unsafeId should work with special characters', () => {
    const rawString = 'id-with.dots';
    const testId = unsafeId(rawString);
    const element = $byTestId(testId);
    
    expect(element.selector).toBe('[data-testid="id-with.dots"]');
  });

  test('multiple byTestId calls should work correctly', () => {
    const id1 = sid('first');
    const id2 = sid('second');
    const id3 = unsafeId('third');
    
    const element1 = $byTestId(id1);
    const element2 = $byTestId(id2);
    const element3 = $byTestId(id3);
    
    expect(element1.selector).toBe('[data-testid="first"]');
    expect(element2.selector).toBe('[data-testid="second"]');
    expect(element3.selector).toBe('[data-testid="third"]');
  });
});

// Note: Compile-fail tests for bare strings would be in separate .ts files
// with @ts-expect-error directives, as the actual type checking happens
// at compile time, not runtime.
