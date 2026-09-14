---
layout: default
title: Migration Guide
---
[Go to Main Page >>](./../README.md)

# Migration Guide

> **Guide for migrating to playwright-elements version 1.19.0+**

## Version 1.19.0: ExpectProvider Pattern

### Overview

Version 1.19.0 introduced a **breaking change** in how WebElement assertions work. This change **decouples the core WebElement class from @playwright/test**, providing better architecture and framework flexibility.

---

## What Changed

| **Before 1.19.0** | **After 1.19.0** |
|-------------------|------------------|
| Direct import of `@playwright/test` expect | No direct dependency on test framework |
| `expect()` worked out of the box | Requires provider configuration (automatic for @playwright/test) |
| Tight coupling with Playwright | Framework-agnostic architecture |
| `useExpect()` method for custom expect | `setExpectProvider()` for provider injection (useExpect maintained for backward compatibility) |

---

## Breaking Changes

### 1. `expect()` and `softExpect()` now require configuration

**Before:**
```typescript
import { $ } from 'playwright-elements';

const element = $('.button');
await element.expect().toBeVisible(); // Just worked
```

**After:**
```typescript
// For Playwright Test: Automatic (no changes needed)
const element = $('.button');
await element.expect().toBeVisible(); // Works automatically
```

**Error if not configured:**
```
Error: Assertion provider not configured. Call WebElement.setExpectProvider() in your test setup. 
For Playwright: WebElement.setExpectProvider({ expect, softExpect: expect.soft });
```

---

## Migration Steps

### For Playwright Test Users

✅ **No changes required!** The configuration is automatic.

Your existing code will continue to work:
```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
    await $('.element').expect().toBeVisible(); // Works automatically
});
```

The library automatically configures the provider in `playwright.test.fixtures.ts`.

---

### For Custom Test Framework Users

⚠️ **Action required:** Configure the provider manually.

```typescript
import { WebElement } from 'playwright-elements';
import { myCustomExpect, myCustomSoftExpect } from 'my-test-framework';

// Configure once in your test setup file
WebElement.setExpectProvider({
    expect: myCustomExpect,
    softExpect: myCustomSoftExpect
});

// Now all WebElement instances use your custom expect
await $('.element').expect().toBeVisible();
```

---

### For Custom Matcher Users

⚠️ **Action required:** Update custom matcher configuration.

**Before (old approach):**
```typescript
import { expect } from 'playwright-elements';

expect.extend({
    async toHaveCustomValue(locator, expected) {
        // custom implementation
    }
});

// This would NOT work with WebElement.expect()
```

**After (new approach):**
```typescript
import { WebElement } from 'playwright-elements';
import { expect } from '@playwright/test';

// Extend Playwright expect with custom matchers
const customExpect = expect.extend({
    async toHaveCustomValue(locator, expected) {
        // custom implementation
    }
});

// Configure WebElement to use extended expect
WebElement.setExpectProvider({
    expect: customExpect,
    softExpect: customExpect.soft
});

// Now custom matcher works
await $('.element').expect().toHaveCustomValue('test');
```

---

## Backward Compatibility

### `useExpect()` Method

The `useExpect()` static method accepts an optional expect provider parameter for backward compatibility:

```typescript
// With parameter - delegates to setExpectProvider:
WebElement.useExpect(expect);

// Without parameter - does nothing (backward compatible with 1.x):
WebElement.useExpect();

// Recommended approach - use setExpectProvider directly:
WebElement.setExpectProvider({ expect, softExpect: expect.soft });
```

**Note:** For new code, prefer `setExpectProvider()` for clarity. `useExpect()` is maintained for backward compatibility.

---

## Benefits of the New Architecture

### 1. Clean Architecture
- WebElement works seamlessly with Playwright Test

### 2. Production-Ready
- **No test dependencies** in core code
- Can use WebElement classes in production applications
- Clean separation between test and production code

### 3. Better Type Safety
- Clear separation between core and test code
- Type-safe provider pattern
- Better architecture for custom assertions

### 4. Customizable
- Easy to inject **custom assertion libraries**
- Support for **custom matchers**
- Flexible configuration options

### 5. Clean Architecture
- Follows **dependency injection** principles
- **Loose coupling** between components
- **Single Responsibility** principle applied

---

## New Features in 1.19.0

### TestIds Module

Version 1.19.0 introduced a new **TestIds module** for type-safe test ID generation. This module is **zero-dependency** and can be used independently of Playwright.

#### Import Paths

**Zero-dependency import (recommended for production code):**
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

The TestId types use **branded types** to prevent mixing IDs from different categories:

```typescript
// Different types for different ID categories
const buttonId: TestId<'button'> = sid<'button'>('submit');
const containerId: TestId<'container'> = sid<'container'>('main');

// Type error: cannot assign button ID to container
// const wrong: TestId<'container'> = buttonId; // Error!
```

**Important:** Brands are **nominal and per-package**. IDs from your existing project registry are **NOT** interchangeable with the `TestId` type from playwright-elements. You'll need to migrate to use the new types, or use `unsafeId()` as an escape hatch.

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

**Note:** The new TestId types provide **compile-time safety** and prevent ID collisions through the type system.

---

## Frequently Asked Questions

### Q: Why was this change made?

A: To decouple the core WebElement class from test frameworks, allowing it to be used in production code without test dependencies.

### Q: Do I need to change my existing Playwright tests?

A: **No**, the configuration is automatic for Playwright Test. Your existing tests will continue to work without any changes.

### Q: Can I still use custom matchers?

A: **Yes**, you can configure your custom expect implementation using `WebElement.setExpectProvider()`. See [Custom Test Framework Users](#for-custom-test-framework-users) above.

### Q: How do I know if the provider is configured?

A: If `expect()` or `softExpect()` work without errors, the provider is configured. If you get an error about "Assertion provider not configured", you need to configure it.

### Q: Can I use different providers for different tests?

A: **Yes**, you can call `WebElement.setExpectProvider()` multiple times to change the provider. However, this is generally not recommended as it can lead to confusion.

### Q: What happens if I don't configure the provider?

A: Calling `expect()` or `softExpect()` will throw a clear error message:
```
Error: Assertion provider not configured. Call WebElement.setExpectProvider() in your test setup.
```

### Q: Do custom matchers added via `expect.extend()` work with WebElement?

A: **Yes!** This is one of the major improvements in 1.19.0. When you extend Playwright's expect and configure it via `WebElement.setExpectProvider()`, your custom matchers are now available on WebElement instances:

```typescript
import { expect } from '@playwright/test';
import { WebElement, $ } from 'playwright-elements';

// Extend Playwright expect with custom matcher
expect.extend({
  async toHaveCustomValue(locator, expected) {
    const value = await locator.getAttribute('data-custom');
    return { pass: value === expected };
  }
});

// Configure WebElement to use extended expect
WebElement.setExpectProvider({
  expect: expect,
  softExpect: expect.soft
});

// Now custom matcher works with WebElement!
await $('[data-testid="my-element"]').expect().toHaveCustomValue('test');
```

### Q: What about deep imports?

A: If you use a deep import like `import { WebElement } from 'playwright-elements/lib/web.element'`, the automatic configuration from `playwright.test.fixtures` won't apply. However, **the library now attempts a lazy default** by requiring `@playwright/test` on first use. This means:

1. **Use the main entry point (recommended):**
```typescript
import { WebElement, $ } from 'playwright-elements';
```

2. **Deep imports with @playwright/test available:** If `@playwright/test` is installed and available in your environment, deep imports will work automatically on first use.

3. **Manually configure the provider (if @playwright/test is not available):**
```typescript
import { WebElement } from 'playwright-elements/lib/web.element';
import { expect } from '@playwright/test';

WebElement.setExpectProvider({
  expect: expect,
  softExpect: expect.soft
});
```

**Note:** The lazy default only works if `@playwright/test` is available at runtime. For production code without test dependencies, you must either use the main entry point or manually configure a provider.

---

## Troubleshooting

### Error: "Assertion provider not configured"

**Cause:** You're trying to use `expect()` or `softExpect()` without configuring the provider.

**Solution:** Ensure you're using `import { test } from 'playwright-elements'`

### Error: "expect is not defined"

**Cause:** You're trying to import `expect` directly from 'playwright-elements' but it's not exported from the main module.

**Solution:** Import from '@playwright/test':
```typescript
import { expect } from '@playwright/test';
```

### Tests work locally but fail in CI

**Cause:** The test setup file might not be included in your CI configuration.

**Solution:** Ensure your `.mocharc.json` or test configuration includes the setup file:
```json
{
  "require": ["./test/mocha.setup.ts"]
}
```

---

## Migration Checklist

- [ ] For Playwright Test: No action needed ✅
- [ ] For Custom frameworks: Configure provider with `WebElement.setExpectProvider()`
- [ ] For Custom matchers: Update to use new provider pattern
- [ ] Run tests to verify migration
- [ ] Update CI configuration if needed

---

[Go to Main Page >>](./../README.md)
