---
layout: default
title: Utilities
---
[Go to Main Page >>](./../README.md)

# Utilities

This document describes utility functions provided by playwright-elements that enhance your testing experience.

- [initDesktopOrMobile()](#initdesktopormobile)

## initDesktopOrMobile()

Utility function for conditional logic based on mobile/desktop context.

### Purpose
This utility allows you to write responsive tests that adapt to the current browser context (mobile or desktop) without manual if-checks.

### Signature
```typescript
function initDesktopOrMobile<T>(desktop: T, mobile: T): T
```

### Description
Returns `desktop` value if the current context is **not** mobile (i.e., `BrowserInstance.isContextMobile` is `false`), otherwise returns `mobile` value. This enables clean, declarative responsive testing patterns.

### Usage Examples

#### Basic Usage with Selectors
```typescript
import { initDesktopOrMobile, $ } from 'playwright-elements';

// Different selectors for mobile vs desktop navigation
const navigation = initDesktopOrMobile(
  $('.desktop-nav'),      // Used when isContextMobile is false
  $('.mobile-nav')        // Used when isContextMobile is true
);

// Use in page object
class Header {
  readonly nav = initDesktopOrMobile(
    $('.desktop-navigation'),
    $('.mobile-hamburger-menu')
  );
}
```

#### With Values
```typescript
import { initDesktopOrMobile } from 'playwright-elements';

// Different timeout values
const timeout = initDesktopOrMobile(5000, 10000);

// Different wait strategies
const waitStrategy = initDesktopOrMobile('networkidle', 'domcontentloaded');
```

#### With Page Objects
```typescript
import { initDesktopOrMobile } from 'playwright-elements';
import { DesktopPage } from './pages/desktop.page';
import { MobilePage } from './pages/mobile.page';

// Conditional page object instantiation
const currentPage = initDesktopOrMobile(new DesktopPage(), new MobilePage());

await currentPage.navigate();
```

#### With Configuration Objects
```typescript
import { initDesktopOrMobile } from 'playwright-elements';

const config = initDesktopOrMobile(
  { viewport: { width: 1920, height: 1080 } },  // Desktop config
  { viewport: { width: 375, height: 812 } }    // Mobile config (iPhone X)
);
```

#### In Custom Methods
```typescript
import { $, initDesktopOrMobile, WebElement } from 'playwright-elements';

class ResponsiveButton extends WebElement {
  async clickWithRetry() {
    const maxRetries = initDesktopOrMobile(3, 5); // More retries on mobile
    const delay = initDesktopOrMobile(100, 500); // Longer delay on mobile
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `desktop` | `T` | Yes | Value to use when context is **not** mobile |
| `mobile` | `T` | Yes | Value to use when context is mobile |

### Returns

| Type | Description |
|------|-------------|
| `T` | Either `desktop` or `mobile` based on `BrowserInstance.isContextMobile` |

### Dependencies

This utility relies on `BrowserInstance.isContextMobile` to determine the current context.

### Integration with Playwright Test

Works seamlessly with Playwright's device presets:

```typescript
import { test } from '@playwright/test';
import { devices } from '@playwright/test';
import { initDesktopOrMobile, $ } from 'playwright-elements';

test.describe('Responsive Testing', () => {
  test.use(devices['Desktop Chrome']);
  
  test('should use desktop selector on desktop', async () => {
    const element = initDesktopOrMobile($('.desktop'), $('.mobile'));
    // element will be $('.desktop')
  });
});

test.describe('Mobile Testing', () => {
  test.use(devices['iPhone 13']);
  
  test('should use mobile selector on mobile', async () => {
    const element = initDesktopOrMobile($('.desktop'), $('.mobile'));
    // element will be $('.mobile')
  });
});
```

### Best Practices

1. **Use for Responsive Elements**: Perfect for elements that have different selectors or behaviors on mobile vs desktop
2. **Combine with Device Presets**: Use Playwright's device presets for consistent testing
3. **Keep Logic Simple**: Each call should handle one responsive decision
4. **Type Safety**: The generic type `T` ensures type safety between desktop and mobile values
5. **Avoid Overuse**: Only use when necessary - prefer consistent selectors when possible

### Common Use Cases

- Different navigation menus (hamburger vs desktop)
- Different form layouts
- Different button placements
- Different timeout values
- Different viewport configurations
- Different animation behaviors

### See Also

- [BrowserInstance.isContextMobile](./browser_instance.md#is-mobile-context)
- [Mobile Testing Guide](./get_started.md#usage-with-playwright-test)
- [Playwright Device Presets](https://playwright.dev/docs/emulation#devices)

[Go to Main Page >>](./../README.md)
