/**
 * Strippable Attribute Module
 *
 * Provides `createStrippableAttribute` — a universal primitive for attributes
 * that should be present during development/testing and absent from production
 * builds (e.g. data-testid, data-section-part, data-qa).
 *
 * The strip decision is a single build-time-foldable module constant (R2):
 * bundlers using `define` / DefinePlugin / esbuild --define replace the
 * `process.env` references at build time, eliminating the dead branch.
 *
 * Default is EMIT (R3): NODE_ENV !== "production" -> emit. Only an explicit
 * production signal disables.
 *
 * The flag is overridable independently of NODE_ENV (R4): PE_TESTIDS=on|off
 * overrides in BOTH directions, enabling a production-mode build WITH ids
 * for an end-to-end lane that validates the shipped artifact.
 *
 * @packageDocumentation
 */

import type { TestId, IdFactory } from './builder';

/**
 * R2/R3/R4 — the ONE decision, made once at module scope.
 *
 * Written as literal `process.env.X` member expressions so that
 * DefinePlugin / Vite `define` / esbuild `--define` replace them at build
 * time and the dead branch is eliminated rather than evaluated per render.
 * The `typeof process` guard keeps the module importable in a browser or
 * edge runtime where `process` is absent; consumers on those runtimes
 * configure `define` and the guard folds away with everything else.
 */
const NODE_ENV: string | undefined =
  typeof process !== 'undefined' && process.env
    ? process.env.NODE_ENV
    : undefined;

const OVERRIDE: string | undefined =
  typeof process !== 'undefined' && process.env
    ? process.env.PE_TESTIDS
    : undefined;

/**
 * Whether test-id attributes are emitted.
 *
 * R3: default is EMIT. Only an explicit production signal disables.
 * R4: PE_TESTIDS overrides NODE_ENV in BOTH directions.
 */
export const TEST_IDS_ENABLED: boolean =
  OVERRIDE === 'on' ? true
  : OVERRIDE === 'off' ? false
  : NODE_ENV !== 'production';

/**
 * R8 — one frozen instance shared by every stripped stamp, so stripping
 * allocates nothing per render and cannot be mutated by a caller.
 */
const NOTHING: Readonly<Record<string, string>> = Object.freeze({});

/**
 * Quote a value for a CSS attribute selector. Escapes backslashes and
 * double-quotes, then wraps in double quotes.
 */
export const quote = (value: string): string =>
  `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/**
 * A strippable attribute handler. Created by `createStrippableAttribute`.
 *
 * The `props` and `value` methods honour the strip flag (R6):
 * - When enabled: `props` returns `{ [attr]: id }`, `value` returns the id string.
 * - When stripped: `props` returns frozen `{}`, `value` returns `undefined`.
 *
 * The `selector` family NEVER strips (R1): selectors READ an attribute, they
 * do not emit one, and the id VALUE is identical in every mode. This is what
 * lets a unit test, a runtime query and an e2e spec share one selector builder.
 */
export interface StrippableAttribute<Name extends string = string> {
  /** The attribute this instance owns, e.g. "data-testid". */
  readonly attribute: string;
  /** R5 — the active mode, so a consumer can assert on it. */
  readonly enabled: boolean;

  /** R6 spread form. R7: one static type. R8: frozen {} when stripped. */
  props(id: TestId<Name> | string): Readonly<Record<string, string>>;
  /** R6 bound form: undefined makes the framework omit the attribute. */
  value(id: TestId<Name> | string): string | undefined;

  /**
   * R1 — selectors are NEVER stripped. They READ an attribute, they do
   * not emit one, and the id VALUE is identical in every mode.
   */
  selector(id: TestId<Name> | string): string;
  prefixSelector(factory: IdFactory<Name>): string;
  containsSelector(fragment: string): string;
  endsWithSelector(suffix: string): string;
  /** Present with any value — for "did anything stamp this?" sweeps. */
  anySelector(): string;
}

/**
 * Creates a strippable attribute handler.
 *
 * @param attribute - The HTML attribute name (e.g. "data-testid", "data-qa")
 * @param options.enabled - Override the global flag. Use `true` for attributes
 *   that must NEVER be stripped (e.g. read by production CSS). Use `false` for
 *   always-strip. Omit to follow the global `TEST_IDS_ENABLED` flag.
 *
 * @example
 * ```typescript
 * // Canonical instance for data-testid:
 * const testIds = createStrippableAttribute("data-testid");
 *
 * // Never strip (read by production CSS):
 * const sectionKind = createStrippableAttribute("data-section-kind", {
 *   enabled: true,
 * });
 *
 * // Custom attribute name:
 * const qaIds = createStrippableAttribute("data-qa");
 * ```
 */
export const createStrippableAttribute = <Name extends string = string>(
  attribute: string,
  options: { enabled?: boolean } = {},
): StrippableAttribute<Name> => {
  const enabled = options.enabled ?? TEST_IDS_ENABLED;

  return {
    attribute,
    enabled,

    // The branch is resolved ONCE, at creation. The hot path that runs on
    // every render carries no condition at all (R2: one decision, not one
    // decision per stamp).
    props: enabled
      ? (id) => ({ [attribute]: id as string })
      : () => NOTHING,

    value: enabled
      ? (id) => id as string
      : () => undefined,

    selector: (id) => `[${attribute}=${quote(id as string)}]`,

    prefixSelector: (factory) => {
      if (!factory.prefix) {
        throw new Error(
          `${attribute}: prefixSelector requires a non-empty prefix`,
        );
      }
      // The trailing "-" is load-bearing. A factory emits `${prefix}-${key}`,
      // so without the delimiter a factory with prefix "idx-consent" also
      // matches the STATIC id "idx-consents".
      return `[${attribute}^=${quote(`${factory.prefix}-`)}]`;
    },

    containsSelector: (fragment) => `[${attribute}*=${quote(fragment)}]`,
    endsWithSelector: (suffix) => `[${attribute}$=${quote(suffix)}]`,
    anySelector: () => `[${attribute}]`,
  };
};

// ---------------------------------------------------------------------------
// The canonical instance — the test-id module becomes one application of the
// primitive rather than the whole product.
// ---------------------------------------------------------------------------

/** Canonical strippable attribute for `data-testid`. */
export const testIds = createStrippableAttribute('data-testid');

/**
 * A5 — factory for a configurable attribute name. Returns the bound helpers
 * for a custom attribute (e.g. data-qa, data-pw). Avoids global mutable state:
 * each call produces an isolated instance with no order-of-import hazard.
 *
 * @example
 * ```typescript
 * const myIds = createTestIds({ attribute: 'data-qa' });
 * myIds.props(id)     // { 'data-qa': 'value' } | {}
 * myIds.selector(id)  // '[data-qa="value"]'
 * myIds.value(id)     // 'value' | undefined
 * ```
 */
export const createTestIds = (options: {
  attribute: string;
  enabled?: boolean;
}): StrippableAttribute => createStrippableAttribute(options.attribute, { enabled: options.enabled });
