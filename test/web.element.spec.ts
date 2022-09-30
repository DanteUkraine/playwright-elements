import { expect } from 'chai';
import {test} from "mocha";
import {$} from '../src';

describe('Web Element chainable selectors', () => {

    test('should have a child', () => {
        const element = $(`.class`).child(".child_class");
        expect(element.selector).is.equal(`.class >> .child_class`);
    });

    test('should have a sibling', () => {
        const element = $(`.class`).sibling($(".sibling_class"));
        expect(element.selector).is.equal(`.class ~ .sibling_class`);
    });

    test('should have a first sibling', () => {
        const element = $(`.class`).firstSibling($(".sibling_class"));
        expect(element.selector).is.equal(`.class + .sibling_class`);
    });

    test('should have a visible', () => {
        const element = $(`.class`).withVisible();
        expect(element.selector).is.equal(`.class:visible`);
    });

    test('should point on first element', () => {
        const element = $(`.class`).first();
        expect(element.selector).is.equal(`.class >> nth=0`);
    });

    test('should point on last element', () => {
        const element = $(`.class`).last();
        expect(element.selector).is.equal(`.class >> nth=-1`);
    });

    test('should point on element with text', () => {
        const element = $(`.class`).withText("text");
        expect(element.selector).is.equal(`.class:has-text("text")`);
    });

    test('should point on element where is text', () => {
        const element = $(`.class`).whereTextIs("text");
        expect(element.selector).is.equal(`.class:text-is("text")`);
    });

    test('should point on element which has', () => {
        const element = $(`.class`).has($(`.child`));
        expect(element.selector).is.equal(`.class:has(.child)`);
    });

    test('should point on element which has all', () => {
        const element = $(`.class`).hasAll($(`.first_child`), $(`.second_child`));
        expect(element.selector).is.equal(`.class:has(.first_child, .second_child)`);
    });

    test('should combine selector', () => {
        const element = $(`.class`).with(`.child`);
        expect(element.selector).is.equal(`.class.child`);
    });

});

describe('Web Element sub elements', () => {

    test('should have a sub elements', () => {
        const element = $(`.parent`)
            .subElements({
                child: $(`.child`)
            });
        expect(element).to.have.property('child');
    });
});

