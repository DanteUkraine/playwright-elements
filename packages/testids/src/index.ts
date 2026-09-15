/**
 * @playwright-elements/testids — zero-dependency entry point.
 *
 * Re-exports the builder (id generation), strippable (production stripping),
 * and selectors (zero-dep CSS strings) modules. None of these import Playwright,
 * lodash, or any browser automation library.
 *
 * @packageDocumentation
 */

export * from './builder';
export * from './strippable';
export * from './selectors';
