import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';

// ESLint 10.x Flat Config
// Migrated from .eslintrc.cjs to flat config format

export default [
  {
    ignores: ['lib/**', '**.cjs', 'integration.tests/**', 'prepare-readme.ts', 'coverage/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // ESLint recommended rules
      'constructor-super': 2,
      'for-direction': 2,
      'getter-return': 2,
      'no-async-promise-executor': 2,
      'no-case-declarations': 2,
      'no-class-assign': 2,
      'no-compare-neg-zero': 2,
      'no-cond-assign': 2,
      'no-const-assign': 2,
      'no-constant-condition': 1,
      'no-control-regex': 2,
      'no-debugger': 2,
      'no-delete-var': 2,
      'no-dupe-args': 2,
      'no-dupe-class-members': 2,
      'no-dupe-keys': 2,
      'no-empty': 2,
      'no-empty-character-class': 2,
      'no-ex-assign': 2,
      'no-fallthrough': 2,
      'no-func-assign': 2,
      'no-global-assign': 2,
      'no-invalid-regexp': 2,
      'no-irregular-whitespace': 2,
      'no-misleading-character-class': 2,
      'no-new-symbol': 2,
      'no-obj-calls': 2,
      'no-octal': 2,
      'no-redeclare': 2,
      'no-regex-spaces': 2,
      'no-self-assign': 2,
      'no-sparse-arrays': 2,
      'no-this-before-super': 2,
      'no-unexpected-multiline': 2,
      'no-unreachable': 2,
      'no-unsafe-finally': 2,
      'no-unsafe-negation': 2,
      'no-unused-labels': 2,
      'no-useless-catch': 2,
      'quotes': [2, 'single', { avoidEscape: false, allowTemplateLiterals: true }],
      'template-curly-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'no-empty-pattern': 0,
    },
  },
  {
    files: ['**/*.ts'],
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
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-types': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      'quotes': [2, 'single', { avoidEscape: false, allowTemplateLiterals: true }],
      'template-curly-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'no-empty-pattern': 0,
    },
  },
];
