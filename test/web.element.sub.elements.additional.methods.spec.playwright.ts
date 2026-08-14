import { test, expect } from '../src';
import { expectTypeOf } from 'expect-type';
import { $getByTestId, $, WebElement } from '../src';
import { localFilePath } from './utils';

// Migrated from mocha/chai to @playwright/test

test.describe('Web Element chainable selectors', () => {

    test.describe('by index', () => {

        test.beforeEach(async ({ goto, page }) => {
            await goto(localFilePath);
            await page.waitForSelector('h1');
        })

        test.describe('element clone and override', () => {
            
            test('has text', async () => {
                const origin = $(`li`).hasText(/[1-6]/g);
                const overridden = origin.clone({ hasText: 'text' });
                expect(await origin.count()).toBe(6);
                expect(await overridden.count()).toBe(1);
            })

            test('has not text', async () => {
                const origin = $(`li`).hasNotText(/[1-6]/g);
                const overridden = origin.clone({ hasNotText: 'text' });
                expect(await origin.count()).toBe(1);
                expect(await overridden.count()).toBe(6);
            })
        })

        test('should point on first element', async () => {
            const element = $getByTestId(`test-div`)
                .subElements({
                    child: $(`div`)
                        .subElements({
                            innerChild: $(`[id]`)
                        })
                })
            expect(await element.child.first().innerChild.getAttribute('id')).toBe(`missed`);
        });

        test('should point on last element', async () => {
            const element = $getByTestId(`test-div`)
                .subElements({
                    child: $(`div`)
                        .subElements({
                            innerChild: $(`[id]`)
                        })
                })
            expect(await element.child.last().innerChild.getAttribute('id')).toBe(`wrong-target2`);
        });

    })
});

test.describe('Web Element augmentation', () => {

    test('should have a sub elements', () => {
        const element = $(`.parent`)
            .subElements({
                child: $(`.child`)
                    .subElements({
                        innerChild: $(`.innerChild`)
                    })
            });
        expect(element).toHaveProperty('child');
        expect(element.child).toHaveProperty('innerChild');
        expect(element.narrowSelector).toBe('.parent')
    });

    test('should reuse sub elements', () => {
        const commonChild = {
            child: $(`.child`)
                .subElements({
                    innerChild: $(`.innerChild`)
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        const element2 = $(`.parent2`).subElements(commonChild);
        expect(element1.child.selector).toBe(`.parent1 >> .child`);
        expect(element2.child.selector).toBe(`.parent2 >> .child`);
        expect(element1.child.innerChild.selector).toBe(`.parent1 >> .child >> .innerChild`);
        expect(element2.child.innerChild.selector).toBe(`.parent2 >> .child >> .innerChild`);
    });

    test('should reuse chainable sub elements', () => {
        const commonChild = {
            child: $(`.child`).$(`.subChild`)
                .subElements({
                    innerChild: $(`.innerChild`).$(`.subChild`)
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        const element2 = $(`.parent2`).subElements(commonChild);
        expect(element1.child.selector).toBe(`.parent1 >> .child >> .subChild`);
        expect(element2.child.selector).toBe(`.parent2 >> .child >> .subChild`);
        expect(element1.child.innerChild.selector).toBe(`.parent1 >> .child >> .subChild >> .innerChild >> .subChild`);
        expect(element2.child.innerChild.selector).toBe(`.parent2 >> .child >> .subChild >> .innerChild >> .subChild`);
    });

    test('should have additional method', () => {
        expect($(`.selector`)
            .withMethods({
                additionalMethod() {
                    // stub
                }
            })).toHaveProperty('additionalMethod');
    });

    test('additional method should be added to original instance of element', () => {
        const element = $(`.selector`);
        element
            .withMethods({
                additionalMethod() {
                    // stub
                }
            })
        expect(element).toHaveProperty('additionalMethod');
    });

    test('additional methods should be tied to instance', () => {
        const commonChild = {
            child: $(`.child`)
                .withMethods({
                    additionalMethod() {
                        // stub
                    }
                })
                .subElements({
                    innerChild: $(`.innerChild`)
                        .withMethods({
                            additionalMethod() {
                                // stub
                            }
                        })
                })
        };
        const element1 = $(`.parent1`).subElements(commonChild);
        commonChild.child.withMethods({
            secondAdditionalMethod(){
                // stub
            }
        })
        commonChild.child.innerChild.withMethods({
            secondAdditionalMethod(){
                // stub
            }
        })
        const element2 = $(`.parent2`).subElements(commonChild);
        expect(element1.child).toHaveProperty('additionalMethod');
        expect(element1.child.innerChild).toHaveProperty('additionalMethod');
        expect(element1.child).not.toHaveProperty('secondAdditionalMethod');
        expect(element1.child.innerChild).not.toHaveProperty('secondAdditionalMethod');

        expect(element2.child).toHaveProperty('additionalMethod');
        expect(element2.child.innerChild).toHaveProperty('additionalMethod');
        expect(element2.child).toHaveProperty('secondAdditionalMethod');
        expect(element2.child.innerChild).toHaveProperty('secondAdditionalMethod');
    })

    test('should throw on duplicated additional method', () => {
        expect(() => $(`.selector`)
            .withMethods({
                click() {
                    // pass
                }
            })).toThrow('Can not add method with name \'click\' because such method already exists.');
    });

    test('direct child', () => {
        const element = $('parent').subElements({
            child: $('child')
            })
            .withMethods({
                subChild(){
                    return this.child.$('subChild');
                }
            });
        expect(element.subChild().selector).toBe('parent >> child >> subChild');
        expect(element.subChild().$('oneMore').selector).toBe('parent >> child >> subChild >> oneMore');
        expect(element.subChild().selector).toBe('parent >> child >> subChild');
    })

    test('get by method with direct child', () => {
        const element = $getByTestId('parentTestId').$('child')
            .subElements({
                subChild: $getByTestId('subChild').$('subChild2'),
            });
        expect(element.subChild.$getByPlaceholder('placeholder').selector).toBe('parentTestId >> child >> subChild >> subChild2 >> placeholder');
    })

    test('get parent of element', async () => {
        const component = $('component')
            .subElements({
                subComponent: $('sub-component')
                    .subElements({
                        innerComponent: $('inner-component'),
                        secondInnerComponent: $('second-inner-component')
                            .subElements({
                                innerElement: $('inner-element')
                            })
                            .withMethods({
                                checkParent() {
                                    expectTypeOf<WebElement & {
                                        innerElement: WebElement
                                    }>(this);
                                    return this.parent();
                                }
                            })
                    })
            });

        expectTypeOf<WebElement & {
            subComponent: WebElement & {
                innerComponent: WebElement,
                secondInnerComponent: WebElement & {
                    checkParent: () => WebElement
                }
            }
        }>(component);

        expect(component.subComponent.innerComponent.parent().narrowSelector).toBe('sub-component');
        expect(component.subComponent.innerComponent.parent().parent().narrowSelector).toBe('component');
        expect(component.subComponent.secondInnerComponent.checkParent().innerComponent.narrowSelector).toBe('inner-component');
        expect(component.parent()).toBeUndefined();
    })

    test('with adds elements and methods', async () => {
        const element = $(`.parent`)
            .with({
                child: $(`.child`)
                    .with({
                        innerChild: $(`.innerChild`),
                        additionalMethod() {
                            // stub
                            expectTypeOf<WebElement & {
                                innerChild: WebElement,
                            }>(this);
                        }
                    }),
                additionalMethod() {
                    // stub
                    expectTypeOf<WebElement & {
                        child: WebElement & {
                            innerChild: WebElement,
                            additionalMethod: (this: WebElement & { innerChild: WebElement }) => void
                        }
                    }>(this);
                }
            });

        element.additionalMethod();
        element.child.additionalMethod();

        expectTypeOf<WebElement & {
            child: WebElement & {
                innerChild: WebElement,
                additionalMethod: (this: WebElement & { innerChild: WebElement }) => void
            },
            additionalMethod: (this: WebElement & {
                child: WebElement & {
                    innerChild: WebElement,
                    additionalMethod: (this: WebElement) => void
                }
            }) => void
        }>(element);

        expect(element).toHaveProperty('additionalMethod');
        expect(element.child).toHaveProperty('additionalMethod');
        expect(element).toHaveProperty('child');
        expect(element.child).toHaveProperty('innerChild');
        expect(element.narrowSelector).toBe('.parent')
    });
});
