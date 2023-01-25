import {FrameLocator, Locator, Page} from "playwright-core";
import { cloneDeep } from "lodash";
import { BrowserInstance } from "./browser";
import { expect } from "@playwright/test";

function extractSelector(pointer: string | WebElement): string {
    return pointer instanceof WebElement ? pointer.selector : pointer;
}

export type LocatorAssertions = ReturnType<typeof expect<Locator>>;
type InternalElements = {[key: string]: WebElement};

export class WebElement {

    protected _isFrame = false;
    protected _isInFrame = false;
    protected _frameSelector = 'iframe';
    private _parents: WebElement[] = [];
    private readonly _selector: string;
    private readonly _by: By | undefined;
    private _byOptions: ByOptions | ByRoleOptions | undefined;
    private _hasLocator: string | undefined;

    constructor(selector: string, by?: By, options?: ByOptions | ByRoleOptions) {
        this._selector = selector;
        this._by = by;
        this._byOptions = options;
    }

    // page and frame pointers

    public asFrame() {
        this._isFrame = true;
        return this;
    }

    private buildFrameLocatorIfInFrame(locatorsChain: Locator | Page, element: WebElement): Locator | FrameLocator | Page {
        if(element._isInFrame) return locatorsChain.frameLocator(element._frameSelector);
        return locatorsChain;
    }

    private buildLocator(locatorsChain: Locator | Page, element: WebElement): Locator {
        const locatorsChainWithIframeType = this.buildFrameLocatorIfInFrame(locatorsChain, element);
        switch (element._by) {
            case By.getByAltText:
                locatorsChain = locatorsChainWithIframeType[By.getByAltText](element.narrowSelector, this._byOptions);
                break;
            case By.getByLabel:
                locatorsChain = locatorsChainWithIframeType[By.getByLabel](element.narrowSelector, this._byOptions);
                break;
            case By.getByPlaceholder:
                locatorsChain = locatorsChainWithIframeType[By.getByPlaceholder](element.narrowSelector, this._byOptions);
                break;
            case By.getByRole:
                locatorsChain = locatorsChainWithIframeType[By.getByRole](element.narrowSelector as Role, this._byOptions);
                break;
            case By.getByTestId:
                locatorsChain = locatorsChainWithIframeType[By.getByTestId](element.narrowSelector);
                break;
            case By.getByText:
                locatorsChain = locatorsChainWithIframeType[By.getByText](element.narrowSelector, this._byOptions);
                break;
            case By.getByTitle:
                locatorsChain = locatorsChainWithIframeType[By.getByTitle](element.narrowSelector, this._byOptions);
                break;
            default:
                const subLocator: Locator | undefined = element._hasLocator ?
                    BrowserInstance.currentPage.locator(element._hasLocator) : undefined;
                locatorsChain = locatorsChainWithIframeType.locator(element.narrowSelector, {has: subLocator});
                break;
        }
        return locatorsChain as Locator;
    }

    private buildParentLocatorsChain(): Locator | Page{
        let locatorsChain: Locator | Page = BrowserInstance.currentPage;
        if(this.parentElements.length > 0) {
            for (const element of this.parentElements){
                locatorsChain = this.buildLocator(locatorsChain, element);
            }
        }
        return locatorsChain;
    }

    public get locator(): Locator {
        return this.buildLocator(this.buildParentLocatorsChain(), this);
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

    public subElements<T extends WebElement, A extends InternalElements>(this: T, augment: A): T & A {
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
    get narrowSelector(): string {
        return this._selector;
    }

    private buildNarrowSelectorWithInternalLocator(target: WebElement = this): string {
        return target._hasLocator ?
            `${target.narrowSelector} >> internal:has="${target._hasLocator}"` : target.narrowSelector;
    }

    get selector(): string {
        if (this.parentElements.length)
            return `${this.parentsSelector} >> ${this.buildNarrowSelectorWithInternalLocator()}`;
        else
            return this.buildNarrowSelectorWithInternalLocator();
    }

    get parentsSelector(): string {
        return this.parentElements.map(element => this.buildNarrowSelectorWithInternalLocator(element)).join(" >> ");
    }

    private get parentElements(): WebElement[] {
        return this._parents;
    }

    private addParentSelector(parent: WebElement): void {
        this._parents.unshift(parent);
    }

    // chainable web element creation

    protected deepClone<T extends WebElement>(this: T, selector: string, internalLocator?: string): T {
        return Object.defineProperties(cloneDeep(this), {
                _selector: {
                    value: selector,
                    writable: false,
                    configurable: false
                },
                _hasLocator: {
                    value: internalLocator,
                    writable: true,
                    configurable: false
                }
            });
    }

    public has<T extends WebElement, R extends WebElement>(this: R, selector: string | T): R {
        if(this._by) throw Error(`has option can not be used with ${this._by}, it can be used only with $ or new WebElement('#id') syntax.`)
        return this.deepClone(this.narrowSelector, extractSelector(selector));
    }

    private addParentsToWebElement(element: WebElement): WebElement {
        element.addParentSelector(this);
        const parents = this.parentElements.reverse();
        for(const parent of parents) {
            element.addParentSelector(parent);
        }
        return element;
    }

    public $(selector: string): WebElement {
        return this.addParentsToWebElement(new WebElement(selector));
    }

    public $getByAltText(altText: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(altText, By.getByAltText, options));
    }

    public $getByLabel(label: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(label, By.getByLabel, options));
    }

    public $getByPlaceholder(placeholder: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(placeholder, By.getByPlaceholder, options));
    }

    public $getByRole(role: Role, options?: ByRoleOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(role, By.getByRole, options));
    }

    public $getByTestId(testId: string): WebElement {
        return this.addParentsToWebElement(new WebElement(testId, By.getByTestId));
    }

    public $getByText(text: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(text, By.getByText, options));
    }

    public $getByTitle(title: string, options?: ByOptions): WebElement {
        return this.addParentsToWebElement(new WebElement(title, By.getByTitle, options));
    }

    public withVisible() {
        return this.deepClone(`${this.buildNarrowSelectorWithInternalLocator()} >> visible=true`);
    }

    public withText(text: string | RegExp) {
        return this.deepClone(`${this.buildNarrowSelectorWithInternalLocator()} >> text=${text}`);
    }

    public whereTextIs(text: string) {
        return this.deepClone(`${this.buildNarrowSelectorWithInternalLocator()} >> text="${text}"`);
    }

    public nth(index: number) {
        return this.deepClone(`${this.buildNarrowSelectorWithInternalLocator()} >> nth=${index}`);
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

    public async map<T extends WebElement, R>(this: T, item: (element: T) => R | Promise<R>): Promise<Awaited<R[]>> {
        const list: T[] = await this.getAll();
        const futureItems: Promise<R>[]  = [];
        for (const ele of list) {
            futureItems.push(Promise.resolve(item(ele)));
        }
        return Promise.all(futureItems);
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

enum By {
    getByAltText = 'getByAltText',
    getByLabel = 'getByLabel',
    getByPlaceholder = 'getByPlaceholder',
    getByRole = 'getByRole',
    getByTestId = 'getByTestId',
    getByText = 'getByText',
    getByTitle = 'getByTitle'
}

type ByOptions = {
    exact?: boolean
}

type Role = 'alert' | 'alertdialog'| 'application' | 'article' | 'banner' | 'blockquote' | 'button' | 'caption' |
    'cell' | 'checkbox' | 'code' | 'columnheader' | 'combobox' | 'complementary' | 'contentinfo' | 'definition' |
    'deletion' | 'dialog' | 'directory' | 'document' | 'emphasis' | 'feed' | 'figure' | 'form' | 'generic' | 'grid' |
    'gridcell' | 'group' | 'heading' | 'img' | 'insertion' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' |
    'marquee' | 'math' | 'meter' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' |
    'navigation' | 'none' | 'note' | 'option' | 'paragraph' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' |
    'region' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'separator' | 'slider' |
    'spinbutton' | 'status' | 'strong' | 'subscript' | 'superscript' | 'switch' | 'tab' | 'table' | 'tablist' |
    'tabpanel'| 'term' | 'textbox' | 'time' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem';

type ByRoleOptions = {
    checked?: boolean,
    disabled?: boolean,
    exact?: boolean,
    expanded?: boolean,
    includeHidden?: boolean,
    level?: number,
    name?: string | RegExp,
    pressed?: boolean,
    selected?: boolean
}

export function $(selector: string): WebElement {
    return new WebElement(selector);
}

export function $getByAltText(altText: string, options?: ByOptions): WebElement {
    return new WebElement(altText, By.getByAltText, options);
}

export function $getByLabel(label: string, options?: ByOptions): WebElement {
    return new WebElement(label, By.getByLabel, options);
}

export function $getByPlaceholder(placeholder: string, options?: ByOptions): WebElement {
    return new WebElement(placeholder, By.getByPlaceholder, options);
}

export function $getByRole(role: Role, options?: ByRoleOptions): WebElement {
    return new WebElement(role, By.getByRole, options);
}

export function $getByTestId(testId: string): WebElement {
    return new WebElement(testId, By.getByTestId);
}

export function $getByText(text: string, options?: ByOptions): WebElement {
    return new WebElement(text, By.getByText, options);
}

export function $getByTitle(title: string, options?: ByOptions): WebElement {
    return new WebElement(title, By.getByTitle, options);
}

export function initDesktopOrMobile<T>(desktop: T, mobile: T): T {
    return BrowserInstance.isContextMobile ? mobile : desktop;
}
