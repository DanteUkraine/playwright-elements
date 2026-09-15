import { test, expect } from '@playwright/test';
import {
  testIdSelector,
  testIdPrefixSelector,
  testIdContainsSelector,
  testIdEndsWithSelector,
} from '../src/selectors';
import { sid, factory } from '../src/builder';

test.describe('Zero-dep string selectors (AC1)', () => {
  test('testIdSelector produces correct CSS', () => {
    expect(testIdSelector(sid('submit-button'))).toBe('[data-testid="submit-button"]');
  });

  test('testIdSelector accepts plain string (A7)', () => {
    expect(testIdSelector('submit-button')).toBe('[data-testid="submit-button"]');
  });

  test('testIdSelector with custom attr', () => {
    expect(testIdSelector(sid('submit'), 'data-pw')).toBe('[data-pw="submit"]');
  });

  test('testIdPrefixSelector produces correct CSS', () => {
    const btn = factory('btn');
    expect(testIdPrefixSelector(btn)).toBe('[data-testid^="btn-"]');
  });

  test('testIdPrefixSelector with custom attr', () => {
    const btn = factory('btn');
    expect(testIdPrefixSelector(btn, 'data-pw')).toBe('[data-pw^="btn-"]');
  });

  test('testIdPrefixSelector throws for empty prefix', () => {
    const bare = { ...factory('btn'), prefix: '' } as ReturnType<typeof factory>;
    expect(() => testIdPrefixSelector(bare)).toThrow('requires a non-empty prefix');
  });

  test('testIdContainsSelector produces correct CSS', () => {
    expect(testIdContainsSelector('user')).toBe('[data-testid*="user"]');
  });

  test('testIdContainsSelector with custom attr', () => {
    expect(testIdContainsSelector('user', 'data-pw')).toBe('[data-pw*="user"]');
  });

  test('testIdEndsWithSelector produces correct CSS', () => {
    expect(testIdEndsWithSelector('-button')).toBe('[data-testid$="-button"]');
  });

  test('testIdEndsWithSelector with custom attr', () => {
    expect(testIdEndsWithSelector('-button', 'data-pw')).toBe('[data-pw$="-button"]');
  });

  test('selectors escape special characters', () => {
    expect(testIdSelector('id"with"quotes')).toBe('[data-testid="id\\"with\\"quotes"]');
    expect(testIdSelector('back\\slash')).toBe('[data-testid="back\\\\slash"]');
  });
});
