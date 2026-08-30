/**
 * Unit tests for the Test IDs selectors module
 */

import { expect } from 'chai';
import { $, WebElement } from '../../src/web.element';
import {
  $byTestId,
  $byTestIdPrefix,
  $byTestIdContaining,
  $byTestIdEndingWith,
} from '../../src/testIds/selectors';
import { factory, sid } from '../../src/testIds/builder';

describe('Test IDs Selectors Module', () => {
  describe('$byTestId()', () => {
    it('should create a WebElement with exact data-testid selector', () => {
      const element = $byTestId('test-id');
      expect(element).to.be.instanceOf(WebElement);
    });

    it('should create selector with string ID', () => {
      const element = $byTestId('my-button');
      // Access internal selector for testing
      expect(element.selector).to.equal('[data-testid="my-button"]');
    });

    it('should create selector with TestId', () => {
      const id = sid('my-button');
      const element = $byTestId(id);
      expect(element.selector).to.equal('[data-testid="my-button"]');
    });

    it('should escape special characters in ID', () => {
      const element = $byTestId('button-with"quotes');
      expect(element.selector).to.equal('[data-testid="button-with\"quotes"]');
    });

    it('should handle empty string ID', () => {
      const element = $byTestId('');
      expect(element.selector).to.equal('[data-testid=""]');
    });

    it('should handle numeric ID (converted to string)', () => {
      const element = $byTestId('123');
      expect(element.selector).to.equal('[data-testid="123"]');
    });
  });

  describe('$byTestIdPrefix()', () => {
    it('should create a WebElement with prefix selector', () => {
      const btn = factory('btn');
      const element = $byTestIdPrefix(btn);
      expect(element).to.be.instanceOf(WebElement);
    });

    it('should create selector with factory prefix', () => {
      const btn = factory('btn');
      const element = $byTestIdPrefix(btn);
      expect(element.selector).to.equal('[data-testid^=btn]');
    });

    it('should create selector with hyphenated prefix', () => {
      const ruleRow = factory('rule-row');
      const element = $byTestIdPrefix(ruleRow);
      expect(element.selector).to.equal('[data-testid^=rule-row]');
    });

    it('should throw error for bareFactory (empty prefix)', () => {
      const bare = factory('');
      expect(() => $byTestIdPrefix(bare)).to.throw(
        '$byTestIdPrefix requires a factory with a non-empty prefix'
      );
    });

    it('should work with typed factories', () => {
      const btn = factory<'button'>('btn');
      const element = $byTestIdPrefix(btn);
      expect(element.selector).to.equal('[data-testid^=btn]');
    });
  });

  describe('$byTestIdContaining()', () => {
    it('should create a WebElement with contains selector', () => {
      const element = $byTestIdContaining('user');
      expect(element).to.be.instanceOf(WebElement);
    });

    it('should create selector with substring', () => {
      const element = $byTestIdContaining('user');
      expect(element.selector).to.equal('[data-testid*="user"]');
    });

    it('should escape special characters', () => {
      const element = $byTestIdContaining('user"test');
      expect(element.selector).to.equal('[data-testid*="user\"test"]');
    });

    it('should handle empty string', () => {
      const element = $byTestIdContaining('');
      expect(element.selector).to.equal('[data-testid*=""]');
    });
  });

  describe('$byTestIdEndingWith()', () => {
    it('should create a WebElement with ends-with selector', () => {
      const element = $byTestIdEndingWith('-button');
      expect(element).to.be.instanceOf(WebElement);
    });

    it('should create selector with suffix', () => {
      const element = $byTestIdEndingWith('-button');
      expect(element.selector).to.equal('[data-testid$="-button"]');
    });

    it('should escape special characters', () => {
      const element = $byTestIdEndingWith('-button"test');
      expect(element.selector).to.equal('[data-testid$="-button\"test"]');
    });

    it('should handle empty string', () => {
      const element = $byTestIdEndingWith('');
      expect(element.selector).to.equal('[data-testid$=""]');
    });
  });

  describe('Integration with builder', () => {
    it('should work with factory-generated IDs', () => {
      const btn = factory('btn');
      const id = btn('submit');
      const element = $byTestId(id);
      
      expect(element.selector).to.equal('[data-testid="btn-submit"]');
    });

    it('should work with sid-generated IDs', () => {
      const id = sid('my', 'complex', 'id');
      const element = $byTestId(id);
      
      expect(element.selector).to.equal('[data-testid="my-complex-id"]');
    });

    it('should maintain chainability with WebElement methods', () => {
      const element = $byTestId('test-id');
      
      // WebElement should have all standard methods
      expect(typeof element.click).to.equal('function');
      expect(typeof element.fill).to.equal('function');
      expect(typeof element.expect).to.equal('function');
    });
  });

  describe('Selector consistency', () => {
    it('should produce consistent selectors for same inputs', () => {
      const selector1 = $byTestId('test-id').selector;
      const selector2 = $byTestId('test-id').selector;
      
      expect(selector1).to.equal(selector2);
    });

    it('should produce different selectors for different inputs', () => {
      const selector1 = $byTestId('id-1').selector;
      const selector2 = $byTestId('id-2').selector;
      
      expect(selector1).not.to.equal(selector2);
    });

    it('should handle hyphens correctly in prefix selectors', () => {
      const multiWord = factory('multi-word-prefix');
      const element = $byTestIdPrefix(multiWord);
      
      expect(element.selector).to.equal('[data-testid^=multi-word-prefix]');
    });

    it('should handle numbers in IDs', () => {
      const id = sid('item', 123, 'details');
      const element = $byTestId(id);
      
      expect(element.selector).to.equal('[data-testid="item-123-details"]');
    });
  });
});
