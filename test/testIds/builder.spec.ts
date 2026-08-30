/**
 * Unit tests for the Test IDs builder module
 */

import { expect } from 'chai';
import {
  TestId,
  IdFactory,
  sid,
  factory,
  bareFactory,
  testIdProps,
  isIdFactory,
} from '../../src/testIds/builder';

describe('Test IDs Builder Module', () => {
  describe('sid()', () => {
    it('should create a simple static ID', () => {
      const id = sid('test-id');
      expect(id as string).to.equal('test-id');
    });

    it('should join multiple parts with hyphens', () => {
      const id = sid('part1', 'part2', 'part3');
      expect(id as string).to.equal('part1-part2-part3');
    });

    it('should filter out null and undefined values', () => {
      const id = sid('part1', null, 'part2', undefined, 'part3');
      expect(id as string).to.equal('part1-part2-part3');
    });

    it('should filter out empty strings', () => {
      const id = sid('part1', '', 'part2', '', 'part3');
      expect(id as string).to.equal('part1-part2-part3');
    });

    it('should handle numeric parts', () => {
      const id = sid('item', 123, 'details');
      expect(id as string).to.equal('item-123-details');
    });

    it('should return empty string for all null/undefined parts', () => {
      const id = sid(null, undefined, '');
      expect(id as string).to.equal('');
    });

    it('should preserve type information', () => {
      type MyId = TestId<'my-type'>;
      const id: MyId = sid<'my-type'>('my-id');
      // TypeScript should accept this assignment
      expect((id as string).length).to.be.at.least(1);
    });
  });

  describe('factory()', () => {
    it('should create a factory with a prefix', () => {
      const btn = factory('btn');
      expect(btn.prefix).to.equal('btn');
    });

    it('should generate IDs with the prefix', () => {
      const btn = factory('btn');
      const id1 = btn('submit');
      const id2 = btn('cancel');
      
      expect(id1 as string).to.equal('btn-submit');
      expect(id2 as string).to.equal('btn-cancel');
    });

    it('should handle numeric keys', () => {
      const item = factory('item');
      const id = item(123);
      
      expect(id as string).to.equal('item-123');
    });

    it('should filter out null/undefined keys', () => {
      const btn = factory('btn');
      const id = btn(null as unknown as string);
      
      // null is filtered out, so we just get the prefix
      expect(id as string).to.equal('btn');
    });

    it('should support aliasPrefixes option', () => {
      const btn = factory('btn', { aliasPrefixes: ['btn', 'button'] });
      expect(btn.prefix).to.equal('btn');
      expect(btn.aliasPrefixes).to.deep.equal(['btn', 'button']);
    });

    it('should preserve type information', () => {
      type ButtonId = TestId<'button'>;
      const btn = factory<'button'>('btn');
      const id: ButtonId = btn('submit');
      expect((id as string).startsWith('btn-')).to.be.true;
    });

    it('should be callable as a function', () => {
      const btn = factory('btn');
      const id = btn('test');
      expect(id as string).to.equal('btn-test');
    });
  });

  describe('bareFactory()', () => {
    it('should create a factory with empty prefix', () => {
      const bare = bareFactory();
      expect(bare.prefix).to.equal('');
    });

    it('should generate IDs without prefix', () => {
      const bare = bareFactory();
      const id1 = bare('123');
      const id2 = bare(456);
      
      expect(id1 as string).to.equal('123');
      expect(id2 as string).to.equal('456');
    });

    it('should preserve type information', () => {
      type EntityId = TestId<'entity'>;
      const bare = bareFactory<'entity'>();
      const id: EntityId = bare('123');
      expect(id as string).to.equal('123');
    });
  });

  describe('testIdProps()', () => {
    it('should return data-testid prop for string', () => {
      const props = testIdProps('test-id');
      expect(props).to.deep.equal({ 'data-testid': 'test-id' });
    });

    it('should return data-testid prop for TestId', () => {
      const id = sid('test-id');
      const props = testIdProps(id);
      expect(props).to.deep.equal({ 'data-testid': 'test-id' });
    });

    it('should coerce TestId to string', () => {
      const id = sid('my-id');
      const props = testIdProps(id);
      expect(props['data-testid']).to.be.a('string');
      expect(props['data-testid']).to.equal('my-id');
    });
  });

  describe('isIdFactory()', () => {
    it('should return true for factory-created objects', () => {
      const btn = factory('btn');
      expect(isIdFactory(btn)).to.be.true;
    });

    it('should return true for bareFactory-created objects', () => {
      const bare = bareFactory();
      expect(isIdFactory(bare)).to.be.true;
    });

    it('should return false for plain functions', () => {
      const plainFn = (x: string) => x;
      expect(isIdFactory(plainFn)).to.be.false;
    });

    it('should return false for plain objects', () => {
      expect(isIdFactory({ prefix: 'test' })).to.be.false;
    });

    it('should return false for strings', () => {
      expect(isIdFactory('test')).to.be.false;
    });

    it('should return false for numbers', () => {
      expect(isIdFactory(123)).to.be.false;
    });

    it('should return false for null/undefined', () => {
      expect(isIdFactory(null)).to.be.false;
      expect(isIdFactory(undefined)).to.be.false;
    });

    it('should return false for objects without prefix', () => {
      const obj = { notPrefix: 'test' };
      expect(isIdFactory(obj)).to.be.false;
    });

    it('should return false for objects with non-string prefix', () => {
      const obj = { prefix: 123 };
      expect(isIdFactory(obj)).to.be.false;
    });
  });

  describe('Type Safety', () => {
    it('should allow different TestId types to be used interchangeably as strings when needed', () => {
      type TypeA = TestId<'type-a'>;
      type TypeB = TestId<'type-b'>;
      
      const idA: TypeA = sid<'type-a'>('id-a');
      const idB: TypeB = sid<'type-b'>('id-b');
      
      // Both should be usable as strings for data-testid
      const propsA = testIdProps(idA);
      const propsB = testIdProps(idB);
      
      expect(propsA['data-testid']).to.equal('id-a');
      expect(propsB['data-testid']).to.equal('id-b');
    });

    it('should maintain type safety through factory', () => {
      type ButtonType = TestId<'button'>;
      const btn = factory<'button'>('btn');
      
      const id: ButtonType = btn('submit');
      const props = testIdProps(id);
      
      expect(props['data-testid']).to.equal('btn-submit');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty prefix factory', () => {
      const empty = factory('');
      const id = empty('test');
      expect(id as string).to.equal('test');
    });

    it('should handle factory with only numbers as keys', () => {
      const num = factory('num');
      const id1 = num(1);
      const id2 = num(2);
      const id3 = num(3);
      
      expect(id1 as string).to.equal('num-1');
      expect(id2 as string).to.equal('num-2');
      expect(id3 as string).to.equal('num-3');
    });

    it('should handle special characters in ID parts', () => {
      const special = sid('test', 'with-dashes', 'and_underscores', '123');
      expect(special as string).to.equal('test-with-dashes-and_underscores-123');
    });

    it('should handle whitespace in ID parts (as-is)', () => {
      // Note: We don't trim whitespace, so it will be included in the ID
      const withSpace = sid('test', ' with space ');
      expect(withSpace as string).to.equal('test- with space ');
    });
  });
});
