import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

const pkgRoot = path.resolve(__dirname, '..');

test.describe('testids package purity', () => {
  test('lib/builder loads exactly 1 module', () => {
    expect(() => execSync('npm run ci:check-purity', { cwd: pkgRoot, encoding: 'utf-8' })).not.toThrow();
  });

  test('exports all expected functions', () => {
    const script = `const b = require('./lib/builder'); console.log(Object.keys(b).sort().join(','));`;
    const result = execSync(`node -e "${script}"`, {
      cwd: pkgRoot,
      encoding: 'utf-8',
    }).trim();

    const expected = ['assertNoPrefixCollisions', 'bareFactory', 'factory', 'isIdFactory', 'ns', 'sid', 'testIdProps', 'unsafeId'].join(',');
    expect(result).toBe(expected);
  });
});
