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
import { TestId, sid, factory, ns, bareFactory, $byTestId, testIdProps } from '../../src';
import { WebElement } from '../../src/web.element';

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

  test.describe('B2 Regression: Typed TestId in selectors and helpers', () => {
    test('$byTestId should accept typed TestId<K>', () => {
      const typedId: TestId<'login.username'> = sid<'login.username'>('username-input');
      const element = $byTestId(typedId);
      
      expectTypeOf(element).toMatchTypeOf<WebElement>();
    });

    test('$byTestId should work with factory-created typed TestIds', () => {
      const loginId = factory<'login'>('login');
      const usernameField = $byTestId(loginId('username'));
      
      expectTypeOf(usernameField).toMatchTypeOf<WebElement>();
    });

    test('$byTestId should work with ns-created typed TestIds', () => {
      const loginId = ns<'login'>();
      const passwordField = $byTestId(loginId('password'));
      
      expectTypeOf(passwordField).toMatchTypeOf<WebElement>();
    });

    test('testIdProps should accept typed TestId<K>', () => {
      const typedId: TestId<'button'> = sid<'button'>('submit-button');
      const props = testIdProps(typedId);
      
      expectTypeOf(props).toMatchTypeOf<{ 'data-testid': string }>();
    });

    test('testIdProps should work with factory-created typed TestIds', () => {
      const buttonId = factory<'button'>('btn');
      const props = testIdProps(buttonId('submit'));
      
      expectTypeOf(props).toMatchTypeOf<{ 'data-testid': string }>();
    });

    test('$byTestId should preserve type inference from sid with type parameter', () => {
      const button = $byTestId(sid<'button'>('submit'));
      expectTypeOf(button).toMatchTypeOf<WebElement>();
    });

    test('testIdProps should preserve type inference from sid with type parameter', () => {
      const props = testIdProps(sid<'header'>('main-header'));
      expectTypeOf(props).toMatchTypeOf<{ 'data-testid': string }>();
    });
  });
});
