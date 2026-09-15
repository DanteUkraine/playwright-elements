/**
 * Test ID Builder Module
 *
 * This module provides type-safe test ID generation utilities for use with
 * playwright-elements. It enables:
 * - Branded types for test IDs to prevent misuse
 * - Factory functions for generating IDs with consistent prefixes
 * - Static ID generation for simple cases
 * - React integration via testIdProps helper
 *
 * @packageDocumentation
 */

import { TEST_IDS_ENABLED } from './strippable';

/** R8 — frozen empty object shared by every stripped stamp. */
const NOTHING: Readonly<Record<string, string>> = Object.freeze({});

/**
 * Branded string type for `data-testid` values.
 *
 * Uses a STRUCTURAL string brand ("pe/testids") so that two installed copies
 * of this package produce interoperable types (F3). A `unique symbol` would
 * make copies mutually unassignable (F2), which is a realistic hoisting
 * outcome once two packages depend on this one.
 *
 * The `Kind` parameter is optional (defaults to `string`) and provides
 * IDE autocompletion and light category grouping. It is covariant, not
 * invariant: `TestId<'button'>` is assignable to `TestId<string>` but not
 * vice versa. Consumers who do not need per-id kind typing can omit it
 * entirely (P4).
 *
 * Plain strings are still rejected: `string` lacks `__testIdBrand`.
 *
 * @example
 * ```typescript
 * // Simple (no Kind needed):
 * const submit = sid('submit-button');
 *
 * // Typed (when you want autocompletion):
 * type ButtonId = TestId<'button'>;
 * const buttonId: ButtonId = sid('submit-button');
 * ```
 */
export type TestId<Kind extends string = string> = string & {
  readonly __testIdBrand: 'pe/testids';
  readonly __kind: Kind;
};

/**
 * Joins array parts into a kebab-case string, filtering out null/undefined/empty values.
 * @param parts - Array of string or number parts to join
 * @returns Joined kebab-case string
 */
const join = (parts: ReadonlyArray<string | number | null | undefined>): string =>
  parts.filter((p) => p !== '' && p != null).join('-');

/**
 * Validates that a value is a non-empty string for use in test ID generation.
 * @param value - The value to validate
 * @param what - Description of the value for error messages
 */
const assertNonEmptyString = (value: unknown, what: string): void => {
  if (value === '' || value == null || (typeof value === 'string' && !value.trim())) {
    throw new Error(`[playwright-elements] ${what} must be a non-empty string`);
  }
};

/**
 * Builds a static ID (no dynamic key) from one or more kebab-case parts.
 * Use this for test IDs that don't need parameterization.
 * 
 * @example
 * ```typescript
 * // Simple static ID
 * const submitButton = sid('submit-button');
 * 
 * // ID with multiple parts
 * const userProfileLink = sid('user', 'profile', 'link');
 * // Results in: 'user-profile-link'
 * 
 * // Typed static ID
 * const headerTitle: TestId<'header'> = sid('header-title');
 * ```
 * 
 * @param parts - String or number parts to join into the ID
 * @returns A TestId with the joined parts
 */
export const sid = <K extends string = string>(...parts: Array<string | number>): TestId<K> => {
  if (parts.length === 0) {
    throw new Error('[playwright-elements] sid() needs at least one part');
  }
  // Check if there's at least one non-empty, non-null part
  const hasValidPart = parts.some((p) => p !== '' && p != null);
  if (!hasValidPart) {
    throw new Error('[playwright-elements] sid() needs at least one part');
  }
  assertNonEmptyString(parts[0], 'the first part of sid()');
  return join(parts) as TestId<K>;
};

/**
 * Creates a namespaced ID factory with a specified type parameter.
 * This helps with type inference for static IDs that share a common namespace.
 * 
 * @example
 * ```typescript
 * // Create a namespace for login-related IDs
 * const loginId = ns<'login'>();
 * 
 * // All IDs will be typed as TestId<'login'>
 * const usernameInput = loginId('username-input');  // TestId<'login'>
 * const passwordInput = loginId('password-input');  // TestId<'login'>
 * 
 * export const ids = {
 *   login: {
 *     usernameInput: loginId('username-input'),
 *     passwordInput: loginId('password-input'),
 *   },
 * } as const;
 * ```
 * 
 * @param typeParam - The type parameter to assign to all IDs from this namespace
 * @returns A function that creates typed TestIds
 */
export const ns = <K extends string>() =>
  (...parts: Array<string | number>): TestId<K> => sid<K>(...parts);

/**
 * A factory function for generating test IDs with a consistent prefix.
 * Each factory exposes its `.prefix` property so that tests can create
 * prefix-based selectors without duplicating the prefix string.
 * 
 * @example
 * ```typescript
 * // Create a factory for button IDs
 * const button = factory('btn');
 * 
 * // Generate specific IDs
 * button('submit');      // Returns: 'btn-submit' as TestId<'button'>
 * button('cancel');      // Returns: 'btn-cancel' as TestId<'button'>
 * 
 * // Access the prefix for prefix selectors
 * button.prefix;         // Returns: 'btn'
 * 
 * // Create typed factory
 * const ruleAction = factory<'rules.rowAction'>('rule-action');
 * ruleAction('edit');   // Returns: 'rule-action-edit' as TestId<'rules.rowAction'>
 * ```
 */
export interface IdFactory<K extends string = string> {
  (key: string | number): TestId<K>;
  /**
   * Static portion of the ID, with NO trailing `-`. 
   * Use for `[data-testid^=...]` prefix selectors.
   */
  readonly prefix: string;
  /**
   * Optional list of OTHER factory prefixes that intentionally share this prefix.
   * Used by consistency checks to allow declared collisions.
   * 
   * @example
   * ```typescript
   * // Both factories produce IDs starting with 'nudge-button'
   * const rowNudge = factory('nudge-button', {
   *   aliasPrefixes: ['nudge-button']
   * });
   * const categoryNudge = factory('nudge-button', {
   *   aliasPrefixes: ['nudge-button']
   * });
   * ```
   */
  readonly aliasPrefixes?: ReadonlyArray<string>;
}

/**
 * Creates an ID factory with a specified prefix.
 * 
 * @param prefix - The prefix to use for all IDs generated by this factory
 * @param opts - Optional configuration including alias prefixes
 * @returns An IdFactory configured with the given prefix
 */
export const factory = <K extends string = string>(
  prefix: string,
  opts?: { aliasPrefixes?: ReadonlyArray<string> },
): IdFactory<K> => {
  assertNonEmptyString(prefix, 'factory() prefix');
  
  const factoryFn = (key: string | number): TestId<K> => {
    assertNonEmptyString(key, `factory('${prefix}') key`);
    return join([prefix, key]) as TestId<K>;
  };
  
  return Object.assign(
    factoryFn,
    {
      prefix,
      aliasPrefixes: opts?.aliasPrefixes,
    } as const
  );
};

/**
 * Creates a factory whose ENTIRE id is the key (no prefix).
 * Used for raw entity-id testids, such as when an ID is based on a database ID
 * or other unique identifier.
 * 
 * **Note:** Incompatible with `$byTestIdPrefix` which requires a non-empty prefix.
 * Use `factory()` instead if you need prefix-based selectors.
 * 
 * @example
 * ```typescript
 * // For components that use entity IDs directly
 * const ruleRow = bareFactory<'rules.row'>();
 * 
 * // Usage in component
 * <div {...testIdProps(ruleRow(ruleId))} />
 * // Results in: data-testid="123" (if ruleId is 123)
 * ```
 * 
 * @returns An IdFactory with an empty prefix
 */
export const bareFactory = <K extends string = string>(): IdFactory<K> => {
  const factoryFn = (key: string | number): TestId<K> => {
    // For bareFactory, allow 0 and other falsy-but-valid entity IDs
    // Only reject null/undefined
    if (key == null) {
      throw new Error('[playwright-elements] bareFactory() key cannot be null or undefined');
    }
    return String(key) as TestId<K>;
  };
  
  return Object.assign(
    factoryFn,
    {
      prefix: '',
    } as const
  );
};

/**
 * Adopts an id that this registry does not own. Use sparingly - prefer sid() or factory().
 * This is an escape hatch for third-party ids or ids read from fixtures.
 * 
 * @param raw - The raw string to adopt as a TestId
 * @returns A TestId wrapping the raw string
 */
export const unsafeId = (raw: string): TestId => raw as TestId;

/**
 * Returns props to spread onto a React/JSX element to attach the `data-testid` attribute.
 *
 * Honours the build-time strip flag (R6): when stripping is on, returns a frozen
 * empty object so spreading is a no-op (R8). The attribute is absent from the DOM,
 * not merely empty.
 *
 * Pass a custom attribute name as the second argument to use an attribute other than
 * `data-testid` (e.g. when your Playwright config sets `use.testIdAttribute: 'data-pw'`).
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   return <button {...testIdProps(sid('my-button'))}>Click me</button>;
 * }
 *
 * // Or with a factory:
 * function RuleRow({ ruleId }: { ruleId: string }) {
 *   return <div {...testIdProps(ruleRow(ruleId))}>...</div>;
 * }
 *
 * // Custom attribute (matches Playwright's use.testIdAttribute config):
 * <div {...testIdProps(sid('my-button'), 'data-pw')} />
 * ```
 *
 * @param id - The test ID to attach to the element
 * @param attr - The HTML attribute name (defaults to 'data-testid')
 * @returns Object with the test id attribute property, or frozen {} when stripped
 */
export const testIdProps = <K extends string>(
  id: TestId<K>,
  attr = 'data-testid',
): Record<string, string> => {
  if (!TEST_IDS_ENABLED) return NOTHING as Record<string, string>;
  return { [attr]: id as string };
};

/**
 * Returns the test ID value for bound-attribute binding styles (Angular, Vue).
 *
 * Use this with Angular `[attr.data-testid]="testIdValue(id)"` or
 * Vue `:data-testid="testIdValue(id)"`. When stripping is enabled, returns
 * `undefined` so the framework omits the attribute entirely (R6).
 *
 * @example
 * ```typescript
 * // Angular:
 * // <div [attr.data-testid]="testIdValue(sid('my-id'))"></div>
 *
 * // Vue:
 * // <div :data-testid="testIdValue(sid('my-id'))"></div>
 * ```
 *
 * @param id - The test ID to attach to the element
 * @returns The id string, or undefined when stripped
 */
export const testIdValue = <K extends string>(
  id: TestId<K>,
): string | undefined => TEST_IDS_ENABLED ? id as string : undefined;

/**
 * Type guard to check if a value is an IdFactory.
 * Used by consistency checks to validate factory usage.
 * 
 * @param v - The value to check
 * @returns true if v is an IdFactory, false otherwise
 */
export const isIdFactory = (v: unknown): v is IdFactory =>
  typeof v === 'function' && typeof (v as { prefix?: unknown }).prefix === 'string';

/**
 * Asserts that no factory prefix is a prefix of another registered ID unless
 * declared as an alias. This catches collision issues like factory('idx-consent')
 * matching a static id 'idx-consents'.
 * 
 * @param ids - Object containing TestIds and factories to check
 * @throws Error if prefix collisions are found
 */
export function assertNoPrefixCollisions(ids: Record<string, unknown>): void {
    const factories: IdFactory[] = [];
    const statics: string[] = [];
    
    const walk = (node: unknown) => {
        if (isIdFactory(node)) return void factories.push(node);
        if (typeof node === 'string') return void statics.push(node);
        if (node && typeof node === 'object') Object.values(node).forEach(walk);
    };
    walk(ids);

    const problems: string[] = [];
    for (const f of factories) {
        if (!f.prefix) continue;
        const allowed = new Set(f.aliasPrefixes ?? []);
        
        // The selector uses prefix + '-', so we need to check against that
        // to match the actual selector behavior (e.g., factory('idx-consent')
        // produces '[data-testid^="idx-consent-"]' which won't match 'idx-consents')
        const prefixWithDelimiter = `${f.prefix}-`;
        
        // Check against static IDs
        for (const s of statics) {
            if (s.startsWith(prefixWithDelimiter) && !allowed.has(s)) {
                problems.push(`factory '${f.prefix}' also matches static id '${s}'`);
            }
        }
        
        // Check against other factories
        for (const g of factories) {
            if (g === f || !g.prefix) continue;
            const gPrefixWithDelimiter = `${g.prefix}-`;
            if (gPrefixWithDelimiter.startsWith(prefixWithDelimiter) && !allowed.has(g.prefix)) {
                problems.push(`factory '${f.prefix}' also matches factory '${g.prefix}'`);
            }
        }
    }
    
    if (problems.length) {
        throw new Error('[playwright-elements] test id prefix collisions:\n  ' +
                        problems.join('\n  '));
    }
}
