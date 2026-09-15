/**
 * Test ID Builder Module — re-export from the standalone package.
 *
 * The implementation lives in @playwright-elements/testids (zero-dependency).
 * This re-export preserves backward compatibility for all existing import paths:
 *   - import { sid, factory, ... } from 'playwright-elements'
 *   - import { sid, factory, ... } from 'playwright-elements/testids'
 *   - import { sid, factory, ... } from 'playwright-elements/testIds/builder'
 *
 * For install-time isolation (no Playwright or lodash in node_modules), install
 * @playwright-elements/testids directly.
 */

export * from '@playwright-elements/testids';
