---
layout: default
title: Migration Guide
---
[Go to Main Page >>](./../README.md)

# Migration Guide

> **Guide for migrating to playwright-elements version 1.19.0+**

## Version 1.19.0: Assertions work automatically; new `testIds` module

### Overview

Version 1.19.0 introduces two notable changes:

1. A new **type-safe `testIds` module** for test ID generation (see [TestIds Module](#testids-module-1190)).
2. **Assertions now work automatically** when you import from `'playwright-elements'` — `expect()` and `softExpect()` directly use `@playwright/test`'s `expect`, so custom matchers added via `expect.extend()` work out of the box. No provider configuration is required for `@playwright/test`.

---

## What Changed

| **Before 1.19.0** | **After 1.19.0** |
|-------------------|------------------|
| `expect()` worked out of the box | `expect()` / `softExpect()` still work out of the box — they now use `@playwright/test`'s `expect` directly |
| Custom matchers needed extra wiring | Custom matchers added via `expect.extend()` work automatically with full TypeScript autocomplete |
| `TestId` used a `unique symbol` brand | `TestId` uses a **structural string brand** (`__testIdBrand: "pe/testids"`) — types are interoperable across installed copies |

---

## Assertions in 1.19.0

### For `@playwright/test` users — no action needed

Assertions work automatically. `expect()` and `softExpect()` directly use `@playwright/test`'s `expect`:

```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
  await $('.element').expect().toBeVisible();
  await $('.element').softExpect().toBeVisible();
});
```

This works because importing from `'playwright-elements'` (or `'playwright-elements/test'`) pulls in `playwright.test.fixtures`, which configures assertions for you.

### Custom matchers — automatic

Custom matchers added via `expect.extend()` work seamlessly with WebElement instances and provide full TypeScript autocomplete — no configuration required:

```typescript
import { expect } from '@playwright/test';
import { test, $ } from 'playwright-elements';

expect.extend({
  async toHaveCustomValue(locator, expected) {
    const value = await locator.getAttribute('data-custom');
    return { pass: value === expected };
  }
});

test('custom matcher', async ({ goto }) => {
  await goto('/');
  await $('[data-testid="my-element"]').expect().toHaveCustomValue('test');
});
```

### For custom test frameworks — optional

If you are **not** using `@playwright/test`, you can inject your own assertion library. This is optional and only needed for non-Playwright frameworks:

```typescript
import { WebElement } from 'playwright-elements';
import { myExpect, mySoftExpect } from 'my-test-framework';

// Configure once in your test setup
WebElement.setExpectProvider({
  expect: myExpect,
  softExpect: mySoftExpect
});

// Now all WebElement instances use your custom expect
await $('.element').expect().toBeVisible();
```

`setExpectProvider()` accepts an `ExpectProvider` (`{ expect, softExpect }`). `useExpect(provider)` is a deprecated alias kept for backward compatibility.

---

## TestIds Module (1.19.0)

Version 1.19.0 introduced a new **`testIds` module** for type-safe test ID generation. This module is **zero-dependency** and can be used independently of Playwright.

#### Import Paths

**Standalone package (recommended for production code and unit tests):**
```bash
npm install -D @playwright-elements/testids
```
```typescript
import { sid, factory, testIdProps } from '@playwright-elements/testids';
```
This is a separate npm package with **zero runtime dependencies** — no Playwright or lodash in `node_modules`.

**Zero-dependency subpath (backward compatible, import-time isolation only):**
```typescript
import { sid, factory, testIdProps } from 'playwright-elements/testids';
```

**Full import with selectors (includes Playwright dependencies):**
```typescript
import { sid, factory, testIdProps, $byTestId } from 'playwright-elements';
// or
import { $byTestId } from 'playwright-elements/testIds/selectors';
```

#### Type Safety

The TestId types use a **structural string brand** to prevent mixing IDs from different categories:

```typescript
// Different types for different ID categories
const buttonId: TestId<'button'> = sid<'button'>('submit');
const containerId: TestId<'container'> = sid<'container'>('main');

// Type error: cannot assign button ID to container
// const wrong: TestId<'container'> = buttonId; // Error!
```

**Important:** The brand is **structural** (`__testIdBrand: "pe/testids"`), so two installed copies of the package produce **interoperable types**. Plain strings are still rejected, and `Kind` is covariant (`TestId<'button'>` is assignable to `TestId<string>` but not vice versa). `unsafeId()` remains the escape hatch for third-party IDs or fixture values that cannot be statically typed.

#### Usage Examples

```typescript
import { sid, factory, testIdProps, $byTestId } from 'playwright-elements';

// Simple static IDs
const submitButton = sid<'button'>('submit-button');

// Factory for prefixed IDs
const button = factory<'button'>('btn');
const cancelButton = button('cancel'); // TestId<'button'> -> 'btn-cancel'

// Use in React/JSX
function MyComponent() {
  return <button {...testIdProps(submitButton)}>Submit</button>;
}

// Use in tests
const cancelBtn = $byTestId(cancelButton);
await cancelBtn.click();
```

#### Migration from Existing ID Registry

If you have an existing ID registry:

```typescript
// Old approach (your existing code)
const ids = {
  login: {
    username: 'login-username',
    password: 'login-password',
  }
};

// New approach with TestId
import { sid, factory } from 'playwright-elements/testids';

const ids = {
  login: {
    username: sid<'login'>('login-username'),
    password: sid<'login'>('login-password'),
  }
};
```

**Note:** The new TestId types provide **compile-time safety** and prevent ID misuse through the type system.

---

## Frequently Asked Questions

### Q: Why was this change made?

A: To add a type-safe `testIds` module and to make `expect()` / `softExpect()` use `@playwright/test`'s `expect` directly, so custom matchers added via `expect.extend()` work automatically with full TypeScript autocomplete.

### Q: Do I need to change my existing Playwright tests?

A: **No**, assertions are automatic for Playwright Test. Your existing tests will continue to work without any changes.

### Q: Can I still use custom matchers?

A: **Yes!** Custom matchers added via `expect.extend()` work automatically with WebElement instances — no configuration required. See [Custom matchers — automatic](#custom-matchers--automatic) above.

### Q: Can I use a custom assertion library?

A: Yes, but only if you are not using `@playwright/test`. Call `WebElement.setExpectProvider({ expect, softExpect })` once in your test setup. For `@playwright/test`, no configuration is needed.

### Q: What happens if I don't configure the provider?

A: Nothing — for `@playwright/test` there is nothing to configure; assertions work automatically. `setExpectProvider()` is only for custom (non-Playwright) frameworks.

### Q: What about deep imports?

A: Use the main entry point (`import { WebElement, $ } from 'playwright-elements'`) — this is where the Playwright fixtures and side effects live. The verified zero-dependency subpaths are `playwright-elements/testids`, `playwright-elements/testIds/builder`, and `playwright-elements/testIds/selectors`. If you import one of those subpaths, you get the ID/selector utilities but not the Playwright-bound fixtures.

---

## Troubleshooting

### Error: "expect is not defined"

**Cause:** You're trying to use `expect` without importing it.

**Solution:** Import `expect` from `@playwright/test`:
```typescript
import { expect } from '@playwright/test';
```

### Tests work locally but fail in CI

**Cause:** The test setup file might not be included in your CI configuration.

**Solution:** Ensure your Playwright test configuration includes the setup file (see your `playwright.config.ts` `webServer`/`projects`/`globalSetup` settings).

---

## Migration Checklist

- [ ] For Playwright Test: No action needed ✅ (assertions work automatically)
- [ ] For Custom matchers: Nothing to do — `expect.extend()` works automatically
- [ ] For Custom frameworks: Optionally configure `WebElement.setExpectProvider()`
- [ ] TestIds: Adopt `sid()` / `factory()` branded types where useful
- [ ] Run tests to verify migration

---

[Go to Main Page >>](./../README.md)
