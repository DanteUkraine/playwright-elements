---
layout: default
title: Advanced Usage
---
[Go to Main Page >>](./../README.md)

# Advanced Usage

This document covers advanced usage patterns, best practices, and performance considerations for playwright-elements.

- [Error Handling](#error-handling)
  - [WebElement Errors](#webelement-errors)
  - [BrowserInstance Errors](#browserinstance-errors)
  - [Common Error Patterns](#common-error-patterns)
- [Performance Considerations](#performance-considerations)
  - [Large Page Objects](#large-page-objects)
  - [Deep Nesting](#deep-nesting)
  - [Memory Management](#memory-management)
- [Best Practices](#best-practices)
  - [When to Use with() vs subElements()](#when-to-use-with-vs-subelements)
  - [Organizing Page Objects](#organizing-page-objects)
  - [Testing Strategies](#testing-strategies)
  - [TypeScript Tips](#typescript-tips)
- [Migration Guide](#migration-guide)
  - [From Other Frameworks](#from-other-frameworks)
  - [Version Migration](#version-migration)

## Error Handling

### WebElement Errors

All WebElement methods that interact with the DOM can throw errors in certain conditions.

#### Common WebElement Errors

| Method | Error Condition | Error Message | Solution |
|--------|----------------|---------------|----------|
| `getText()` | Element not found or text is null | `Text content method returned null for selector: "{selector}"` | Use `textContent()` instead if null is acceptable |
| Any action method | Element not found | Playwright timeout error | Ensure element exists, use proper waitFor |
| `getAttribute()` | Attribute doesn't exist | Returns `null` | Check for null in your code |
| `count()` | Invalid selector | Playwright selector error | Fix selector syntax |

#### Error Handling Examples

```typescript
import { $, WebElement } from 'playwright-elements';

// Safe getText with fallback
async function getTextSafely(element: WebElement, fallback: string = ''): Promise<string> {
    try {
        return await element.getText();
    } catch (error) {
        if (error.message.includes('Text content method returned null')) {
            return fallback;
        }
        throw error;
    }
}

// Safe attribute access
async function getAttributeSafely(
    element: WebElement, 
    attribute: string, 
    fallback: string | null = null
): Promise<string | null> {
    const value = await element.getAttribute(attribute);
    return value !== null ? value : fallback;
}

// Check if element exists before interacting
async function safeClick(element: WebElement): Promise<boolean> {
    const count = await element.count();
    if (count === 0) {
        return false;
    }
    await element.click();
    return true;
}
```

### BrowserInstance Errors

BrowserInstance methods throw errors when the required instances are not initialized.

#### Common BrowserInstance Errors

| Method | Error Condition | Error Message | Solution |
|--------|----------------|---------------|----------|
| `browser` getter | Browser not started | `Browser was not started` | Call `BrowserInstance.start()` first |
| `currentContext` getter | Context not started | `Context was not started` | Call `BrowserInstance.startNewContext()` first |
| `currentPage` getter | Page not started | `Page was not started` | Call `BrowserInstance.startNewPage()` or use `withPage()` |

#### Error Handling Examples

```typescript
import { BrowserInstance, BrowserName } from 'playwright-elements';

// Safe browser access
async function getBrowserSafely() {
    try {
        return BrowserInstance.browser;
    } catch (error) {
        if (error.message === 'Browser was not started') {
            await BrowserInstance.start(BrowserName.CHROME);
            return BrowserInstance.browser;
        }
        throw error;
    }
}

// Safe page access
async function getPageSafely() {
    try {
        return BrowserInstance.currentPage;
    } catch (error) {
        if (error.message === 'Page was not started') {
            await BrowserInstance.start(BrowserName.CHROME);
            await BrowserInstance.startNewPage();
            return BrowserInstance.currentPage;
        }
        throw error;
    }
}

// Check if browser is available
function isBrowserAvailable(): boolean {
    try {
        BrowserInstance.browser;
        return true;
    } catch {
        return false;
    }
}
```

### Common Error Patterns

#### Pattern 1: Stale Element
```typescript
// Problem: Element becomes stale between actions
const element = $('button');
await element.expect().toBeVisible();
// Some action that causes page change
await element.click(); // Error: Element is stale

// Solution: Re-query the element
const element = $('button');
await element.expect().toBeVisible();
await element.click(); // Works because we just queried it
```

#### Pattern 2: Timing Issues
```typescript
// Problem: Race condition with element appearance
const element = $('#dynamic-element');
await element.click(); // Error: Element not found

// Solution: Use proper waiting
await element.waitFor();
await element.click();

// Or with timeout
const element = $('#dynamic-element');
await element.click({ timeout: 10000 });
```

#### Pattern 3: Iframe Context
```typescript
// Problem: Trying to access element in iframe without switching context
const iframeElement = $('iframe').contentFrame();
await iframeElement.$('.inside-iframe').click(); // Error: Wrong context

// Solution: Use contentFrame/owner properly
const iframe = $('iframe').contentFrame();
await iframe.$('.inside-iframe').click(); // This works
await iframe.owner().$('.outside-iframe').click(); // Switch back
```

## Performance Considerations

### Large Page Objects

When creating page objects with many elements, consider performance implications.

#### Performance Tips

1. **Lazy Initialization**: Initialize elements only when needed
   ```typescript
   class LargePage {
       private _header?: WebElement;
       
       get header(): WebElement {
           if (!this._header) {
               this._header = $('.header');
           }
           return this._header;
       }
   }
   ```

2. **Reuse Selectors**: Reuse common base selectors
   ```typescript
   class EfficientPage {
       private readonly base = $('.container');
       
       readonly header = this.base.$('.header');
       readonly footer = this.base.$('.footer');
       readonly content = this.base.$('.content');
   }
   ```

3. **Avoid Deep Chains**: Deeply nested chains can impact performance
   ```typescript
   // Less efficient
   const element = $('.a').$('.b').$('.c').$('.d').$('.e');
   
   // More efficient
   const base = $('.a');
   const element = base.$('.b .c .d .e');
   ```

### Deep Nesting

Deeply nested element chains are supported but have performance considerations.

#### Maximum Recommended Depth
- **Standard usage**: Up to 10 levels - no performance impact
- **Heavy usage**: 10-20 levels - minimal impact
- **Avoid**: 50+ levels - significant performance overhead

#### Performance Optimization
```typescript
// Instead of this (50 levels)
let element = $('html');
for (let i = 0; i < 50; i++) {
    element = element.$('.child');
}

// Do this (single selector)
const element = $('html .child .child .child /* ... */');

// Or better yet, use CSS selectors efficiently
const element = $('html .child:has(.child:has(.child))');
```

### Memory Management

playwright-elements creates lightweight WebElement instances that don't hold DOM references, so memory usage is typically not an issue.

#### Memory Best Practices

1. **Don't Cache Too Many Elements**: Create elements when needed rather than caching all possible elements
2. **Use getAll() Wisely**: `getAll()` creates an array of elements - be mindful of large arrays
3. **Clean Up Resources**: Ensure browser contexts and pages are properly closed
4. **Avoid Circular References**: Don't create circular references between page objects

#### Memory Leak Prevention
```typescript
// Good: Proper cleanup
import { BrowserInstance } from 'playwright-elements';

before(async () => {
    await BrowserInstance.start();
});

after(async () => {
    await BrowserInstance.close();
});

// Good: Limited scope
describe('Test Suite', () => {
    beforeEach(async () => {
        await BrowserInstance.startNewPage();
    });
    
    afterEach(async () => {
        await BrowserInstance.close();
    });
});

// Bad: No cleanup
afterEach(async () => {
    // Missing cleanup - can cause memory leaks
});
```

## Best Practices

### When to Use with() vs subElements()

Both methods serve similar purposes but have different use cases.

#### Use `with()` when:
- You need to add **both elements AND methods**
- You want a **single method call** for complex augmentation
- You need to add **custom methods** alongside elements
- You're building **complex page objects** with behavior

```typescript
// with() is better here - adding both elements and methods
const header = $('.header').with({
    logo: $('.logo'),
    menu: $('.menu'),
    async expandMenu() {
        await this.menu.click();
    }
});
```

#### Use `subElements()` when:
- You only need to add **sub-elements** (no methods)
- You want **explicit type-safe augmentation**
- You're focused on **element structure only**
- You prefer **separation of concerns** (elements vs methods)

```typescript
// subElements() is better here - only adding elements
const header = $('.header').subElements({
    logo: $('.logo'),
    menu: $('.menu'),
    search: $('.search')
});
```

#### Combined Approach
```typescript
// Use both for maximum flexibility
const header = $('.header')
    .subElements({
        logo: $('.logo'),
        menu: $('.menu')
    })
    .withMethods({
        async expandMenu() {
            await this.menu.click();
        }
    });
```

### Organizing Page Objects

#### File Structure Recommendations

```
project/
├── tests/
│   ├── fixtures.ts          # Test fixtures
│   ├── pages/               # Page objects
│   │   ├── index.ts         # Generated index
│   │   ├── home.page.ts     # Home page
│   │   ├── login.page.ts    # Login page
│   │   └── ...
│   ├── components/          # Reusable components
│   │   ├── index.ts
│   │   ├── header.ts        # Header component
│   │   ├── footer.ts        # Footer component
│   │   └── ...
│   └── tests/
│       ├── home.test.ts     # Home page tests
│       └── ...
└── src/
    └── ...
```

#### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Page Object | PascalCase + Page | `HomePage`, `LoginPage` |
| Component | PascalCase | `Header`, `Navigation` |
| Custom Element | PascalCase | `Input`, `Button`, `Select` |
| Factory Function | $ + camelCase | `$input`, `$button` |
| Method | camelCase | `login`, `submitForm` |
| Variable | camelCase | `header`, `navigation` |

#### Module Organization

1. **Group by Feature**: Organize page objects by feature/area
2. **Keep Files Small**: Each page object should be focused
3. **Use Index Files**: Generate index files for easy imports
4. **Separate Interfaces**: Define interfaces separately for reuse

### Testing Strategies

#### Test Organization

1. **Page-Object Tests**: Tests that exercise page object functionality
2. **Component Tests**: Tests for reusable components
3. **Integration Tests**: Tests that exercise multiple page objects
4. **E2E Tests**: End-to-end tests with user flows

#### Test Naming

```typescript
// Good test names
describe('Login Page', () => {
    describe('Login Form', () => {
        test('should display validation errors for empty fields', async () => {
            // Test implementation
        });
        
        test('should navigate to dashboard after successful login', async () => {
            // Test implementation
        });
    });
});

// Bad test names
test('test1', async () => {
    // What does this test?
});

test('login test', async () => {
    // Too vague
});
```

#### Test Data Management

```typescript
// Good: Centralized test data
const testUsers = {
    valid: { username: 'test@example.com', password: 'Password123!' },
    invalid: { username: 'wrong', password: 'wrong' },
    locked: { username: 'locked@example.com', password: 'Password123!' }
};

// Bad: Hardcoded in tests
await page.login('test@example.com', 'Password123!');
```

### TypeScript Tips

#### Type Inference

playwright-elements provides excellent TypeScript inference out of the box.

```typescript
// Type is automatically inferred
const element = $('button'); // WebElement

// Type-safe method chaining
const header = $('.header')
    .with({
        logo: $('.logo'), // WebElement
        menu: $('.menu')  // WebElement
    });

// header type: WebElement & { logo: WebElement; menu: WebElement }
```

#### Type Assertions

When TypeScript can't infer types automatically:

```typescript
// Assert element type
const input = $('input') as WebElement & { customMethod: () => Promise<void> };

// Or use type predicate
function isCustomElement(element: WebElement): element is WebElement & CustomType {
    return 'customMethod' in element;
}
```

#### Generic Types

Use generics for reusable patterns:

```typescript
// Generic page object factory
function createPageObject<T extends Record<string, any>>(
    module: T
): { [K in keyof T]: T[K] extends new (...args: any[]) => infer Instance ? Instance : never } {
    const pages: any = {};
    for (const key of Object.keys(module) as Array<keyof T>) {
        const Class = module[key];
        if (typeof Class === 'function' && /^class/.test(Class.toString())) {
            pages[key] = new Class();
        }
    }
    return pages;
}
```

## Migration Guide

### From Other Frameworks

#### From Selenium WebDriver

**Selenium:**
```java
WebElement element = driver.findElement(By.cssSelector("button"));
element.click();
```

**playwright-elements:**
```typescript
import { $ } from 'playwright-elements';

const element = $('button');
await element.click();
```

**Key Differences:**
- All actions are `async/await` in Playwright
- No need to pass `driver` everywhere
- CSS selectors are the primary locator strategy
- No explicit WebElement type - just use the methods

#### From Cypress

**Cypress:**
```javascript
cy.get('button').click();
cy.contains('Login').should('be.visible');
```

**playwright-elements:**
```typescript
import { $ } from 'playwright-elements';

const button = $('button');
await button.click();
await button.expect().toBeVisible();
```

**Key Differences:**
- Playwright uses `await` instead of Cypress's command chaining
- `expect()` is from Playwright, not Chai
- More explicit selector strategy
- Better TypeScript support

#### From WebdriverIO

**WebdriverIO:**
```javascript
const element = await $('#button');
await element.click();
```

**playwright-elements:**
```typescript
import { $ } from 'playwright-elements';

const element = $('button');
await element.click();
```

**Key Differences:**
- Similar API surface
- playwright-elements adds type safety and better element organization
- Playwright has better performance

### Version Migration

#### Upgrading playwright-elements

1. **Check Breaking Changes**: Review the changelog for breaking changes
2. **Update Dependencies**: Update playwright-elements and Playwright
3. **Test Thoroughly**: Run all tests after upgrading
4. **Update Imports**: Check for any changed import paths

#### Migration Checklist

- [ ] Update package.json with new version
- [ ] Run `npm install` to update dependencies
- [ ] Check for breaking changes in changelog
- [ ] Update any deprecated APIs
- [ ] Run full test suite
- [ ] Update documentation references

## See Also

- [Get Started](./get_started.md)
- [WebElement Class](./web_element.md)
- [BrowserInstance](./browser_instance.md)
- [Customization](./customization.md)
- [Playwright Documentation](https://playwright.dev/docs/intro)

[Go to Main Page >>](./../README.md)
