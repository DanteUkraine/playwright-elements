/** @type {import('eslint').Linter.FlatConfig} */
const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tseslintParser = require('@typescript-eslint/parser');

// ESLint 10.x Flat Config
// Lints source files only, excludes tests

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/lib/**',
      '**/test/**',
      '**/integration.tests/**',
      'eslint.config.cjs',
      '.eslintrc.cjs',
    ],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
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
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
];
