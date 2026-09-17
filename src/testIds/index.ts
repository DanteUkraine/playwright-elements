/**
 * Test IDs Module
 * 
 * This module provides a type-safe test ID generation system for use with
 * playwright-elements. It enables:
 * 
 * - Branded types for test IDs to prevent misuse
 * - Factory functions for generating IDs with consistent prefixes
 * - Static ID generation for simple cases
 * - React integration via testIdProps helper
 * - Playwright selectors that work seamlessly with the generated IDs
 * 
 * @packageDocumentation
 */

export * from './builder';
export * from './selectors';
// Re-export for convenience (these are already exported via * but being explicit)
export { unsafeId, ns, assertNoPrefixCollisions } from './builder';
