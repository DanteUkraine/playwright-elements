/**
 * Custom Test ID Attribute Tests
 *
 * Verifies that the $byTestId* selector functions respect a custom test ID
 * attribute name, both via:
 * - Per-call `attr` parameter (explicit override)
 * - Global `setTestIdAttribute` (what the testIdAttributeBridge fixture calls
 *   to sync with `use.testIdAttribute` from the Playwright config)
 *
 * Playwright's native `page.getByTestId()` already respects the config;
 * these tests cover the CSS-based $byTestId* family which bypasses it.
 */

import { test, expect } from '../../src/playwright.test.fixtures';
import {
  $byTestId,
  $byTestIdPrefix,
  $byTestIdContaining,
  $byTestIdEndingWith,
  setTestIdAttribute,
  getTestIdAttribute,
  factory,
  sid,
} from '../../src';

// Restore default after each test to avoid leaking state between tests
test.afterEach(() => {
  setTestIdAttribute('data-testid');
});

test.describe('Custom test ID attribute — per-call override', () => {
  test('$byTestId uses custom attribute when provided', () => {
    const el = $byTestId(sid('submit'), 'data-pw');
    expect(el.selector).toContain('[data-pw=');
    expect(el.selector).not.toContain('[data-testid=');
  });

  test('$byTestId defaults to data-testid when no override', () => {
    const el = $byTestId(sid('submit'));
    expect(el.selector).toContain('[data-testid=');
  });

  test('$byTestIdPrefix uses custom attribute when provided', () => {
    const f = factory('btn');
    const el = $byTestIdPrefix(f, 'data-pw');
    expect(el.selector).toContain('[data-pw^=');
    expect(el.selector).not.toContain('[data-testid^=');
  });

  test('$byTestIdPrefix defaults to data-testid when no override', () => {
    const f = factory('btn');
    const el = $byTestIdPrefix(f);
    expect(el.selector).toContain('[data-testid^=');
  });

  test('$byTestIdContaining uses custom attribute when provided', () => {
    const el = $byTestIdContaining('user', 'data-pw');
    expect(el.selector).toContain('[data-pw*=');
    expect(el.selector).not.toContain('[data-testid*=');
  });

  test('$byTestIdContaining defaults to data-testid when no override', () => {
    const el = $byTestIdContaining('user');
    expect(el.selector).toContain('[data-testid*=');
  });

  test('$byTestIdEndingWith uses custom attribute when provided', () => {
    const el = $byTestIdEndingWith('-button', 'data-pw');
    expect(el.selector).toContain('[data-pw$=');
    expect(el.selector).not.toContain('[data-testid$=');
  });

  test('$byTestIdEndingWith defaults to data-testid when no override', () => {
    const el = $byTestIdEndingWith('-button');
    expect(el.selector).toContain('[data-testid$=');
  });
});

test.describe('Custom test ID attribute — global setTestIdAttribute', () => {
  test('setTestIdAttribute changes the default for $byTestId', () => {
    setTestIdAttribute('data-pw');
    const el = $byTestId(sid('submit'));
    expect(el.selector).toContain('[data-pw=');
    expect(el.selector).not.toContain('[data-testid=');
  });

  test('setTestIdAttribute changes the default for $byTestIdPrefix', () => {
    setTestIdAttribute('data-pw');
    const f = factory('btn');
    const el = $byTestIdPrefix(f);
    expect(el.selector).toContain('[data-pw^=');
  });

  test('setTestIdAttribute changes the default for $byTestIdContaining', () => {
    setTestIdAttribute('data-pw');
    const el = $byTestIdContaining('user');
    expect(el.selector).toContain('[data-pw*=');
  });

  test('setTestIdAttribute changes the default for $byTestIdEndingWith', () => {
    setTestIdAttribute('data-pw');
    const el = $byTestIdEndingWith('-button');
    expect(el.selector).toContain('[data-pw$=');
  });

  test('per-call attr overrides global setTestIdAttribute', () => {
    setTestIdAttribute('data-pw');
    const el = $byTestId(sid('submit'), 'data-custom');
    expect(el.selector).toContain('[data-custom=');
    expect(el.selector).not.toContain('[data-pw=');
  });

  test('getTestIdAttribute returns the current attribute', () => {
    expect(getTestIdAttribute()).toBe('data-testid');
    setTestIdAttribute('data-pw');
    expect(getTestIdAttribute()).toBe('data-pw');
    setTestIdAttribute('data-testid');
    expect(getTestIdAttribute()).toBe('data-testid');
  });
});

test.describe('Custom test ID attribute — browser integration', () => {
  test('$byTestId with custom attribute finds elements in the DOM', async ({ page }) => {
    setTestIdAttribute('data-pw');
    await page.setContent(`
      <div data-pw="custom-attr-test">Found</div>
      <div data-testid="custom-attr-test">Not Found</div>
    `);

    const el = $byTestId(sid('custom-attr-test'));
    await el.expect().toHaveText('Found');
  });

  test('$byTestId with per-call custom attribute finds elements', async ({ page }) => {
    await page.setContent(`
      <div data-pw="per-call-test">Found</div>
      <div data-testid="per-call-test">Not Found</div>
    `);

    const el = $byTestId(sid('per-call-test'), 'data-pw');
    await el.expect().toHaveText('Found');
  });

  test('$byTestIdPrefix with custom attribute finds prefix-matched elements', async ({ page }) => {
    setTestIdAttribute('data-pw');
    await page.setContent(`
      <div data-pw="btn-submit">Submit</div>
      <div data-pw="btn-cancel">Cancel</div>
      <div data-testid="btn-submit">Wrong Attr</div>
    `);

    const btn = factory('btn');
    const els = $byTestIdPrefix(btn);
    expect(await els.count()).toBe(2);
  });
});
