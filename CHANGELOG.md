# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.18.2-rc1] - 2026-08-09

### ⚠️ Release Candidate

This is a release candidate for v1.18.2 with critical fixes and architectural improvements. Not recommended for production use yet.

### ✨ Features

- **Type System Refactoring**: Extracted `By` selector types (`By`, `ByOptions`, `ByRoleOptions`, `Role`) to dedicated module `src/types/by.selectors.ts` for better maintainability and separation of concerns (T-013 partial).

### 🐛 Bug Fixes

- **Hardcoded URL**: Replaced hardcoded external URL with relative path in integration tests, allowing environment configuration via `PLAYWRIGHT_BASE_URL` (F-005).
- **Variable Naming**: Fixed incorrect variable name in `or` loop (`andElement` → `orElement`) in locator building logic.

### 🗑️ Removed

- **Smoke Test Scripts**: Removed `test:smoke` and `test:smoke:integration` from package.json as per project requirements.
- **CI Smoke Tests**: Removed smoke-test job and its dependencies from GitHub Actions workflow.
- **Test Retries**: Removed `--retries 2` from test commands in both Mocha and Playwright configurations.

### 📦 Configuration

- **Version Update**: Updated package version to `1.18.2-rc1` for release candidate.

---

## [1.18.2] - 2026-08-08

### Fixed

- **GitHub Actions Timeout Issue**: Fixed timeout in CI/CD pipeline by adding `--exit` flag to `ts-mocha` command. Tests now complete successfully in 43-48 seconds across all platforms (macOS, Ubuntu, Windows) with Node.js 20, 22, 24.
- **Process Termination**: Added `--exit` flag to ensure proper process termination after test execution, preventing hanging processes.

### Security

- **Critical Vulnerability Fixes**: Updated all dependencies to fix 11 security vulnerabilities:
  - **serialize-javascript**: Fixed RCE (Remote Code Execution) vulnerability (GHSA-5c6j-r48x-rmvq) and CPU exhaustion DoS (GHSA-qj8w-gfj5-8c6v) by updating to v7.0.7
  - **js-yaml**: Fixed prototype pollution (GHSA-mh29-5h37-fv8m) and multiple DoS vulnerabilities (GHSA-h67p-54hq-rp68, GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj) by updating to v4.3.1
  - **minimatch**: Fixed multiple ReDoS vulnerabilities (GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74) by updating to v9.0.7
  - **diff/jsdiff**: Fixed DoS vulnerability (GHSA-73rr-hh4g-fpgx) by updating to v5.2.2
  - **picomatch**: Fixed method injection (GHSA-3v7f-55p6-f55p) and ReDoS (GHSA-c2c7-rcm5-vvqj) by updating to v2.3.2
  - Added npm `overrides` section to ensure transitive dependencies use secure versions

### Performance

- **Test Execution Time**: All 344 tests now complete in ~44 seconds (previously timed out after 10 minutes)
- **Memory Efficiency**: Confirmed no memory leaks with 100+ page object creations and 1000+ element instances
- **Concurrent Operations**: Successfully handles 1000+ concurrent element operations in under 2 seconds

### Dependencies

- **Updated Test Framework**: mocha@11.8.0, chai@6.2.2, ts-mocha@11.1.0
- **Updated TypeScript**: typescript@5.9.3
- **Updated Tooling**: eslint@8.57.1, @typescript-eslint/eslint-plugin@6.21.0, @typescript-eslint/parser@6.21.0
- **Updated Types**: @types/chai@5.2.3, @types/mocha@10.0.10, @types/node@26.2.0, @types/yargs@17.0.35
- **Updated Utilities**: husky@9.1.7, yargs@18.1.0, expect-type@1.4.0

---

## [1.18.0] - 2026-08-06

### Features

- **Dynamic Typing Support**: Implemented advanced TypeScript generics for dynamic type inference in page objects and components
- **Enhanced Type Safety**: Improved type system for nested elements and chainable methods
- **Generic Type Support**: Added support for complex generic types in `with()` and `subElements()` methods

### Technical Improvements

- **Type System**: Refactored internal type definitions for better type inference
- **Nested Elements**: Improved recursive type resolution for deeply nested component structures
- **Method Context**: Enhanced `this` context binding in custom methods

---

## [1.17.0] - 2026-08-06

### Features

- **Locator API**: Full integration with Playwright's Locator API
- **Page Object Builder**: Enhanced `buildPageObject` functionality with improved type inference

---

## [1.16.0] - 2026-08-06

### Features

- **Page Object Pattern**: Complete page object building system
- **Component-Driven Testing**: Support for component-based test architecture
- **Fixture Integration**: Deep integration with @playwright/test fixtures

---

## Template for Future Releases

### Added

- New features added

### Changed

- Changes in existing functionality

### Deprecated

- Features that will be removed in future versions

### Removed

- Features that have been removed

### Fixed

- Bug fixes

### Security

- Security vulnerability fixes

---

## Migration Guides

### From 1.17.x to 1.18.x

No breaking changes. The `--exit` flag was added to the test command to prevent timeout issues in CI/CD.

If you were experiencing timeout issues in GitHub Actions or other CI systems, this version fixes those issues automatically.

### From 1.16.x to 1.17.x

Dynamic typing support was added. Your existing code should continue to work without changes.

To take advantage of the new type inference features:

```typescript
// Old way (still works)
const element = $('.selector');

// New way with better type inference
const element = $('.selector').with({
    child: $('child-selector'),
    async customMethod() {
        // `this` is properly typed
        await this.child.click();
    }
});
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.
