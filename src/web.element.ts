import { Locator, Page } from "playwright-core";
import { cloneDeep } from "lodash";
import { BrowserInstance } from "./browser";
import { expect } from "@playwright/test";

function extractSelector(pointer: string | WebElement): string {
    return pointer instanceof WebElement ? pointer.selector : pointer;
}

export type LocatorAssertions = ReturnType<typeof expect<Locator>>;


export class WebElement {

    protected _isFrame = false;
    protected _isInFrame = false;
    protected _frameSelector = 'iframe';
    private _parents: WebElement[] = [];
    private readonly _selector: string;
    private _hasLocator: string | undefined;

    constructor(selector: string) {
        this._selector = selector;
    }

    public usePage<T extends WebElement>(this: T, page: Page): T {
        BrowserInstance.currentPage = page;
        return this;
    }

    // page and frame pointers

    public asFrame() {
        this._isFrame = true;
        return this;
    }

    public get locator(): Locator {
        const subLocator: Locator | undefined = this._hasLocator ? BrowserInstance.currentPage.locator(this._hasLocator) : undefined;
        return this._isInFrame ?
            BrowserInstance.currentPage.frameLocator(this._frameSelector).locator(this.selector, {has: subLocator}) :
            BrowserInstance.currentPage.locator(this.selector, {has: subLocator});
    }

    public get _(): Locator {
        return this.locator;
    }

    // Expect

    public expect(message?: string): LocatorAssertions {
        return expect(this.locator, message);
    }

    public softExpect(message?: string): LocatorAssertions {
        return expect.soft(this.locator, message);
    }

    // augmentation
    private recursiveParentSelectorInjection<T extends WebElement, E>(this: T, element: E) {
        const values = Object.values(element as Record<string, any>)
            .filter((value) => value instanceof WebElement);
        if (values.length) {
            values.forEach((value: WebElement) => {
                value.addParentSelector(this);
                this.recursiveParentSelectorInjection(value);
            })
        }
    }

    public subElements<T extends WebElement, A>(this: T, augment: A): T & A {
        const elements = augment as Record<string, WebElement>;
        Object.entries(elements).forEach(([key, value]) => {
            let clone = cloneDeep(value);
            if (this._isFrame) {
                clone._isInFrame = true;
                clone._frameSelector = this.selector;
            } else if (this._isInFrame) {
                clone._isInFrame = true;
                clone._frameSelector = this._frameSelector;
                clone.addParentSelector(this as WebElement);
                this.recursiveParentSelectorInjection(clone);
            } else {
                clone.addParentSelector(this as WebElement);
                this.recursiveParentSelectorInjection(clone);
            }
            (this as any)[key] = clone;
        });
        return this as T & A;
    }

    public withMethods<T extends WebElement, A>(this: T, augment: A): T & A {
        const methods = augment as Record<string, Function>;
        Object.keys(methods).forEach(key => {
            if (key in this) throw new Error(`Can not add method with name '${key}' because such method already exists.`);
            (this as any)[key] = methods[key]
        });
        return this as T & A;
    }

    // getters setters
    get narrowSelector() {
        return this._selector;
    }

    get selector(): string {
        if (this.parentElements.length)
            return `${this.parentsSelector} >> ${this._selector}`;
        else
            return this._selector;
    }

    get parentsSelector(): string {
        return this.parentElements.map(element => element.narrowSelector).join(" >> ");
    }

    private get parentElements(): WebElement[] {
        return this._parents;
    }

    private addParentSelector(parent: WebElement): void {
        this._parents.unshift(parent);
    }

    private set hasLocator(selector: string) {
        this._hasLocator = selector;
    }

    // chainable web element creation

    protected $<T extends WebElement>(this: T, selector: string): T {
        return Object.defineProperty(cloneDeep(this), "_selector",
            {
                value: selector,
                writable: false,
                configurable: false
            });
    }

    public has<T extends WebElement, R extends WebElement>(this: R, selector: string | T): R {
        const element = this.$(this._selector)
        element.hasLocator = extractSelector(selector);
        return element;
    }

    public withVisible() {
        return this.$(`${this._selector} >> visible=true`);
    }

    public withText(text: string) {
        return this.$(`${this._selector} >> text=${text}`);
    }

    public whereTextIs(text: string) {
        return this.$(`${this._selector} >> text="${text}"`);
    }

    public nth(index: number) {
        return this.$(`${this._selector} >> nth=${index}`);
    }

    public first() {
        return this.nth(0);
    }

    public last() {
        return this.nth(-1);
    }

    // arrays of elements

    private async getAll<T extends WebElement>(this: T): Promise<T[]> {
        const elements: T[] = [];
        const amount = await this.locator.count();
        for (let i = 0; i < amount; i++) {
            elements.push(this.nth(i));
        }
        return elements;
    }

    public async asyncForEach<T extends WebElement>(this: T, action: (element: T) => unknown | Promise<unknown>): Promise<void> {
        const list: T[] = await this.getAll();
        const promises: (unknown | Promise<unknown>)[] = []
        for (const ele of list) {
            promises.push(action(ele));
        }
        await Promise.all(promises);
    }

    public async syncForEach<T extends WebElement>(this: T, action: (element: T) => unknown | Promise<unknown>): Promise<void> {
        const list: T[] = await this.getAll();
        for (const ele of list) {
            await action(ele);
        }
    }

    public async map<T extends WebElement, R>(this: T, item: (element: T) => R): Promise<R[]> {
        const list: T[] = await this.getAll();
        const futureItems: Promise<R>[] = [];
        for (const ele of list) {
            futureItems.push(Promise.resolve(item(ele)));
        }
        return await Promise.all(futureItems);
    }

    public async filter<T extends WebElement>(this: T, predicate: (element: T) => boolean | Promise<boolean>): Promise<T[]> {
        const list: T[] = await this.getAll();
        const matchedElements: T[] = [];
        for (const ele of list) {
            if(await predicate(ele))
                matchedElements.push(ele);
        }
        return matchedElements;
    }
}

export function $(selector: string): WebElement {
    return new WebElement(selector);
}
