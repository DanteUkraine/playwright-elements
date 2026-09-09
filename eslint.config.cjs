/** @type {import('eslint').Linter.FlatConfig} */
const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tseslintParser = require('@typescript-eslint/parser');
const playwright = require('eslint-plugin-playwright');

// ESLint 10.x Flat Config
// Strict configuration with no-unused-vars enforcement
// Only lint test files (test/** and integration.tests/**)

module.exports = [
  {
    ignores: [
      '**',
      '!test/**',
      '!integration.tests/**',
    ],
  },
  {
    files: ['test/**/*.ts', 'test/**/*.spec.playwright.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      playwright: playwright,
    },
    settings: {
      playwright: {
        globalAliases: {
          test: ['test'],
          expect: ['expect']
        }
      }
    },
    rules: {
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'playwright/missing-playwright-await': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/valid-describe-callback': 'error',
      'playwright/max-nested-describe': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/consistent-spacing-between-blocks': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-wait-for-navigation': 'error',
      'playwright/expect-expect': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/valid-expect': 'error',
      'playwright/no-duplicate-hooks': 'error',
      'playwright/no-duplicate-slow': 'error',
      'playwright/no-nested-step': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/prefer-hooks-in-order': 'error',
      'playwright/prefer-hooks-on-top': 'error',
      'playwright/valid-expect-in-promise': 'error',
      'playwright/valid-title': 'error',
      'playwright/valid-test-tags': 'error',
      'playwright/no-element-handle': 'off',
      'playwright/prefer-get-by-role': 'off',
    },
  },
  {
    files: ['test/test.support.spec.playwright.ts'],
    rules: {
      'playwright/valid-expect': 'off',
    },
  },
  {
    files: ['test/security.contracts.spec.playwright.ts'],
    rules: {
      'playwright/valid-expect': 'off',
    },
  },
  {
    files: ['integration.tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      playwright: playwright,
    },
    settings: {
      playwright: {
        globalAliases: {
          test: ['test', 'baseTest'],
          expect: ['expect']
        }
      }
    },
    rules: {
      'no-empty-pattern': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'playwright/missing-playwright-await': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-wait-for-navigation': 'error',
      'playwright/expect-expect': 'error',
      'playwright/valid-describe-callback': 'error',
      'playwright/consistent-spacing-between-blocks': 'error',
      'playwright/max-nested-describe': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-wait-for-navigation': 'error',
      'playwright/prefer-hooks-in-order': 'error',
      'playwright/prefer-hooks-on-top': 'error',
      'playwright/valid-expect-in-promise': 'error',
      'playwright/valid-title': 'error',
      'playwright/valid-test-tags': 'error',
      'playwright/no-element-handle': 'off',
      'playwright/prefer-get-by-role': 'off',
    },
  },
];
