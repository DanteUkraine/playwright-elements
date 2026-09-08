/**
 * Sibling Method Calls in .with() - Finding #10
 * 
 * These tests verify that two sibling methods in one .with() can call each other
 * without TypeScript errors. This was previously broken due to the Omit<..., K> type
 * which removed the current method from the available types.
 * 
 * The fix changed the type from T & Omit<NestedElements<T, A>, K> to T & A.
 */

import { test, expect } from '@playwright/test';
import { $, WebElement } from '../../src';

test.describe('Sibling Method Calls in .with() - Finding #10', () => {
  test('methods should be able to call each other', () => {
    // This is the exact case from the findings report
    const form = $('#f').with({
      input: $('input'),
      field: function(name: string) { 
        return this.$(`[name="${name}"]`); 
      },
      async fill2(n: string) { 
        await this.field(n).fill('v'); 
      },
    });
    
    // Should be defined without TypeScript errors
    expect(form).toBeDefined();
    expect(form.input).toBeDefined();
    expect(form.field).toBeDefined();
    expect(form.fill2).toBeDefined();
  });

  test('method can call sibling method with parameters', () => {
    const component = $('#root').with({
      button: $('button'),
      getButtonByIndex: function(index: number) {
        return this.button.nth(index);
      },
      clickButtonByIndex: async function(index: number) {
        await this.getButtonByIndex(index).click();
      }
    });
    
    expect(component).toBeDefined();
    expect(component.getButtonByIndex).toBeDefined();
    expect(component.clickButtonByIndex).toBeDefined();
  });

  test('nested .with() should preserve type safety', () => {
    const parent = $('#parent').with({
      child: $('#child').with({
        grandchild: $('#grandchild'),
        getGrandchild: function() {
          return this.grandchild;
        }
      }),
      getChild: function() {
        return this.child;
      }
    });
    
    expect(parent).toBeDefined();
    expect(parent.getChild).toBeDefined();
    expect(parent.child.getGrandchild).toBeDefined();
  });

  test('methods can call multiple sibling methods', () => {
    const form = $('#form').with({
      firstName: $('input[name="firstName"]'),
      lastName: $('input[name="lastName"]'),
      email: $('input[name="email"]'),
      
      getFirstName: function() { return this.firstName; },
      getLastName: function() { return this.lastName; },
      getEmail: function() { return this.email; },
      
      fillPersonalInfo: async function(first: string, last: string, email: string) {
        await this.getFirstName().fill(first);
        await this.getLastName().fill(last);
        await this.getEmail().fill(email);
      },
      
      clearAll: async function() {
        await this.getFirstName().clear();
        await this.getLastName().clear();
        await this.getEmail().clear();
      }
    });
    
    expect(form).toBeDefined();
    expect(form.fillPersonalInfo).toBeDefined();
    expect(form.clearAll).toBeDefined();
  });

  test('methods can chain calls to sibling methods', () => {
    const table = $('#table').with({
      rows: $('tr'),
      
      getRow: function(index: number) {
        return this.rows.nth(index);
      },
      
      getRowCount: async function() {
        return await this.rows.count();
      },
      
      getFirstRow: function() {
        return this.getRow(0);
      },
      
      getLastRow: function() {
        return this.getRow(this.getRowCount() - 1);
      }
    });
    
    expect(table).toBeDefined();
    expect(table.getRow).toBeDefined();
    expect(table.getFirstRow).toBeDefined();
    expect(table.getLastRow).toBeDefined();
  });

  test('complex component with multiple method interactions', () => {
    const page = $('#page').with({
      header: $('#header'),
      footer: $('#footer'),
      content: $('#content'),
      
      getHeaderHeight: async function() {
        const box = await this.header.locator.boundingBox();
        return box?.height || 0;
      },
      
      getFooterHeight: async function() {
        const box = await this.footer.locator.boundingBox();
        return box?.height || 0;
      },
      
      getContentHeight: async function() {
        const box = await this.content.locator.boundingBox();
        return box?.height || 0;
      },
      
      getTotalHeight: async function() {
        return (await this.getHeaderHeight()) + 
               (await this.getContentHeight()) + 
               (await this.getFooterHeight());
      }
    });
    
    expect(page).toBeDefined();
    expect(page.getTotalHeight).toBeDefined();
  });
});
