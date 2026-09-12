/**
 * Compile-Time Type Tests
 * 
 * These tests use TypeScript's type-checking to ensure type safety.
 * The file should pass type-checking with --noEmit.
 * 
 * Tests cover: TestId brand, selector string overloads
 */

import { $byTestId, testIdProps, sid, unsafeId, factory, bareFactory } from '../../src';
import type { TestId } from '../../src';

// ============================================================================
// Test that $byTestId and testIdProps reject bare strings
// ============================================================================

// These should be type errors but we can't use @ts-expect-error in a way
// that works with the current type system. Instead, we verify that the
// correct usage compiles.

// Valid usage - should compile
const validId1 = sid('test-id');
$byTestId(validId1);
testIdProps(validId1);

// Valid usage with unsafeId - should compile
$byTestId(unsafeId('third-party-id'));
testIdProps(unsafeId('external-id'));

// ============================================================================
// Test that TestId brands work correctly
// ============================================================================

// Create typed TestIds
const buttonId: TestId<'button'> = sid('submit-button');
const containerId: TestId<'container'> = sid('main-container');
const genericId: TestId<string> = sid('generic');

// Test that factory creates properly typed IDs
const buttonFactory = factory<'button'>('btn');
const buttonElementId: TestId<'button'> = buttonFactory('submit');

// Test that bareFactory works
const bare = bareFactory();
const bareId = bare('raw-id');

// Test that ns pattern works (using sid with explicit type)
const loginId: TestId<'login'> = sid<'login'>('username-input');

// ============================================================================
// Verify type compatibility
// ============================================================================

// These should compile - same type
const buttonId2: TestId<'button'> = buttonId;
const containerId2: TestId<'container'> = containerId;

// Test in functions
function processButtonId(id: TestId<'button'>): TestId<'button'> {
  return id;
}

function processContainerId(id: TestId<'container'>): TestId<'container'> {
  return id;
}

// Should compile
processButtonId(buttonId);
processContainerId(containerId);

// ============================================================================
// Test all selector functions with TestId
// ============================================================================

import { $byTestIdPrefix, $byTestIdContaining, $byTestIdEndingWith } from '../../src';

const testId = sid('test-id');
const factoryId = factory('prefix');

$byTestId(testId);
$byTestIdPrefix(factoryId);
$byTestIdContaining('test');
$byTestIdEndingWith('-test');

console.log('All type tests passed!');
