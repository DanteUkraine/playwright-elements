---
layout: default
title: Migration Guide
---
[Go to Main Page >>](./../README.md)

# Migration Guide

> **Guide for migrating to playwright-elements version 1.18.3+**

## Version 1.18.3: ExpectProvider Pattern

### Overview

Version 1.18.3 introduced a **breaking change** in how WebElement assertions work. This change **decouples the core WebElement class from @playwright/test**, providing better architecture and framework flexibility.

---

## What Changed

| **Before 1.18.3** | **After 1.18.3** |
|-------------------|------------------|
| Direct import of `@playwright/test` expect | No direct dependency on test framework |
| `expect()` worked out of the box | Requires provider configuration |
| Tight coupling with Playwright | Framework-agnostic architecture |
| `useExpect()` method for custom expect | `setExpectProvider()` for provider injection (useExpect restored in 1.19.0-rc2) |

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
// For Mocha: Manual configuration required
import { configureWebElementExpect, $ } from 'playwright-elements';

configureWebElementExpect(); // Call once in setup
const element = $('.button');
await element.expect().toBeVisible(); // Now works
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

### For Mocha Users

⚠️ **Action required:** Add configuration to your setup.

#### Option A: Using mocha.setup.ts (Recommended)

1. Create `test/mocha.setup.ts`:
```typescript
import { configureWebElementExpect } from 'playwright-elements';
configureWebElementExpect();
```

2. Update `.mocharc.json`:
```json
{
  "extension": ["ts"],
  "spec": "./**/*.spec.ts",
  "loader": "ts-node/esm",
  "require": ["./test/mocha.setup.ts"]
}
```

3. Your tests will now work:
```typescript
import { $ } from 'playwright-elements';

describe('my test', () => {
    it('should work', async () => {
        await $('.element').expect().toBeVisible(); // Now works
    });
});
```

#### Option B: Using before hook

```typescript
import { configureWebElementExpect } from 'playwright-elements';

describe('my tests', () => {
    before(() => {
        configureWebElementExpect();
    });

    it('should work', async () => {
        await $('.element').expect().toBeVisible();
    });
});
```

---

### For Jest Users

⚠️ **Action required:** Add configuration to your setup.

1. Create `jest.setup.ts`:
```typescript
import { configureWebElementExpect } from 'playwright-elements';
configureWebElementExpect();
```

2. Update `jest.config.js`:
```javascript
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    // ... other config
};
```

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
import { WebElement, configureWebElementExpect } from 'playwright-elements';
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

The `useExpect()` static method was restored in v1.19.0-rc2 and now accepts an optional expect provider parameter for backward compatibility:

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

### 1. Framework Agnostic
- Use WebElement with **any test framework** (Playwright, Mocha, Jest, etc.)
- Not limited to @playwright/test

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

## Frequently Asked Questions

### Q: Why was this change made?

A: To decouple the core WebElement class from test frameworks, allowing it to be used in production code without test dependencies, and to support multiple test frameworks.

### Q: Do I need to change my existing Playwright tests?

A: **No**, the configuration is automatic for Playwright Test. Your existing tests will continue to work without any changes.

### Q: My Mocha tests stopped working after upgrading. What do I do?

A: Add `configureWebElementExpect()` to your test setup and update `.mocharc.json` to include the setup file. See [Mocha section](#for-mocha-users) above.

### Q: Can I still use custom matchers?

A: **Yes**, but you need to configure your custom expect implementation using `setExpectProvider()` or `configureWebElementExpect()`. See [Custom Matcher section](#for-custom-matcher-users) above.

### Q: How do I know if the provider is configured?

A: If `expect()` or `softExpect()` work without errors, the provider is configured. If you get an error about "Assertion provider not configured", you need to configure it.

### Q: Can I use different providers for different tests?

A: **Yes**, you can call `WebElement.setExpectProvider()` multiple times to change the provider. However, this is generally not recommended as it can lead to confusion.

### Q: What happens if I don't configure the provider?

A: Calling `expect()` or `softExpect()` will throw a clear error message:
```
Error: Assertion provider not configured. Call WebElement.setExpectProvider() in your test setup.
```

---

## Troubleshooting

### Error: "Assertion provider not configured"

**Cause:** You're trying to use `expect()` or `softExpect()` without configuring the provider.

**Solution:**
- For Playwright Test: Ensure you're using `import { test } from 'playwright-elements'`
- For Mocha: Call `configureWebElementExpect()` in your setup
- For other frameworks: Call `WebElement.setExpectProvider()` with your framework's expect

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

- [ ] Identify your test framework (Playwright Test, Mocha, Jest, Custom)
- [ ] For Playwright Test: No action needed ✅
- [ ] For Mocha/Jest: Create setup file with `configureWebElementExpect()`
- [ ] For Mocha: Update `.mocharc.json` to include setup file
- [ ] For Jest: Update `jest.config.js` to include setup file
- [ ] For Custom frameworks: Configure provider with `WebElement.setExpectProvider()`
- [ ] For Custom matchers: Update to use new provider pattern
- [ ] Run tests to verify migration
- [ ] Update CI configuration if needed

---

[Go to Main Page >>](./../README.md)
