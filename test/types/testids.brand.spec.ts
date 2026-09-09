/**
 * TestId Brand Invariance Tests
 * 
 * These tests verify that the TestId brand is properly invariant, preventing
 * unwanted widening and ensuring type safety for test ID types.
 * 
 * The brand uses a function type in the invariant position to prevent both
 * widening and narrowing, making TestId<'a'> and TestId<string> mutually unassignable.
 */

import { expectTypeOf } from 'expect-type';
import { test } from '../../src/playwright.test.fixtures';
import { TestId, sid, factory, ns, bareFactory } from '../../src';

test.describe('TestId Brand Invariance', () => {
  test('sid() should create properly typed TestId', () => {
    const buttonId: TestId<'button'> = sid('submit-button');
    const containerId: TestId<'container'> = sid('main-container');
    
    // These should be different types
    expectTypeOf(buttonId).toMatchTypeOf<TestId<'button'>>();
    expectTypeOf(containerId).toMatchTypeOf<TestId<'container'>>();
  });

  test('TestId with different kinds should be mutually unassignable', () => {
    const buttonId: TestId<'button'> = sid('btn');
    const containerId: TestId<'container'> = sid('div');
    
    // These should be type errors at compile time, but we test at runtime
    // that they are different types
    expectTypeOf(buttonId).not.toMatchTypeOf<TestId<'container'>>();
    expectTypeOf(containerId).not.toMatchTypeOf<TestId<'button'>>();
  });

  test('TestId<string> should be distinct from specific TestId types', () => {
    const generic: TestId<string> = sid('generic');
    const specific: TestId<'specific'> = sid('specific');
    
    // With invariant brand, these should be mutually unassignable
    expectTypeOf(generic).not.toMatchTypeOf<TestId<'specific'>>();
    expectTypeOf(specific).not.toMatchTypeOf<TestId<string>>();
  });

  test('factory() should create typed TestIds', () => {
    const button = factory<'button'>('btn');
    const result = button('submit');
    
    expectTypeOf(result).toMatchTypeOf<TestId<'button'>>();
  });

  test('ns() helper should provide proper inference', () => {
    const loginId = ns<'login'>();
    const usernameInput = loginId('username-input');
    
    expectTypeOf(usernameInput).toMatchTypeOf<TestId<'login'>>();
  });

  test('ns() should work with multiple parts', () => {
    const loginId = ns<'login'>();
    const fullId = loginId('form', 'username', 'input');
    
    expectTypeOf(fullId).toMatchTypeOf<TestId<'login'>>();
  });

  test('bareFactory should create TestIds with string type by default', () => {
    const bare = bareFactory();
    const result = bare('raw-id');
    
    // bareFactory creates TestId<string> by default
    expectTypeOf(result).toMatchTypeOf<TestId<string>>();
  });

  test('factory with type parameter should maintain type', () => {
    const typedFactory = factory<'my-type'>('prefix');
    const result = typedFactory('key');
    
    expectTypeOf(result).toMatchTypeOf<TestId<'my-type'>>();
  });
});
