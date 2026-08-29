---
layout: default
title: Architecture Overview
---
[Go to Main Page >>](./../README.md)

# Architecture Overview

> **Understanding the design principles and architecture of playwright-elements**

## Design Philosophy

Playwright-elements is designed with the following core principles:

1. **Minimal Boilerplate**: Reduce repetitive code in page objects
2. **Type Safety**: Provide full TypeScript support with proper type inference
3. **Chainable API**: Enable expressive and readable test code
4. **Framework Agnostic**: Work with any test framework (Playwright, Mocha, Jest, etc.)
5. **Production Ready**: Core functionality works without test dependencies

---

## Core Components

### 1. WebElement Class

The central class that wraps Playwright's Locator with additional functionality.

**Key Features:**
- Chainable selector building
- Sub-element support with type-safe `with()` method
- Locator method delegation
- Assertion support via provider pattern (since v1.18.3)

**Architecture Diagram:**
```
WebElement
├── Locator (Playwright-core)
│   ├── All standard Locator methods
│   └── Element selection
├── Selector Building
│   ├── CSS selectors
│   ├── Playwright locators (getBy*, etc.)
│   └── Chaining (and, or, has, hasNot, etc.)
├── Sub-Elements
│   └── Type-safe nested elements
└── Assertions (via ExpectProvider)
    ├── expect()
    └── softExpect()
```

---

### 2. ExpectProvider Pattern

Starting from version 1.18.3, assertions are implemented using a **provider pattern** that decouples WebElement from specific test frameworks.

```
┌─────────────────────────────────────────────────────┐
│                      WebElement                        │
│  ┌───────────────────────────────────────────────┐  │
│  │              expect() / softExpect()             │  │
│  │                   │                               │  │
│  └───────────────┬───────────────┬─────────────────┘  │
│                  │                 │                    │
└──────────────────┼─────────────────┼────────────────┘
                   │                 │
                   ▼                 ▼
┌─────────────────────────────────────────────────────┐
│              ExpectProvider Interface                 │
│  ┌───────────────────┐  ┌────────────────────────┐  │
│  │     expect         │  │       softExpect         │  │
│  │  (locator, msg?)   │  │      (locator, msg?)      │  │
│  └───────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│            Test Framework Implementation                │
│  ┌───────────────────┐  ┌────────────────────────┐  │
│  │  @playwright/test  │  │    Custom Framework      │  │
│  │  expect / soft     │  │    expect / softExpect   │  │
│  └───────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Benefits:**
1. **Decoupling**: WebElement doesn't directly depend on @playwright/test
2. **Flexibility**: Support any test framework
3. **Testability**: Easy to mock in unit tests
4. **Production Use**: Core WebElement can be used without test dependencies

---

### 3. BrowserInstance Singleton

Manages Playwright's Browser, BrowserContext, and Page instances.

**Responsibilities:**
- Browser lifecycle management
- Context switching
- Page switching
- Tab management
- Mobile/desktop context detection

**Pattern:** Singleton with static methods and properties

**Key Features:**
- Automatic browser instance management for Playwright Test
- Manual control for custom test setups
- Builder-like methods: `withBrowser()`, `withContext()`, `withPage()`
- Tab switching: `switchToPreviousTab()`, `switchToTabByIndex()`
- Mobile detection: `isContextMobile` getter/setter

---

### 4. Fixtures Integration

Playwright-elements extends Playwright's test fixtures with custom fixtures:

- `goto`: Navigate to URL (uses baseURL from config)
- `initBrowserInstance`: Auto-fixture for BrowserInstance setup
- `usePage`: Execute code in specific page context
- `test`: Extended test annotation with custom fixtures

**Configuration:**
```typescript
// playwright.test.fixtures.ts
import { test as base, Page, Response, expect } from '@playwright/test';
import { BrowserInstance, usePage, WebElement } from './index';

// Configure WebElement assertion provider automatically
WebElement.setExpectProvider({
    expect: expect,
    softExpect: expect.soft
});

export { expect } from '@playwright/test';

// ... fixture definitions
```

---

## Dependency Graph

```
User Code
│
├── Page Objects (contain WebElement instances)
│   │
│   └── WebElement
│       ├── Locator (Playwright-core)
│       │   └── Browser API
│       │
│       ├── BrowserInstance (optional, for page/context/browser access)
│       │   └── Playwright Browser/Context/Page
│       │
│       └── ExpectProvider (optional, for assertions)
│           └── Test Framework (Playwright, Mocha, etc.)
│
└── Fixtures (optional, for Playwright Test)
    └── playwright.test.fixtures.ts
        ├── BrowserInstance configuration
        └── ExpectProvider configuration (automatic)
```

---

## Type System

### Type-Safe Method Chaining

WebElement uses TypeScript's advanced type features for type-safe method chaining:

```typescript
// with() method preserves type information
const header = $('.header')
    .with({
        logo: $('.logo'),           // WebElement
        search: $('.search')        // WebElement
            .with({
                input: $('input'),  // WebElement
                button: $('button')  // WebElement
            })
    });

// header type: WebElement & { 
//   logo: WebElement, 
//   search: WebElement & { 
//     input: WebElement, 
//     button: WebElement 
//   } 
// }
```

### Conditional Types

Methods like `parent<T>()` use conditional types for type safety:

```typescript
parent<T extends WebElement>(this: WebElement): T extends { parent: infer P } ? P : undefined
```

### Utility Types

Custom utility types for:
- Nested element inference
- Method type preservation
- Array operations
- Filter options

---

## Performance Considerations

1. **Lazy Evaluation**: Locators are built lazily and evaluated only when needed
2. **Caching**: Built locators are cached within the WebElement instance
3. **Minimal Overhead**: WebElement adds minimal overhead to Playwright's native Locator
4. **No Proxies**: Unlike some page object libraries, WebElement doesn't use Proxy objects (which can have performance implications)

---

## Security Considerations

1. **No Evaluations**: WebElement doesn't use `evaluate()` or execute arbitrary code
2. **Type Safety**: Full TypeScript support prevents many runtime errors
3. **Input Validation**: Selector validation through Playwright's native mechanisms
4. **Error Handling**: Clear error messages for misconfigurations

---

## Design Patterns Used

### 1. Provider Pattern
- **Purpose**: Decouple WebElement from test frameworks
- **Implementation**: `ExpectProvider` interface + `setExpectProvider()` method
- **Benefit**: Framework-agnostic, testable, extensible

### 2. Singleton Pattern
- **Purpose**: Manage browser/context/page instances
- **Implementation**: `BrowserInstance` class with static properties
- **Benefit**: Global access, single instance management

### 3. Builder Pattern
- **Purpose**: Create complex element hierarchies
- **Implementation**: `with()`, `and()`, `or()`, `has()`, etc.
- **Benefit**: Fluent API, readable code

### 4. Factory Method Pattern
- **Purpose**: Create WebElement instances
- **Implementation**: `$()`, `$getBy*()` functions
- **Benefit**: Consistent creation, type safety

### 5. Decorator Pattern
- **Purpose**: Extend WebElement with custom methods
- **Implementation**: Type-safe `with()` method with custom methods
- **Benefit**: Extensible, type-safe

---

## Comparison with Other Approaches

### Playwright Native Locators

```typescript
// Native Playwright
const button = page.locator('button');
await expect(button).toBeVisible();

// With playwright-elements
const button = $('button');
await button.expect().toBeVisible();
```

**Advantages of playwright-elements:**
- Type-safe page objects
- Reusable components
- Chainable sub-elements
- Less boilerplate
- Framework-agnostic (with provider pattern)

### Other Page Object Libraries

| Feature | playwright-elements | Other Libraries |
|---------|-------------------|---------------|
| Type Safety | ✅ Full TypeScript | ⚠️ Varies |
| Chainable | ✅ Yes | ⚠️ Sometimes |
| Framework Agnostic | ✅ Yes (v1.18.3+) | ❌ Usually not |
| Production Ready | ✅ Yes | ❌ Usually not |
| No Dependencies | ✅ Only Playwright-core | ❌ Often have many |
| Extensible | ✅ Yes | ⚠️ Sometimes |

---

## Best Practices for Extending

### 1. Creating Custom Elements

```typescript
// Extend WebElement with custom methods
class CustomButton extends WebElement {
    async safeClick(options?: ClickOptions): Promise<void> {
        await this.waitFor();
        await this.click(options);
    }
}

// Export factory function
export function $button(selector: string): CustomButton {
    return new CustomButton(selector);
}

// Use in page objects
const loginPage = {
    submitButton: $button('#submit')
};
```

### 2. Adding Custom Assertions

```typescript
// Create custom expect with matchers
const customExpect = expect.extend({
    async toHaveCustomAttribute(locator, attr, value) {
        const actual = await locator.getAttribute(attr);
        return {
            pass: actual === value,
            message: () => `Expected ${attr} to be ${value}, but got ${actual}`
        };
    }
});

// Configure WebElement to use it
WebElement.setExpectProvider({
    expect: customExpect,
    softExpect: customExpect.soft
});
```

---

## Conclusion

Playwright-elements combines the power of Playwright's native locators with:
- Type-safe page object patterns
- Framework-agnostic architecture (v1.18.3+)
- Minimal boilerplate
- Extensible design
- Production-ready core

The ExpectProvider pattern (introduced in v1.18.3) represents a significant architectural improvement, making the library truly framework-agnostic while maintaining backward compatibility.

---

[Go to Main Page >>](./../README.md)
