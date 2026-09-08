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

/**
 * Unique brand symbol for TestId type
 */
declare const __testIdBrand: unique symbol;

/**
 * Branded string type for `data-testid` values.
 * The `Kind` parameter allows the type system to distinguish between different
 * categories of test IDs (e.g., a button ID vs. a container ID), preventing
 * them from being used interchangeably even though both are strings.
 * 
 * The brand uses a function type in the invariant position to prevent both
 * widening and narrowing, making TestId<'a'> and TestId<string> mutually
 * unassignable.
 * 
 * @example
 * ```typescript
 * type ButtonId = TestId<'button'>;
 * type ContainerId = TestId<'container'>;
 * 
 * const buttonId: ButtonId = sid('submit-button');
 * const containerId: ContainerId = sid('main-container');
 * 
 * // This would be a type error:
 * // const wrong: ButtonId = containerId; // Error: Type 'ContainerId' is not assignable to type 'ButtonId'
 * ```
 */
export type TestId<Kind extends string = string> = string & {
  readonly [__testIdBrand]: (k: Kind) => Kind;  // Function type makes the brand invariant
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
 * ```
 * 
 * @param id - The test ID to attach to the element
 * @returns Object with data-testid property
 */
export const testIdProps = (id: TestId): { 'data-testid': string } => ({
  'data-testid': id as string,
});

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
        
        // Check against static IDs
        for (const s of statics) {
            if (s.startsWith(f.prefix) && s !== f.prefix && !allowed.has(s)) {
                problems.push(`factory '${f.prefix}' also matches static id '${s}'`);
            }
        }
        
        // Check against other factories
        for (const g of factories) {
            if (g === f || !g.prefix) continue;
            if (g.prefix.startsWith(f.prefix) && !allowed.has(g.prefix)) {
                problems.push(`factory '${f.prefix}' also matches factory '${g.prefix}'`);
            }
        }
    }
    
    if (problems.length) {
        throw new Error('[playwright-elements] test id prefix collisions:\n  ' +
                        problems.join('\n  '));
    }
}
