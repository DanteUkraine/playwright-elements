import { configureWebElementExpect } from '../src';
import { expect } from '@playwright/test';

// Configure WebElement assertion provider for Mocha tests
// This allows WebElement.expect() and WebElement.softExpect() to work with Playwright expect
// Using configureWebElementExpect from test.support for consistency
configureWebElementExpect();

// Also make Playwright expect available globally for convenience
(global as any).expect = expect;
