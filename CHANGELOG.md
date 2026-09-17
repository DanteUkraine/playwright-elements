# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.19.0] - 2026-09-14

### 🚀 Major Changes



- **Type-Safe TestIds Module**: New `testIds` module with branded types for test ID generation, preventing ID misuse through the type system. Available via zero-dependency import `playwright-elements/testids`, or as a standalone package `@playwright-elements/testids` for true install-time isolation.

- **Custom Matcher Support**: Custom matchers added via `expect.extend()` now work seamlessly with WebElement instances and provide full TypeScript autocomplete.

### 🔧 Breaking Changes

- **TestId brand migration**: The `TestId` type migrated from `unique symbol` brand to a structural string brand (`__testIdBrand: "pe/testids"`). Two installed copies of the package now produce interoperable types. The `Kind` parameter is now covariant (not invariant): `TestId<'button'>` is assignable to `TestId<string>` but not vice versa. Plain strings are still rejected.

- **Custom Matcher Integration**: `expect()` and `softExpect()` now directly use @playwright/test's expect, so custom matchers added via `expect.extend()` work automatically with full TypeScript autocomplete.

### ✨ New Features


- **`testIds` module**: Type-safe test ID generation with `sid()`, `factory()`, `bareFactory()`, `ns()`, `testIdProps()`, `testIdValue()`, `unsafeId()`, and `assertNoPrefixCollisions()`.
- **`$byTestId` and related selectors**: Type-safe selectors that work with the new TestId types. Now accepts `string` (A7) for foreign registries.
- **Production stripping**: `testIdProps()` and `testIdValue()` honour a build-time-foldable flag (`TEST_IDS_ENABLED` / `PE_TESTIDS` / `NODE_ENV`). IDs are stripped from production builds automatically.
- **`createStrippableAttribute`**: Universal primitive for any strippable identity attribute (data-testid, data-qa, data-section-part). One mechanism covers 100% of identity attributes.
- **`createTestIds({ attribute })`**: Configurable factory for custom attribute names without global mutable state.
- **Zero-dep string selectors**: `testIdSelector`, `testIdPrefixSelector`, `testIdContainsSelector`, `testIdEndsWithSelector` exported from `@playwright-elements/testids` — usable in vitest/jsdom without Playwright.
- **`$byTestId` as one-line wrapper**: `$byTestId(id) === $(testIdSelector(id))` — single source of truth for selector shape.
- **Optional peer dependencies**: `@playwright/test` and `playwright-core` marked as optional peers — consumers using only `testIdProps` don't pull browser automation.

### 🐛 Bug Fixes

- Fixed type regression where `element.expect()` and `element.softExpect()` returned `any` instead of Playwright's full matcher types (regression from 1.18.2).
- Fixed `$byTestId` and `testIdProps` to accept typed `TestId<K>` parameters (previously only accepted `TestId<string>`).
- Fixed `assertNoPrefixCollisions` to use the same delimiter logic as `$byTestIdPrefix` (previously caused false positives for `idx-consent`/`idx-consents` pair).
- Fixed `.with()` to throw on non-WebElement/Function values (previously silently dropped them).
- Fixed `initBrowserInstance` to use Playwright's public `isMobile` fixture instead of private `_options` field (prevents silent degradation).

### 📦 Packaging

- Moved `chokidar` and `yargs` to `optionalDependencies` (only needed for CLI commands).
- Added `engines` field specifying Node.js >= 18.0.0.
- Added `sideEffects: true` to explicitly declare module has side effects.
- Added zero-dependency entry point at `playwright-elements/testids` for use in production code.
- Added exports for `./testIds/builder` and `./testIds/selectors` subpaths.
- Extracted test IDs builder into standalone package `@playwright-elements/testids` (zero runtime dependencies) for true install-time isolation. Framework `testIds/builder` now re-exports from this package.

**Note on peerDependencies:** Both `@playwright/test` and `playwright-core` are listed as peer dependencies. This is intentional because the library imports types directly from `playwright-core` (e.g., `Locator`, `Page`). While `@playwright/test` depends on `playwright` which depends on `playwright-core`, having both as peer dependencies with matching version ranges (`>= 1.62.x`) ensures type compatibility.

### 📝 Documentation Updates

- Updated README examples to fix missing `avatar` field in Component-Driven Testing example.
- Fixed README fixture examples to properly use `TestFixtures` generic parameter in `baseTest.extend()`.
- Added documentation about object destructuring pattern requirement for Playwright fixture parameters.
- Added comprehensive migration guide for 1.18.x → 1.19.0.

---



## [1.18.2] - 2024-XX-XX

### Previous Version

For changes in 1.18.2 and earlier, see the Git history.

---

[1.19.0]: https://github.com/DanteUkraine/playwright-elements/compare/1.18.2...1.19.0
[1.18.2]: https://github.com/DanteUkraine/playwright-elements/tree/1.18.2
