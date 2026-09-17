import { test, expect } from '@playwright/test';
import {
  sid,
  factory,
  bareFactory,
  ns,
  testIdProps,
  unsafeId,
  isIdFactory,
  assertNoPrefixCollisions,
} from '../src/builder';

test.describe('testids builder', () => {
  test.describe('sid()', () => {
    test('creates static ID from single part', () => {
      expect(sid('submit-button')).toBe('submit-button');
    });

    test('joins multiple parts with kebab-case', () => {
      expect(sid('user', 'profile', 'link')).toBe('user-profile-link');
    });

    test('works with numbers', () => {
      expect(sid('item', 1, 'row', 2)).toBe('item-1-row-2');
    });

    test('throws for empty arguments', () => {
      expect(() => sid()).toThrow('sid() needs at least one part');
    });

    test('throws for empty string first part', () => {
      expect(() => sid('')).toThrow('sid() needs at least one part');
    });

    test('throws for whitespace-only first part', () => {
      expect(() => sid('   ')).toThrow('must be a non-empty string');
    });
  });

  test.describe('factory()', () => {
    test('generates prefixed IDs', () => {
      const btn = factory('btn');
      expect(btn('submit')).toBe('btn-submit');
      expect(btn('cancel')).toBe('btn-cancel');
      expect(btn.prefix).toBe('btn');
    });

    test('throws for empty prefix', () => {
      expect(() => factory('')).toThrow('factory() prefix must be a non-empty string');
    });

    test('throws for empty key', () => {
      const f = factory('btn');
      expect(() => f('')).toThrow("factory('btn') key must be a non-empty string");
    });

    test('stores aliasPrefixes', () => {
      const f = factory('btn', { aliasPrefixes: ['btn'] });
      expect(f.aliasPrefixes).toEqual(['btn']);
    });
  });

  test.describe('bareFactory()', () => {
    test('uses key as entire ID', () => {
      const f = bareFactory();
      expect(f(123)).toBe('123');
      expect(f(0)).toBe('0');
    });

    test('has empty prefix', () => {
      expect(bareFactory().prefix).toBe('');
    });

    test('throws for null key', () => {
      expect(() => bareFactory()(null as any)).toThrow('cannot be null or undefined');
    });
  });

  test.describe('ns()', () => {
    test('creates namespaced IDs', () => {
      const loginId = ns<'login'>();
      expect(loginId('username-input')).toBe('username-input');
    });
  });

  test.describe('testIdProps()', () => {
    test('returns data-testid props', () => {
      expect(testIdProps(sid('my-button'))).toEqual({ 'data-testid': 'my-button' });
    });

    test('supports custom attribute name', () => {
      expect(testIdProps(sid('my-button'), 'data-pw')).toEqual({ 'data-pw': 'my-button' });
    });

    test('defaults to data-testid when attr not provided', () => {
      const props = testIdProps(sid('submit'));
      expect(props).toHaveProperty('data-testid');
      expect(props).not.toHaveProperty('data-pw');
    });
  });

  test.describe('unsafeId()', () => {
    test('adopts raw string as TestId', () => {
      expect(unsafeId('external-id')).toBe('external-id');
    });
  });

  test.describe('isIdFactory()', () => {
    test('identifies factories', () => {
      expect(isIdFactory(factory('btn'))).toBe(true);
      expect(isIdFactory(bareFactory())).toBe(true);
      expect(isIdFactory(sid('foo'))).toBe(false);
      expect(isIdFactory('not-a-factory')).toBe(false);
    });
  });

  test.describe('assertNoPrefixCollisions()', () => {
    test('passes for clean IDs', () => {
      const ids = {
        button: factory('btn'),
        nav: sid('nav-logo'),
      } as const;
      expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
    });

    test('throws for prefix collision with static ID', () => {
      const ids = {
        btn: factory('btn'),
        colliding: sid('btn-submit'),
      } as const;
      expect(() => assertNoPrefixCollisions(ids)).toThrow('prefix collisions');
    });

    test('allows declared alias prefixes', () => {
      const ids = {
        a: factory('nudge-button', { aliasPrefixes: ['nudge-button'] }),
        b: factory('nudge-button', { aliasPrefixes: ['nudge-button'] }),
      } as const;
      expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
    });
  });
});
