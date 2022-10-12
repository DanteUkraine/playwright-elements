import { expect } from 'chai';
import {test} from "mocha";
import {$} from '../src';

describe('Web Element chainable selectors', () => {

    test('should have a child', () => {
        const element = $(`.class`).child(".child_class");
        expect(element.selector).is.equal(`.class >> .child_class`);
    });

    test('should have a visible', () => {
        const element = $(`.class`).withVisible();
        expect(element.selector).is.equal(`.class >> visible=true`);
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
        expect(element.selector).is.equal(`.class >> text=text`);
    });

    test('should point on element where is text', () => {
        const element = $(`.class`).whereTextIs("text");
        expect(element.selector).is.equal(`.class >> text="text"`);
    });

});

describe('Web Element augmentation', () => {

    test('should have a sub elements', () => {
        const element = $(`.parent`)
            .subElements({
                child: $(`.child`)
                    .subElements({
                        innerChild: $(`.innerChild`)
                    })
            });
        expect(element).to.have.property('child');
        expect(element.child).to.have.property('innerChild');
    });

    test('should have additional method', () => {
        const element = $(`.selector`)
            .withMethods({
                additionalMethod() {

                }
            })
        expect(element).to.have.property('additionalMethod');
    });
});

