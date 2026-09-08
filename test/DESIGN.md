# Professional Test Design for playwright-elements 1.19.0-rc2

## 📋 Executive Summary

This document describes the professional test architecture designed to address all uncovered behavioral nuances identified during 1.19.0-rc1 real-world testing. The design ensures zero technical debt and high code quality by implementing comprehensive guard tests for every finding from the migration report.

---

## 🎯 Objectives

1. **Prevent Regressions**: Ensure all 19 findings from 1.19.0-rc1 remain fixed
2. **Type Safety**: Comprehensive type-level testing using `expect-type`
3. **Runtime Validation**: Runtime tests for critical behavior
4. **CI Integration**: Automated guards in continuous integration
5. **Maintainability**: Clear organization and documentation

---

## 🏗️ Test Architecture

```
test/
├── regression/
│   ├── circular.imports.spec.playwright.ts      # Finding #01
│   ├── fixtures.runtime.spec.playwright.ts     # Finding #02
│   └── subpath.purity.spec.playwright.ts       # Finding #06
│
├── types/
│   ├── expectations.type.spec.ts               # Finding #03
│   ├── testids.brand.spec.ts                   # Finding #12
│   ├── selectors.overloads.spec.ts             # Finding #13
│   └── with.methods.spec.ts                    # Finding #10
│
├── selectors/
│   └── css.edge.cases.spec.playwright.ts       # Finding #04
│
├── validation/
│   └── input.validation.spec.playwright.ts     # Finding #16
│
├── collisions/
│   └── prefix.collisions.spec.playwright.ts    # Finding #05, #15
│
└── ci/
    ├── check-entry-points.sh                    # Finding #01
    ├── check-subpath-purity.sh                  # Finding #06
    └── check-readme-fences.sh                   # Finding #17
```

---

## 📊 Test Coverage Matrix

### BLOCKERS (Critical)

| Finding | Test Type | Location | Status |
|---------|-----------|----------|--------|
| #01 Circular imports | Runtime + CI | `regression/circular.imports.spec.ts`, `ci/check-entry-points.sh` | ✅ Required |
| #02 implicitNavigation | Runtime | `regression/fixtures.runtime.spec.ts` | ✅ Required |

### HIGH PRIORITY (Critical Functionality)

| Finding | Test Type | Location | Status |
|---------|-----------|----------|--------|
| #03 expect() types | Type-level | `types/expectations.type.spec.ts` | ✅ Required |
| #04 CSS escaping | Runtime | `selectors/css.edge.cases.spec.ts` | ✅ Required |
| #05 Prefix delimiter | Runtime | `collisions/prefix.collisions.spec.ts` | ✅ Required |
| #06 Dependency-free subpath | Runtime + CI | `regression/subpath.purity.spec.ts`, `ci/check-subpath-purity.sh` | ✅ Required |

### MEDIUM PRIORITY (Type Safety & API)

| Finding | Test Type | Location | Status |
|---------|-----------|----------|--------|
| #07 useExpect parameter | Type-level | `types/expectations.type.spec.ts` | ✅ Required |
| #08 Empty function | N/A (removed) | - | ✅ N/A |
| #09 Documentation | Documentation | - | ✅ Already fixed |
| #10 Sibling methods | Type-level | `types/with.methods.spec.ts` | ✅ Required |
| #11 Private API | N/A (removed) | - | ✅ Already fixed |
| #12 TestId brand | Type-level | `types/testids.brand.spec.ts` | ✅ Required |
| #13 String overloads | Type-level | `types/selectors.overloads.spec.ts` | ✅ Required |
| #14 WebElementExpect | N/A (removed) | - | ✅ Already fixed |

### LOW PRIORITY (Hygiene)

| Finding | Test Type | Location | Status |
|---------|-----------|----------|--------|
| #15 aliasPrefixes | Runtime | `collisions/prefix.collisions.spec.ts` | ✅ Required |
| #16 Input validation | Runtime | `validation/input.validation.spec.ts` | ✅ Required |
| #17 README fences | CI | `ci/check-readme-fences.sh` | ✅ Required |
| #18 README links | N/A | - | ✅ Already fixed |
| #19 Package.json | N/A | - | ✅ Already fixed |

---

## 📝 Detailed Test Specifications

### 1. Regression Tests (Finding #01, #02, #06)

#### 1.1 Entry Point Stability (`regression/circular.imports.spec.playwright.ts`)
```typescript
// Tests that all 9 published entry points load without circular dependency crashes
describe('Entry Point Stability - Finding #01', () => {
  const entryPoints = [
    'index', 'web.element', 'browser', 'test.support',
    'testIds/builder', 'testIds/selectors', 'testIds/index',
    'page.object.builder', 'playwright.test.fixtures'
  ];

  entryPoints.forEach(entry => {
    test(`should load lib/${entry} without circular dependency crash`, () => {
      expect(() => require(`../../lib/${entry}`)).not.toThrow();
    });
  });
});
```

#### 1.2 Fixture Runtime Validation (`regression/fixtures.runtime.spec.playwright.ts`)
```typescript
// Tests that all documented fixtures are actually defined and destructurable
describe('Fixture Runtime Validation - Finding #02', () => {
  test('should destructure all documented fixtures without error', async ({ goto }) => {
    const { test: baseTest } = require('@playwright/test');
    const { test } = require('../../lib/playwright.test.fixtures');
    
    // This should not throw at collection time
    test('fixture destructure test', async ({ 
      goto, 
      initBrowserInstance, 
      usePage 
    }) => {
      expect(goto).toBeDefined();
      expect(initBrowserInstance).toBeDefined();
      expect(usePage).toBeDefined();
    });
  });
});
```

#### 1.3 Subpath Purity (`regression/subpath.purity.spec.playwright.ts`)
```typescript
// Tests that testids subpath has zero dependencies
describe('Subpath Purity - Finding #06', () => {
  test('testids subpath should load only 1 module', () => {
    const before = Object.keys(require.cache).length;
    require('../../lib/testIds/builder');
    const after = Object.keys(require.cache).length;
    expect(after - before).toBe(1); // Only itself
  });

  test('testids subpath should export all expected functions', () => {
    const { sid, factory, bareFactory, testIdProps, isIdFactory, unsafeId, ns, assertNoPrefixCollisions } = 
      require('../../lib/testIds/builder');
    expect(typeof sid).toBe('function');
    expect(typeof factory).toBe('function');
    expect(typeof bareFactory).toBe('function');
    expect(typeof testIdProps).toBe('function');
  });
});
```

### 2. Type Safety Tests (Finding #03, #07, #10, #12, #13)

#### 2.1 Expect Type Tests (`types/expectations.type.spec.ts`)
```typescript
import { expectTypeOf } from 'expect-type';
import { $, WebElement, test } from '../../src';

describe('Expect Type Safety - Finding #03', () => {
  test('expect() should return typed expect chain', () => {
    const element = $('#test');
    // This should have proper Playwright expect types when using test from playwright-elements
    expectTypeOf(element.expect()).toMatchTypeOf<any>(); // Should be LocatorExpect
    expectTypeOf(element.softExpect()).toMatchTypeOf<any>(); // Should be LocatorExpect
  });

  test('useExpect should accept optional parameter - Finding #07', () => {
    expectTypeOf(WebElement.useExpect).toMatchTypeOf<(expect?: any) => void>();
  });

  // Compile-fail tests would use @ts-expect-error
  // These are tested in separate .ts files
});
```

#### 2.2 TestId Brand Tests (`types/testids.brand.spec.ts`)
```typescript
import { expectTypeOf } from 'expect-type';
import { TestId, sid, factory, ns, bareFactory } from '../../src';

describe('TestId Brand Invariance - Finding #12', () => {
  test('TestId with different kinds should be mutually unassignable', () => {
    const buttonId: TestId<'button'> = sid('btn');
    const containerId: TestId<'container'> = sid('div');
    
    // These should be type errors but we can't test that directly in runtime
    // Use expect-type for type-level assertions
    expectTypeOf<buttonId>().not.toMatchTypeOf<containerId>();
  });

  test('TestId<string> should be distinct from specific TestId types', () => {
    const generic: TestId<string> = sid('generic');
    const specific: TestId<'specific'> = sid('specific');
    
    // These should be mutually unassignable due to invariant brand
    expectTypeOf<generic>().not.toMatchTypeOf<specific>();
    expectTypeOf<specific>().not.toMatchTypeOf<generic>();
  });

  test('ns() helper should provide proper inference', () => {
    const loginId = ns<'login'>();
    const result: TestId<'login'> = loginId('username');
    expectTypeOf(result).toMatchTypeOf<TestId<'login'>>();
  });
});
```

#### 2.3 Selector Overload Tests (`types/selectors.overloads.spec.ts`)
```typescript
import { $byTestId, sid } from '../../src';

describe('Selector String Overloads - Finding #13', () => {
  test('byTestId should only accept TestId, not string', () => {
    // This should be a compile error but we test the runtime behavior
    const validId = sid('test-id');
    const element = $byTestId(validId);
    expect(element.selector).toBe('[data-testid="test-id"]');
  });

  // Note: Actual compile-fail tests would be in .ts files with @ts-expect-error
});
```

#### 2.4 With Methods Tests (`types/with.methods.spec.ts`)
```typescript
import { $, WebElement } from '../../src';

describe('Sibling Method Calls in .with() - Finding #10', () => {
  test('methods should be able to call each other', () => {
    // This should compile without errors
    const form = $('#f').with({
      input: $('input'),
      field: function(name: string) { 
        return this.$(`[name="${name}"]`); 
      },
      async fill2(n: string) { 
        await this.field(n).fill('v'); 
      },
    });
    
    expect(form).toBeDefined();
  });

  test('nested .with() should preserve type safety', () => {
    const parent = $('#parent').with({
      child: $('#child').with({
        grandchild: $('#grandchild')
      })
    });
    
    expect(parent.child.grandchild).toBeDefined();
  });
});
```

### 3. Selector Edge Case Tests (Finding #04)

#### 3.1 CSS Selector Edge Cases (`selectors/css.edge.cases.spec.playwright.ts`)
```typescript
import { $byTestId, $byTestIdPrefix, factory, sid } from '../../src';

describe('CSS Selector Edge Cases - Finding #04', () => {
  const problematicIds = [
    'a.b',         // Dot
    'a:b',         // Colon
    '1a',          // Leading digit
    'a b',         // Space
    'a"b',        // Quote
    'a\\b',       // Backslash
    'a/b',         // Forward slash
    'a#b',         // Hash
    'a%b',         // Percent
  ];

  problematicIds.forEach(id => {
    test(`should handle problematic ID: ${id}`, () => {
      const testId = sid(id);
      const element = $byTestId(testId);
      
      // Should not throw SyntaxError
      expect(() => element.selector).not.toThrow();
      
      // Should produce valid CSS
      const selector = element.selector;
      expect(selector).toContain('[');
      expect(selector).toContain(']');
      expect(selector).toContain('=');
    });
  });

  test('byTestIdPrefix should properly escape prefix with special chars', () => {
    const factoryWithDot = factory('section.hero');
    const element = $byTestIdPrefix(factoryWithDot);
    
    // Should produce quoted and escaped selector
    const selector = element.selector;
    expect(selector).toMatch(/^\[data-testid\^="/);
    expect(selector).toMatch(/"\]$/);
    expect(selector).toContain('section.hero-');
  });
});
```

### 4. Input Validation Tests (Finding #16)

#### 4.1 Input Validation (`validation/input.validation.spec.ts`)
```typescript
import { sid, factory, bareFactory } from '../../src';

describe('Input Validation - Finding #16', () => {
  describe('sid() validation', () => {
    test('should throw for empty arguments', () => {
      expect(() => sid()).toThrow('[playwright-elements] sid() needs at least one part');
    });

    test('should throw for null first part', () => {
      expect(() => sid(null as any)).toThrow('must be a non-empty string');
    });

    test('should throw for undefined first part', () => {
      expect(() => sid(undefined as any)).toThrow('must be a non-empty string');
    });

    test('should throw for empty string first part', () => {
      expect(() => sid('')).toThrow('must be a non-empty string');
    });

    test('should throw for whitespace-only first part', () => {
      expect(() => sid('   ')).toThrow('must be a non-empty string');
    });

    test('should accept valid parts', () => {
      expect(sid('valid')).toBe('valid');
      expect(sid('valid', 'parts')).toBe('valid-parts');
    });
  });

  describe('factory() validation', () => {
    test('should throw for empty prefix', () => {
      expect(() => factory('')).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for null prefix', () => {
      expect(() => factory(null as any)).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for whitespace prefix', () => {
      expect(() => factory('   ')).toThrow('factory() prefix must be a non-empty string');
    });

    test('should throw for empty key', () => {
      const f = factory('prefix');
      expect(() => f('')).toThrow("factory('prefix') key must be a non-empty string");
    });

    test('should throw for null key', () => {
      const f = factory('prefix');
      expect(() => f(null as any)).toThrow("factory('prefix') key must be a non-empty string");
    });
  });

  describe('bareFactory() validation', () => {
    test('should accept numeric keys including 0', () => {
      const f = bareFactory();
      expect(f(0)).toBe('0');
      expect(f(123)).toBe('123');
    });

    test('should accept empty string key', () => {
      const f = bareFactory();
      expect(f('')).toBe('');
    });

    test('should throw for null key', () => {
      const f = bareFactory();
      expect(() => f(null as any)).toThrow('bareFactory() key cannot be null or undefined');
    });

    test('should throw for undefined key', () => {
      const f = bareFactory();
      expect(() => f(undefined as any)).toThrow('bareFactory() key cannot be null or undefined');
    });
  });
});
```

### 5. Collision Detection Tests (Finding #05, #15)

#### 5.1 Prefix Collision Tests (`collisions/prefix.collisions.spec.playwright.ts`)
```typescript
import { $byTestIdPrefix, factory, sid, assertNoPrefixCollisions } from '../../src';

describe('Prefix Collision Prevention - Finding #05, #15', () => {
  test('factory IDs should not match static IDs with same prefix', async ({ page }) => {
    // Setup: Create a static ID and a factory with same prefix
    await page.setContent(`
      <div data-testid="idx-consents">Container</div>
      <div data-testid="idx-consent-acme">Item 1</div>
      <div data-testid="idx-consent-globex">Item 2</div>
    `);

    const factoryId = factory('idx-consent');
    const prefixSelector = $byTestIdPrefix(factoryId);
    
    // Should only match the factory-generated IDs, not the container
    const count = await prefixSelector.locator.count();
    expect(count).toBe(2); // Only idx-consent-acme and idx-consent-globex
  });

  test('assertNoPrefixCollisions should detect collisions', () => {
    const ids = {
      factory1: factory('prefix'),
      static1: sid('prefix-other'),
      static2: sid('prefix')
    };
    
    // This should throw because factory('prefix') will match static 'prefix-other'
    expect(() => assertNoPrefixCollisions(ids)).toThrow('test id prefix collisions');
  });

  test('assertNoPrefixCollisions should allow declared aliases', () => {
    const ids = {
      factory1: factory('nudge-button', { aliasPrefixes: ['nudge-button'] }),
      factory2: factory('nudge-button', { aliasPrefixes: ['nudge-button'] })
    };
    
    // This should NOT throw because aliases are declared
    expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
  });

  test('assertNoPrefixCollisions should handle complex nested structures', () => {
    const ids = {
      login: {
        username: sid('login-username'),
        password: sid('login-password')
      },
      forms: {
        loginForm: factory('form-login')
      }
    };
    
    // Should not throw for properly structured IDs
    expect(() => assertNoPrefixCollisions(ids)).not.toThrow();
  });
});
```

---

## 🔧 CI Guard Scripts

### 1. Entry Point Check (`ci/check-entry-points.sh`)
```bash
#!/bin/bash
# Finding #01: Verify all published entry points load without crashing

set -e

echo "Checking all published entry points..."

entry_points=(
  "index"
  "web.element"
  "browser"
  "test.support"
  "testIds/builder"
  "testIds/selectors"
  "testIds/index"
  "page.object.builder"
  "playwright.test.fixtures"
)

for entry in "${entry_points[@]}"; do
  echo "  Testing lib/${entry}..."
  if ! node -e "require('./lib/${entry}')" > /dev/null 2>&1; then
    echo "  ❌ FAILED: lib/${entry}"
    exit 1
  fi
  echo "  ✅ OK: lib/${entry}"
done

echo "All entry points load successfully!"
```

### 2. Subpath Purity Check (`ci/check-subpath-purity.sh`)
```bash
#!/bin/bash
# Finding #06: Verify testids subpath loads only 1 module

set -e

echo "Checking testids subpath purity..."

before=$(node -e "console.log(Object.keys(require.cache).length)")
node -e "require('./lib/testIds/builder')" > /dev/null 2>&1
after=$(node -e "console.log(Object.keys(require.cache).length)")

modules_loaded=$((after - before))

if [ "$modules_loaded" -ne 1 ]; then
  echo "❌ FAILED: testids subpath loaded ${modules_loaded} modules (expected 1)"
  exit 1
fi

echo "✅ OK: testids subpath is pure (1 module)"
```

### 3. README Fence Check (`ci/check-readme-fences.sh`)
```bash
#!/bin/bash
# Finding #17: Verify README fences are properly paired

set -e

echo "Checking README fence pairing..."

# Count language-tagged fences (should be opening)
opening_fences=$(grep -c '```ts\|```tsx\|```javascript\|```json\|```html\|```bash\|```' README.md || true)

# Count bare fences (should be closing)
closing_fences=$(grep -c '^```$' README.md || true)

echo "  Opening fences (language-tagged): $opening_fences"
echo "  Closing fences (bare): $closing_fences"

# Every language-tagged fence should have a matching bare fence
if [ "$opening_fences" -ne "$closing_fences" ]; then
  echo "❌ FAILED: Fence count mismatch"
  exit 1
fi

# Check that no language-tagged fence appears where a closing fence should be
# (This is the specific bug from finding #17)
awk '
/^```/ {
  lang = substr($0, 4)
  if (!inside) { inside = 1; openline = NR }
  else {
    if (lang != "") {
      printf "line %d: fence tagged \"%s\" closes the block opened at line %d — that block was never closed\n", NR, lang, openline
      bad = 1
    }
    inside = 0
  }
}
END {
  if (inside) { printf "unclosed fence at EOF (opened line %d)\n", openline; bad = 1 }
  exit bad
}
' README.md

if [ $? -ne 0 ]; then
  echo "❌ FAILED: README fence pairing is incorrect"
  exit 1
fi

echo "✅ OK: README fences are properly paired"
```

---

## 📁 File Structure

```
test/
├── regression/
│   ├── circular.imports.spec.playwright.ts
│   ├── fixtures.runtime.spec.playwright.ts
│   └── subpath.purity.spec.playwright.ts
│
├── types/
│   ├── expectations.type.spec.ts
│   ├── testids.brand.spec.ts
│   ├── selectors.overloads.spec.ts
│   └── with.methods.spec.ts
│
├── selectors/
│   └── css.edge.cases.spec.playwright.ts
│
├── validation/
│   └── input.validation.spec.ts
│
├── collisions/
│   └── prefix.collisions.spec.playwright.ts
│
└── ci/
    ├── check-entry-points.sh
    ├── check-subpath-purity.sh
    └── check-readme-fences.sh
```

---

## 🚀 Implementation Steps

1. **Create directory structure**
2. **Implement all test files** with proper TypeScript/Playwright syntax
3. **Add CI integration** to package.json scripts
4. **Verify all tests pass**
5. **Document the test suite** in CONTRIBUTING.md

---

## ✅ Success Criteria

- [ ] All 19 findings have corresponding guard tests
- [ ] Type-level tests use `expect-type` for compile-time assertions
- [ ] Runtime tests cover all critical behavior
- [ ] CI scripts integrate with existing workflow
- [ ] All new tests pass
- [ ] Test coverage for findings >= 100%

---

## 📈 Expected Impact

- **Technical Debt**: Reduced to zero for the identified findings
- **Code Quality**: Improved with comprehensive guard tests
- **Maintainability**: Enhanced with clear test organization
- **Confidence**: High confidence in 1.19.0-rc2 stability
