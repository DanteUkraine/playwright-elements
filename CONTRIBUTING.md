# Contributing to playwright-elements

Thank you for your interest in contributing to **playwright-elements**! We welcome contributions from everyone.

This document provides guidelines for contributing to the project. Please read it carefully before submitting your first pull request.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How to Contribute](#-how-to-contribute)
- [Development Setup](#-development-setup)
- [Pull Request Guidelines](#-pull-request-guidelines)
- [Commit Message Conventions](#-commit-message-conventions)
- [Coding Standards](#-coding-standards)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Reporting Issues](#-reporting-issues)
- [Feature Requests](#-feature-requests)
- [Release Process](#-release-process)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [DanteUkraine](https://github.com/DanteUkraine).

---

## 🚀 How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/DanteUkraine/playwright-elements/issues/new?template=bug_report.md) with the following information:

- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- Node.js version
- Playwright version
- playwright-elements version
- Minimal code example that reproduces the issue

### Suggesting Enhancements

For feature requests, [open an issue](https://github.com/DanteUkraine/playwright-elements/issues/new?template=feature_request.md) with:

- Clear description of the feature
- Use case or problem it solves
- Example code showing how it would be used

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ⚙️ Development Setup

### Prerequisites

- Node.js: 18.x, 20.x, 22.x, or 24.x (recommended: latest LTS)
- npm: 9.x or later (recommended: latest)
- TypeScript: 5.x (automatically installed via npm)
- Playwright: >= 1.44.x (automatically installed via npm)

### Installation

```bash
# Clone the repository
git clone https://github.com/DanteUkraine/playwright-elements.git
cd playwright-elements

# Install dependencies
npm install

# Install browsers for Playwright
npm run install:browsers

# Build the project
npm run build

# Run tests
npm test
```

### Project Structure

```
playwright-elements/
├── src/                      # Source code
│   ├── index.ts              # Main exports
│   ├── web.element.ts        # WebElement class (core)
│   ├── browser.ts            # BrowserInstance class
│   ├── page.object.builder.ts # Page object builder
│   └── playwright.test.fixtures.ts # Test fixtures
├── test/                     # Test files
│   └── *.spec.ts             # Unit tests
├── docs/                     # Documentation
│   ├── get_started.md        # Getting started guide
│   ├── web_element.md        # WebElement API
│   └── ...                   # Other docs
├── integration.tests/       # Integration tests
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── CONTRIBUTING.md
```

---

## 📝 Pull Request Guidelines

### Before Submitting

- Ensure all tests pass: `npm test`
- Run linter: `npm run lint`
- Build succeeds: `npm run build`
- Your code follows the existing code style
- Add appropriate tests for new functionality
- Update documentation if needed

### Pull Request Template

Please use the following template for your pull request:

```markdown
## Description

[Brief description of the changes]

## Related Issue

[Link to related issue, if any]

## Changes Made

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Tests
- [ ] Other (please specify)

## Breaking Changes

[List any breaking changes and migration instructions]

## Testing

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Commit messages are descriptive and follow conventions
- [ ] Documentation updated (if applicable)
- [ ] No sensitive information in code
```

### Review Process

1. All pull requests require at least one approval from a maintainer
2. CI checks must pass (tests, linting, build)
3. Code coverage should not decrease
4. Breaking changes require discussion before implementation

---

## 📝 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add support for custom selectors` |
| `fix` | Bug fix | `fix: timeout issue in CI pipeline` |
| `docs` | Documentation only changes | `docs: update README with badges` |
| `style` | Code style changes (no functional changes) | `style: format code with prettier` |
| `refactor` | Code refactoring (no new features or fixes) | `refactor: extract helper functions` |
| `perf` | Performance improvements | `perf: optimize element creation` |
| `test` | Adding or modifying tests | `test: add benchmark tests` |
| `chore` | Build process or auxiliary tool changes | `chore: update dependencies` |
| `revert` | Revert a previous commit | `revert: feat: add experimental feature` |

### Scopes

Use the scope to indicate which part of the codebase was changed:

- `web.element` - Changes to WebElement class
- `browser` - Changes to BrowserInstance
- `page.object` - Changes to page object builder
- `fixtures` - Changes to test fixtures
- `types` - Type-related changes
- `docs` - Documentation changes
- `tests` - Test-related changes

### Examples

```bash
# Good commit messages
feat(web.element): add nth() method for element selection
fix(browser): prevent memory leak in BrowserInstance
docs(readme): add getting started guide
test(performance): add memory usage tests

# Bad commit messages (avoid)
Update code
Fix bug
WIP
Changes
```

---

## 📚 Coding Standards

### TypeScript

- Use `interface` for object shapes, `type` for unions and complex types
- Prefer `readonly` for properties that shouldn't be modified
- Use `unknown` instead of `any` when the type is truly unknown
- Always specify return types for public methods
- Use `Promise<T>` for async functions

### Code Style

- 2 spaces for indentation (configured in .eslintrc)
- Single quotes for strings
- Semicolons at the end of statements
- Trailing commas in object literals and arrays
- Use `===` and `!==` instead of `==` and `!=`
- Use template literals for string concatenation

### Naming Conventions

- Classes: `PascalCase` (e.g., `WebElement`, `BrowserInstance`)
- Variables and functions: `camelCase` (e.g., `buildLocator`, `currentPage`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
- Private members: Prefix with `_` (e.g., `_selector`, `_parents`)
- Type parameters: Single uppercase letter (e.g., `T`, `K`, `V`)

### Imports

- Group imports: built-in, external, internal
- Sort alphabetically within each group
- Use named imports for clarity

```typescript
// Good
import path from 'path';
import { Locator } from 'playwright-core';
import { BrowserInstance } from './browser';

// Bad
import * as p from 'path';
import Locator from 'playwright-core';
import BrowserInstance from './browser';
```

---

## ✅ Testing

### Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run integration:test

# Run specific test file
npm test -- test/performance.benchmarks.spec.ts
```

### Test Guidelines

- Each test file should describe a single component or feature
- Use `describe` for grouping related tests
- Use `it` or `test` for individual test cases
- Test both happy paths and error cases
- Keep tests independent and isolated
- Use meaningful test names
- Clean up resources after tests

### Test Structure

```typescript
import { expect } from 'chai';
import { $ } from '../src';

describe('WebElement', () => {
  describe('with() method', () => {
    it('should add sub-elements', async () => {
      const element = $('div').with({
        child: $('span')
      });
      
      expect(element.child).to.exist;
    });

    it('should preserve this context in methods', async () => {
      const element = $('div').with({
        async test(this: WebElement) {
          return this;
        }
      });
      
      const result = await element.test();
      expect(result).to.be.instanceOf(WebElement);
    });
  });
});
```

---

## 📖 Documentation

### Writing Documentation

- Use clear, concise language
- Include code examples
- Show both simple and advanced usage
- Document edge cases and limitations
- Keep documentation up to date with code changes

### Documentation Structure

```
docs/
├── get_started.md           # Quick start guide
├── web_element.md           # WebElement API reference
├── browser_instance.md      # BrowserInstance documentation
├── build_page_object.md     # Page object builder
├── customization.md         # Customization options
├── advanced_usage.md        # Advanced patterns
├── utilities.md             # Utility functions
├── type_system.md           # Type system deep dive (NEW)
├── troubleshooting.md        # Common issues and solutions (NEW)
└── faq.md                   # Frequently asked questions (NEW)
```

### Documentation Style

- Use Markdown format
- Include code blocks with language specification
- Use tables for comparisons and parameter lists
- Link to related documentation
- Include version information for features

---

## 🐛 Reporting Issues

### Before Reporting

1. Search existing issues to avoid duplicates
2. Ensure you're using the latest version
3. Try to reproduce the issue with a minimal example

### Bug Report Template

```markdown
## Describe the bug

[A clear and concise description of what the bug is.]

## To Reproduce

Steps to reproduce the behavior:
1. [First step]
2. [Second step]
3. [Third step]

## Expected behavior

[What you expected to happen]

## Actual behavior

[What actually happened]

## Screenshots

[If applicable, add screenshots to help explain the problem]

## Environment

- Node.js version: [e.g., 20.0.0]
- npm version: [e.g., 10.0.0]
- playwright-elements version: [e.g., 1.18.2]
- Playwright version: [e.g., 1.44.0]
- OS: [e.g., Ubuntu 24.04]

## Additional context

[Any other relevant information]

## Possible solution

[If you have suggestions for a fix, describe them here]
```

---

## 💡 Feature Requests

### Before Requesting

1. Search existing issues to avoid duplicates
2. Consider if the feature aligns with the project's goals
3. Think about the implementation complexity

### Feature Request Template

```markdown
## Is your feature request related to a problem?

[Please describe. A clear and concise description of what the problem is.]

## Describe the solution you'd like

[What you want to happen. A clear and concise description of what you want to happen.]

## Describe alternatives you've considered

[Any alternative solutions or features you've considered.]

## Additional context

[Any other relevant information or examples]

## Expected impact

[How this feature would benefit the project and its users]
```

---

## 🚀 Release Process

This section is for maintainers only.

### Versioning

This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- `MAJOR` version: Breaking changes
- `MINOR` version: New features (backward-compatible)
- `PATCH` version: Bug fixes (backward-compatible)

### Release Steps

1. Update `CHANGELOG.md` with release notes
2. Update version in `package.json`
3. Create a Git tag: `git tag v1.18.2`
4. Push the tag: `git push origin v1.18.2`
5. Publish to npm: `npm publish`
6. Create a GitHub Release with the changelog

### Pre-release Versions

For beta/alpha releases, use semver prerelease notation:

```bash
# Beta release
npm version 1.19.0-beta.1
npm publish --tag beta

# Release candidate
npm version 1.19.0-rc.1
npm publish --tag rc
```

---

## 🤝 Community

- **GitHub Discussions**: [Join the discussion](https://github.com/DanteUkraine/playwright-elements/discussions)
- **Issues**: [Report issues](https://github.com/DanteUkraine/playwright-elements/issues)
- **Pull Requests**: [Submit PRs](https://github.com/DanteUkraine/playwright-elements/pulls)

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).
