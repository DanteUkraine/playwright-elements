# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.19.0] - 2025-XX-XX

### 🚀 Major Changes

- **New ExpectProvider Architecture**: WebElement assertions now use a configurable provider pattern, decoupling the core library from @playwright/test. This allows WebElement to be used in production code without test framework dependencies.

- **Type-Safe TestIds Module**: New `testIds` module with branded types for test ID generation, preventing ID misuse through the type system. Available via zero-dependency import `playwright-elements/testids`.

- **Custom Matcher Support**: Custom matchers added via `expect.extend()` now work with WebElement instances when configured through `setExpectProvider()`.

### 🔧 Breaking Changes

- **Assertion Configuration**: `expect()` and `softExpect()` now require provider configuration. For Playwright Test users, this is automatic when importing from `playwright-elements` or `playwright-elements/test`. For deep imports (e.g., `playwright-elements/lib/web.element`), manual configuration is required via `WebElement.setExpectProvider()`.

### ✨ New Features

- **`setExpectProvider()`**: New static method to configure assertion providers for WebElement instances.
- **`testIds` module**: Type-safe test ID generation with `sid()`, `factory()`, `bareFactory()`, `ns()`, `testIdProps()`, `unsafeId()`, and `assertNoPrefixCollisions()`.
- **`$byTestId` and related selectors**: Type-safe selectors that work with the new TestId types.

### 🐛 Bug Fixes

- Fixed type regression where `element.expect()` and `element.softExpect()` returned `any` instead of Playwright's full matcher types (regression from 1.18.2).
- Fixed `$byTestId` and `testIdProps` to accept typed `TestId<K>` parameters (previously only accepted `TestId<string>`).

### 📝 Documentation Updates

- Updated README examples to fix missing `avatar` field in Component-Driven Testing example.
- Fixed README fixture examples to properly use `TestFixtures` generic parameter in `baseTest.extend()`.
- Added documentation about object destructuring pattern requirement for Playwright fixture parameters.
- Added comprehensive migration guide for 1.18.x → 1.19.0.

### 📦 Packaging

- Added zero-dependency entry point at `playwright-elements/testids` for use in production code.
- Added exports for `./testIds/builder` and `./testIds/selectors` subpaths.

### ⚠️ Deprecations

- `WebElement.useExpect()` is deprecated in favor of `WebElement.setExpectProvider()`. The old method still works for backward compatibility but new code should use `setExpectProvider()`.

---

## [1.18.2] - 2024-XX-XX

### Previous Version

For changes in 1.18.2 and earlier, see the Git history.

---

[1.19.0]: https://github.com/DanteUkraine/playwright-elements/compare/1.18.2...1.19.0
[1.18.2]: https://github.com/DanteUkraine/playwright-elements/tree/1.18.2
