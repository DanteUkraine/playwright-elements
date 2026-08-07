---
layout: default
title: Customization
---
[Go to Main Page >>](./../README.md)

# Customization

playwright-elements is designed to be highly extensible. This document covers various ways to customize and extend the framework to suit your specific testing needs.

- [Custom WebElement Classes](#custom-webelement-classes)
  - [Extending WebElement](#extending-webelement)
  - [Factory Function Pattern](#factory-function-pattern)
  - [Static $ Method Pattern](#static--method-pattern)
- [Custom Expect Matchers](#custom-expect-matchers)
  - [Basic Custom Matcher](#basic-custom-matcher)
  - [Typed Custom Matcher](#typed-custom-matcher)
  - [Extended Expect with ReturnType](#extended-expect-with-returntype)
- [Custom Page Object Patterns](#custom-page-object-patterns)
  - [Component-Based Page Objects](#component-based-page-objects)
  - [Factory Methods](#factory-methods)
  - [Mixin Patterns](#mixin-patterns)

## Custom WebElement Classes

One of the most powerful features of playwright-elements is the ability to create custom WebElement classes with domain-specific methods.

### Extending WebElement

Create a custom class that extends `WebElement` and add your own methods:

```typescript
import { WebElement } from 'playwright-elements';

class InputField extends WebElement {
    // Custom method to set value with clearing first
    public async set(value: string): Promise<void> {
        await this.fill("");
        await this.type(value, { delay: 50 });
    }
    
    // Custom method to get placeholder
    public async getPlaceholder(): Promise<string | null> {
        return this.getAttribute('placeholder');
    }
    
    // Custom method to clear and set value in one action
    public async clearAndSet(value: string): Promise<void> {
        await this.clear();
        await this.set(value);
    }
}
```

### Factory Function Pattern

Create a factory function that returns instances of your custom class:

```typescript
import { WebElement } from 'playwright-elements';

class InputField extends WebElement {
    public async set(value: string): Promise<void> {
        await this.fill("");
        await this.type(value, { delay: 50 });
    }
    
    // Static factory method
    static $(selector: string): InputField {
        return new InputField(selector);
    }
}

// Usage in page objects
class LoginPage {
    readonly username = InputField.$('input[name="username"]');
    readonly password = InputField.$('input[name="password"]');
}

// Usage in tests
const loginPage = new LoginPage();
await loginPage.username.set('john.doe');
await loginPage.password.set('secret123');
```

### Static $ Method Pattern

Alternative pattern using standalone factory functions:

```typescript
import { WebElement } from 'playwright-elements';

class InputField extends WebElement {
    public async set(value: string): Promise<void> {
        await this.fill("");
        await this.type(value, { delay: 50 });
    }
}

// Factory function
export function $input(selector: string): InputField {
    return new InputField(selector);
}

// Usage
class LoginPage {
    readonly username = $input('input[name="username"]');
    readonly password = $input('input[name="password"]');
}
```

### Complete Custom Element Library Example

```typescript
// custom-elements.ts
import { WebElement } from 'playwright-elements';

// Input element with custom methods
export class Input extends WebElement {
    async set(value: string): Promise<void> {
        await this.fill("");
        await this.type(value, { delay: 50 });
    }
    
    async clearAndSet(value: string): Promise<void> {
        await this.clear();
        await this.set(value);
    }
    
    static $(selector: string): Input {
        return new Input(selector);
    }
}

// Button element with custom methods
export class Button extends WebElement {
    async clickWithRetry(retries: number = 3, delay: number = 100): Promise<void> {
        for (let i = 0; i < retries; i++) {
            try {
                await this.click();
                return;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    static $(selector: string): Button {
        return new Button(selector);
    }
}

// Select element with custom methods
export class Select extends WebElement {
    async selectByVisibleText(text: string): Promise<void> {
        await this.locator.selectOption({ label: text });
    }
    
    async getSelectedText(): Promise<string | null> {
        const options = await this.locator.all();
        for (const option of options) {
            const isSelected = await option.isSelected();
            if (isSelected) {
                return await option.textContent();
            }
        }
        return null;
    }
    
    static $(selector: string): Select {
        return new Select(selector);
    }
}

// Page object using custom elements
class LoginPage {
    readonly username = Input.$('input[name="username"]');
    readonly password = Input.$('input[name="password"]');
    readonly loginButton = Button.$('button[type="submit"]');
    readonly rememberMe = Input.$('input[name="remember"]');
}

// Usage in tests
const loginPage = new LoginPage();
await loginPage.username.set('user@example.com');
await loginPage.password.set('password123');
await loginPage.rememberMe.setChecked(true);
await loginPage.loginButton.clickWithRetry();
```

## Custom Expect Matchers

playwright-elements allows you to extend Playwright's expect with custom matchers that work seamlessly with WebElement instances.

### Basic Custom Matcher

Create a simple custom matcher:

```typescript
import { expect, Locator } from '@playwright/test';

expect.extend({
    /**
     * Checks if element has a specific CSS class
     */
    async toHaveClass(locator: Locator, expectedClass: string) {
        const classes = await locator.getAttribute('class');
        const pass = classes?.split(' ').includes(expectedClass);
        
        return {
            pass,
            message: () => `Expected ${locator} to have class "${expectedClass}"`,
            expected: expectedClass,
            actual: classes
        };
    },
    
    /**
     * Checks if element has specific data attribute
     */
    async toHaveDataAttribute(locator: Locator, attribute: string, expectedValue?: string) {
        const actualValue = await locator.getAttribute(`data-${attribute}`);
        const pass = expectedValue 
            ? actualValue === expectedValue 
            : actualValue !== null;
        
        return {
            pass,
            message: () => expectedValue
                ? `Expected ${locator} to have data-${attribute}="${expectedValue}", but got "${actualValue}"`
                : `Expected ${locator} to have data-${attribute} attribute`,
            expected: expectedValue,
            actual: actualValue
        };
    }
});

// Usage in tests
import { $, test } from 'playwright-elements';

test('custom matcher example', async ({ goto }) => {
    await goto('/');
    
    const button = $('button.primary');
    await button.expect().toHaveClass('active');
    await button.expect().toHaveDataAttribute('testid', 'submit-button');
});
```

### Typed Custom Matcher

For better TypeScript support, use typed custom matchers:

```typescript
import { expect, Locator, Expect } from '@playwright/test';
import { WebElement } from 'playwright-elements';

// Extend expect with typed matchers
const customMatchers = {
    async toHaveAriaLabel(locator: Locator, expectedLabel: string) {
        const actualLabel = await locator.getAttribute('aria-label');
        const pass = actualLabel === expectedLabel;
        
        return {
            pass,
            message: () => `Expected ${locator} to have aria-label "${expectedLabel}", but got "${actualLabel}"`
        };
    },
    
    async toBeInViewport(locator: Locator) {
        const boundingBox = await locator.boundingBox();
        const pass = boundingBox !== null && 
                    boundingBox.width > 0 && 
                    boundingBox.height > 0;
        
        return {
            pass,
            message: () => `Expected ${locator} to be in viewport`
        };
    }
};

// Create extended expect
export const extendedExpect = expect.extend(customMatchers);

// Custom WebElement with extended expect
class AccessibleElement extends WebElement {
    public customExpect(message?: string) {
        return extendedExpect(this.locator, message);
    }
}

// Usage
test('typed matcher example', async ({ goto }) => {
    await goto('/accessibility');
    
    const element = new AccessibleElement('.accessible-component');
    await element.customExpect().toHaveAriaLabel('Main content');
    await element.customExpect().toBeInViewport();
});
```

### Extended Expect with ReturnType

For full TypeScript autocompletion with custom matchers:

```typescript
import { expect, Locator, Expect } from '@playwright/test';
import { WebElement } from 'playwright-elements';

// Define custom matchers
const customMatchers = {
    async toHaveCustomProperty(locator: Locator, property: string, value: any) {
        // Implementation
        return { pass: true, message: () => '' };
    }
};

// Create extended expect with proper typing
const extendedExpect = expect.extend(customMatchers);

// Custom WebElement with typed expect
class CustomWebElement extends WebElement {
    public customExpect(message?: string): ReturnType<typeof extendedExpect<Locator>> {
        return extendedExpect(this.locator, message);
    }
}

// Factory function
export function $custom(selector: string): CustomWebElement {
    return new CustomWebElement(selector);
}

// Usage with full TypeScript support
test('typed expect example', async ({ goto }) => {
    await goto('/');
    
    const element = $custom('.my-element');
    
    // TypeScript will autocomplete custom matchers
    await element.customExpect().toHaveCustomProperty('data-test', 'value');
});
```

## Custom Page Object Patterns

### Component-Based Page Objects

Organize your page objects by components rather than pages:

```typescript
// components/header.ts
export class Header {
    readonly logo = $('.header-logo');
    readonly navigation = $('.nav');
    readonly userMenu = $('.user-menu');
    
    async navigateTo(to: 'home' | 'about' | 'contact') {
        await this.navigation.$(`a[href="/${to}"]`).click();
    }
}

// components/footer.ts
export class Footer {
    readonly copyright = $('.copyright');
    readonly links = $('.footer-links a');
}

// pages/home.page.ts
import { Header } from '../components/header';
import { Footer } from '../components/footer';

export class HomePage {
    readonly header = new Header();
    readonly footer = new Footer();
    readonly content = $('.main-content');
    
    // Reuse header methods
    async goToAbout() {
        await this.header.navigateTo('about');
    }
}
```

### Factory Methods

Create factory methods to simplify page object creation:

```typescript
// page-factory.ts
import { buildPageObject, PageObject } from 'playwright-elements';
import * as pages from './pages';

export function createPageObject<T extends Record<string, any>>(module: T): PageObject<T> {
    return buildPageObject(module);
}

// Usage in tests
import { test } from '@playwright/test';
import { createPageObject } from './page-factory';
import * as pageModules from './pages';

test.describe('Factory Pattern', () => {
    test.beforeEach(async ({ page }) => {
        // Create page object
        const pageObject = createPageObject(pageModules);
        
        // Store in test context
        // ...
    });
});
```

### Mixin Patterns

Use TypeScript mixins to add common functionality to multiple page objects:

```typescript
// mixins/timestamp.mixin.ts
type Constructor<T = {}> = new (...args: any[]) => T;

export function WithTimestamp<TBase extends Constructor<{}>>(Base: TBase) {
    return class extends Base {
        timestamp = Date.now();
        
        async logAction(action: string) {
            console.log(`[${new Date(this.timestamp).toISOString()}] ${action}`);
        }
    };
}

// mixins/logging.mixin.ts
export function WithLogging<TBase extends Constructor<{}>>(Base: TBase) {
    return class extends Base {
        async log(message: string) {
            console.log(`[LOG] ${message}`);
        }
    };
}

// pages/base.page.ts
import { WebElement } from 'playwright-elements';
import { WithTimestamp } from '../mixins/timestamp.mixin';
import { WithLogging } from '../mixins/logging.mixin';

// Base page with mixins
const BasePage = WithTimestamp(WithLogging(class {}));

export class BasePage extends BasePage {
    // Common functionality
}

// pages/login.page.ts
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    readonly username = $('input[name="username"]');
    readonly password = $('input[name="password"]');
    
    async login(username: string, password: string) {
        await this.logAction(`Logging in as ${username}`);
        await this.username.fill(username);
        await this.password.fill(password);
        await this.log('Login form filled');
    }
}
```

## Best Practices

### 1. Naming Conventions

- Use `$` prefix for factory functions: `$input()`, `$button()`, `$custom()`
- Use PascalCase for custom WebElement classes: `InputField`, `Button`, `Select`
- Use camelCase for methods: `set()`, `clearAndSet()`, `clickWithRetry()`

### 2. Type Safety

- Always use TypeScript generics for type-safe custom elements
- Extend proper base types (`WebElement`, `Locator`)
- Use `ReturnType<>` for expect extensions

### 3. Documentation

- Document all custom methods with JSDoc
- Include usage examples in documentation
- Document parameters and return types

### 4. Testing

- Test custom elements independently
- Test custom matchers with various inputs
- Test edge cases and error conditions

### 5. Organization

- Group related custom elements together
- Keep custom matchers in a dedicated file
- Use consistent import/export patterns

## See Also

- [WebElement Class](./web_element.md)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Playwright Expect Documentation](https://playwright.dev/docs/test-assertions)

[Go to Main Page >>](./../README.md)
