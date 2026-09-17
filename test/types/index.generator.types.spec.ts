/**
 * Type Tests for GenerateIndexFileOptions
 * 
 * These tests verify that the GenerateIndexFileOptions type is correctly
 * exported, has the proper structure, and works with the generateIndexFile function.
 * Uses expectTypeOf for compile-time type assertions within Playwright tests.
 */

import { expectTypeOf } from 'expect-type';
import { test } from '../../src/playwright.test.fixtures';
import { generateIndexFile } from '../../src';
import type { GenerateIndexFileOptions, WatcherManager } from '../../src';

test.describe('GenerateIndexFileOptions Type Safety', () => {

  test('should have correct type structure', () => {
    // Verify the type structure matches the expected interface
    expectTypeOf<GenerateIndexFileOptions>().toMatchTypeOf<{
      watch?: boolean;
      cliLog?: boolean;
      quotes?: '\'' | '"';
    }>();
  });

  test('should allow empty options object', () => {
    const emptyOptions: GenerateIndexFileOptions = {};
    expectTypeOf(emptyOptions).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should allow single property options', () => {
    const watchOnly: GenerateIndexFileOptions = { watch: true };
    const cliLogOnly: GenerateIndexFileOptions = { cliLog: false };
    const quotesOnly: GenerateIndexFileOptions = { quotes: '"' };
    
    expectTypeOf(watchOnly).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(cliLogOnly).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(quotesOnly).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should allow all properties together', () => {
    const allOptions: GenerateIndexFileOptions = {
      watch: true,
      cliLog: false,
      quotes: '\'',
    };
    expectTypeOf(allOptions).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should accept valid quotes values', () => {
    const singleQuotes: GenerateIndexFileOptions = { quotes: '\'' };
    const doubleQuotes: GenerateIndexFileOptions = { quotes: '"' };
    
    expectTypeOf(singleQuotes).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(doubleQuotes).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should work with generateIndexFile function', () => {
    const options: GenerateIndexFileOptions = { watch: false, cliLog: false };
    // This should compile without errors
    const manager: WatcherManager = generateIndexFile('./test', options);
    expectTypeOf(manager).toMatchTypeOf<WatcherManager>();
  });

  test('should support type inference with generateIndexFile', () => {
    // Type inference should work without explicit annotation
    const manager1 = generateIndexFile('./test', { watch: false });
    const manager2 = generateIndexFile('./test', { cliLog: true, quotes: '"' });
    
    expectTypeOf(manager1).toMatchTypeOf<WatcherManager>();
    expectTypeOf(manager2).toMatchTypeOf<WatcherManager>();
  });

  test('should have WatcherManager with correct interface', () => {
    expectTypeOf<WatcherManager>().toMatchTypeOf<{
      watchers: any[];
      addWatcher: (watcher: any) => void;
      closeAll: () => Promise<void>;
    }>();
  });

  test('should accept boolean values for watch property', () => {
    const watchTrue: GenerateIndexFileOptions = { watch: true };
    const watchFalse: GenerateIndexFileOptions = { watch: false };
    const watchUndefined: GenerateIndexFileOptions = { watch: undefined };
    
    expectTypeOf(watchTrue).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(watchFalse).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(watchUndefined).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should accept boolean values for cliLog property', () => {
    const cliLogTrue: GenerateIndexFileOptions = { cliLog: true };
    const cliLogFalse: GenerateIndexFileOptions = { cliLog: false };
    const cliLogUndefined: GenerateIndexFileOptions = { cliLog: undefined };
    
    expectTypeOf(cliLogTrue).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(cliLogFalse).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(cliLogUndefined).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should accept quotes property with valid values', () => {
    const quotesSingle: GenerateIndexFileOptions = { quotes: '\'' };
    const quotesDouble: GenerateIndexFileOptions = { quotes: '"' };
    const quotesUndefined: GenerateIndexFileOptions = { quotes: undefined };
    
    expectTypeOf(quotesSingle).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(quotesDouble).toMatchTypeOf<GenerateIndexFileOptions>();
    expectTypeOf(quotesUndefined).toMatchTypeOf<GenerateIndexFileOptions>();
  });

  test('should verify type can be imported from main package', () => {
    // This test verifies the type is properly exported from the main entry point
    // The import at the top of this file already verifies this at compile time
    // This runtime test confirms the module structure is correct
    const options: GenerateIndexFileOptions = {};
    expectTypeOf(options).toMatchTypeOf<GenerateIndexFileOptions>();
  });
});
