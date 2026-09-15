import { test, expect } from '@playwright/test';
import {
  createStrippableAttribute,
  createTestIds,
  testIds,
  TEST_IDS_ENABLED,
} from '../src/strippable';
import { sid, factory } from '../src/builder';

test.describe('createStrippableAttribute', () => {
  test.describe('flag resolution (R3/R4)', () => {
    test('TEST_IDS_ENABLED is observable (R5)', () => {
      expect(typeof TEST_IDS_ENABLED).toBe('boolean');
    });

    test('canonical testIds.enabled matches TEST_IDS_ENABLED', () => {
      expect(testIds.enabled).toBe(TEST_IDS_ENABLED);
    });
  });

  test.describe('emission (enabled: true)', () => {
    const enabled = createStrippableAttribute('data-testid', { enabled: true });

    test('props returns object with attribute (R6)', () => {
      const id = sid('submit-button');
      expect(enabled.props(id)).toEqual({ 'data-testid': 'submit-button' });
    });

    test('props accepts plain string (A7)', () => {
      expect(enabled.props('my-id')).toEqual({ 'data-testid': 'my-id' });
    });

    test('value returns the id string (A4)', () => {
      const id = sid('my-button');
      expect(enabled.value(id)).toBe('my-button');
    });

    test('value accepts plain string (A7)', () => {
      expect(enabled.value('plain-string')).toBe('plain-string');
    });
  });

  test.describe('stripping (enabled: false)', () => {
    const stripped = createStrippableAttribute('data-testid', { enabled: false });

    test('props returns frozen empty object (R6, R8)', () => {
      const id = sid('submit-button');
      const result = stripped.props(id);
      expect(result).toEqual({});
      expect(Object.isFrozen(result)).toBe(true);
    });

    test('value returns undefined (R6)', () => {
      const id = sid('my-button');
      expect(stripped.value(id)).toBeUndefined();
    });

    test('stripped props is the same frozen instance (R8)', () => {
      const a = stripped.props(sid('a'));
      const b = stripped.props(sid('b'));
      expect(a).toBe(b);
    });
  });

  test.describe('selectors are NEVER stripped (R1)', () => {
    const enabled = createStrippableAttribute('data-testid', { enabled: true });
    const stripped = createStrippableAttribute('data-testid', { enabled: false });

    test('selector produces identical result across modes (R1, AC4)', () => {
      const id = sid('submit-button');
      expect(enabled.selector(id)).toBe(stripped.selector(id));
      expect(enabled.selector(id)).toBe('[data-testid="submit-button"]');
    });

    test('prefixSelector produces identical result across modes (R1)', () => {
      const f = factory('btn');
      expect(enabled.prefixSelector(f)).toBe(stripped.prefixSelector(f));
      expect(enabled.prefixSelector(f)).toBe('[data-testid^="btn-"]');
    });

    test('prefixSelector throws for empty prefix', () => {
      const f = factory('btn');
      const bare = { ...f, prefix: '' } as typeof f;
      expect(() => stripped.prefixSelector(bare)).toThrow('requires a non-empty prefix');
    });

    test('containsSelector produces identical result across modes', () => {
      expect(enabled.containsSelector('user')).toBe(stripped.containsSelector('user'));
      expect(enabled.containsSelector('user')).toBe('[data-testid*="user"]');
    });

    test('endsWithSelector produces identical result across modes', () => {
      expect(enabled.endsWithSelector('-btn')).toBe(stripped.endsWithSelector('-btn'));
      expect(enabled.endsWithSelector('-btn')).toBe('[data-testid$="-btn"]');
    });

    test('anySelector produces identical result across modes', () => {
      expect(enabled.anySelector()).toBe(stripped.anySelector());
      expect(enabled.anySelector()).toBe('[data-testid]');
    });
  });

  test.describe('custom attribute name (A5)', () => {
    test('createStrippableAttribute with custom attribute', () => {
      const qa = createStrippableAttribute('data-qa', { enabled: true });
      const id = sid('submit');
      expect(qa.props(id)).toEqual({ 'data-qa': 'submit' });
      expect(qa.selector(id)).toBe('[data-qa="submit"]');
    });

    test('createTestIds factory', () => {
      const myIds = createTestIds({ attribute: 'data-pw', enabled: true });
      const id = sid('login');
      expect(myIds.props(id)).toEqual({ 'data-pw': 'login' });
      expect(myIds.selector(id)).toBe('[data-pw="login"]');
      expect(myIds.value(id)).toBe('login');
    });

    test('createTestIds with enabled: false strips', () => {
      const myIds = createTestIds({ attribute: 'data-pw', enabled: false });
      expect(myIds.props(sid('x'))).toEqual({});
      expect(myIds.value(sid('x'))).toBeUndefined();
    });
  });

  test.describe('never-strip policy (enabled: true)', () => {
    test('enabled: true overrides global flag', () => {
      const alwaysOn = createStrippableAttribute('data-section-kind', { enabled: true });
      expect(alwaysOn.enabled).toBe(true);
      expect(alwaysOn.props(sid('hero'))).toEqual({ 'data-section-kind': 'hero' });
    });
  });

  test.describe('selector escaping', () => {
    test('selector escapes quotes in id values', () => {
      const attr = createStrippableAttribute('data-testid', { enabled: true });
      expect(attr.selector('id"with"quotes')).toBe('[data-testid="id\\"with\\"quotes"]');
    });

    test('selector escapes backslashes', () => {
      const attr = createStrippableAttribute('data-testid', { enabled: true });
      expect(attr.selector('back\\slash')).toBe('[data-testid="back\\\\slash"]');
    });
  });
});
