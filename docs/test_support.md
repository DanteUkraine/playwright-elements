---
layout: default
title: Test Support Utilities
---
[Go to Main Page >>](./../README.md)

# Test Support Utilities

> **Test Support Module** provides utilities for configuring and extending WebElement assertion capabilities.

## Overview

The test support module (`src/test.support.ts`) contains helper functions for working with WebElement assertions in test environments. These utilities are designed to:

- Configure the assertion provider for WebElement
- Create assertion adapters for individual elements
- Support type-safe assertion chaining
- Provide framework-agnostic assertion support

---

## Table of Contents

- [Functions](#functions)
  - [configureWebElementExpect()](#configurewebelementexpect)
  - [createElementAssertions()](#createelementassertions)
  - [extendWebElementWithAssertions()](#extendwebelementwithassertions)
- [Types](#types)
  - [WebElementExpect](#webelementexpect)
  - [WebElementSoftExpect](#webelementsoftexpect)
- [Best Practices](#best-practices)

---

## Functions

### configureWebElementExpect()

**Signature:** `configureWebElementExpect(): void`

**Description:** Configures WebElement to use Playwright's expect for assertion chaining. This must be called before using `element.expect()` or `element.softExpect()`.

**Use Case:** Test setup (before hooks, setup files)

**Example:**
```typescript
// In mocha.setup.ts or before hooks
import { configureWebElementExpect } from 'playwright-elements';

// Configure once before tests run
configureWebElementExpect();

// Now all WebElement instances can use expect() and softExpect()
test('my test', async () => {
    await $('.element').expect().toBeVisible();
});
```

**Note:** For Playwright Test, this is called automatically in `playwright.test.fixtures.ts`. You only need to call it manually for other test frameworks like Mocha.

---

### createElementAssertions()

**Signature:** `createElementAssertions(element: WebElement): { expect: Function, softExpect: Function }`

**Description:** Creates assertion functions for a specific WebElement instance. Returns an object with `expect` and `softExpect` methods bound to the element's locator.

**Parameters:**
- `element` (WebElement): The WebElement to create assertions for

**Returns:** Object with:
- `expect(message?: string): any` - Creates assertion chain
- `softExpect(message?: string): any` - Creates soft assertion chain

**Use Case:** When you need to create assertion functions for individual elements outside the global configuration

**Example:**
```typescript
import { $, createElementAssertions } from 'playwright-elements';

const button = $('.submit-button');
const { expect, softExpect } = createElementAssertions(button);

await expect().toBeVisible();
await softExpect().toHaveText('Submit');
```

---

### extendWebElementWithAssertions()

**Signature:** `extendWebElementWithAssertions(): void`

**Description:** Extension method placeholder for explicit assertion support loading. The actual extension happens through the WebElement class itself when the provider is configured.

**Use Case:** Explicitly load assertion support (though not strictly necessary with the provider pattern)

**Example:**
```typescript
import { extendWebElementWithAssertions } from 'playwright-elements';

// Explicitly load assertion support
extendWebElementWithAssertions();
```

> **Note:** This function primarily exists to explicitly load assertion support. With the provider pattern, the actual extension happens automatically when you configure the provider.

---

## Types

### WebElementExpect

> Type representing the result of calling `expect()` on a WebElement. Provides type-safe assertion chaining for Playwright assertion methods.

```typescript
export type WebElementExpect = {
    toHaveValue: (value: string | RegExp, options?: any) => Promise<void>;
    toBeVisible: (options?: any) => Promise<void>;
    toContainText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveAttribute: (name: string, value: string | RegExp, options?: any) => Promise<void>;
    toBeEnabled: (options?: any) => Promise<void>;
    toBeDisabled: (options?: any) => Promise<void>;
    toBeChecked: (options?: any) => Promise<void>;
    toBeHidden: (options?: any) => Promise<void>;
    toHaveCount: (count: number, options?: any) => Promise<void>;
    toHaveClass: (className: string | RegExp, options?: any) => Promise<void>;
    toHaveId: (id: string, options?: any) => Promise<void>;
    not: WebElementExpect;
};
```

**Usage:**
```typescript
import { WebElementExpect } from 'playwright-elements';

// Type annotation for better type safety
const result: WebElementExpect = $('.element').expect();
```

---

### WebElementSoftExpect

> Type representing the result of calling `softExpect()` on a WebElement. Has the same structure as WebElementExpect but for soft assertions.

```typescript
export type WebElementSoftExpect = {
    toHaveValue: (value: string | RegExp, options?: any) => Promise<void>;
    toBeVisible: (options?: any) => Promise<void>;
    toContainText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveText: (text: string | RegExp, options?: any) => Promise<void>;
    toHaveAttribute: (name: string, value: string | RegExp, options?: any) => Promise<void>;
    toBeEnabled: (options?: any) => Promise<void>;
    toBeDisabled: (options?: any) => Promise<void>;
    toBeChecked: (options?: any) => Promise<void>;
    toBeHidden: (options?: any) => Promise<void>;
    toHaveCount: (count: number, options?: any) => Promise<void>;
    not: WebElementSoftExpect;
};
```

**Usage:**
```typescript
import { WebElementSoftExpect } from 'playwright-elements';

// Type annotation for better type safety
const result: WebElementSoftExpect = $('.element').softExpect();
```

---

## Best Practices

### 1. For Playwright Test Users

✅ **No manual configuration needed!** The library automatically configures the provider for Playwright Test.

```typescript
import { test } from 'playwright-elements';

test('my test', async ({}) => {
    // Works automatically
    await $('.element').expect().toBeVisible();
});
```

### 2. For Mocha Users

⚠️ **Manual configuration required.** Call `configureWebElementExpect()` once in your setup.

**Option A: Using mocha.setup.ts**

1. Create `test/mocha.setup.ts`:
```typescript
import { configureWebElementExpect } from 'playwright-elements';
configureWebElementExpect();
```

2. Update `.mocharc.json`:
```json
{
  "require": ["./test/mocha.setup.ts"]
}
```

**Option B: Using before hook**
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

### 3. For Custom Test Framework Users

⚠️ **Manual provider configuration required.**

```typescript
import { WebElement } from 'playwright-elements';
import { myCustomExpect, myCustomSoftExpect } from 'my-test-framework';

// Configure once in your test setup
WebElement.setExpectProvider({
    expect: myCustomExpect,
    softExpect: myCustomSoftExpect
});

// Now all WebElement instances use your custom expect
await $('.element').expect().toBeVisible();
```

### 4. Always Verify Configuration

If you're unsure whether the provider is configured, you can test it:

```typescript
try {
    await $('.element').expect().toBeVisible();
    console.log('✅ Provider is configured');
} catch (error) {
    if (error.message.includes('Assertion provider not configured')) {
        console.log('❌ Provider not configured - call configureWebElementExpect()');
    }
}
```

### 5. Framework-Specific Setup Files

For different test frameworks, use these setup patterns:

| Framework | Setup File | Configuration Call |
|-----------|------------|-------------------|
| Playwright Test | Automatic | None needed |
| Mocha | `test/mocha.setup.ts` | `configureWebElementExpect()` |
| Jest | `jest.setup.ts` | `configureWebElementExpect()` |
| Custom | Your setup file | `WebElement.setExpectProvider()` |

---

[Go to Main Page >>](./../README.md)
