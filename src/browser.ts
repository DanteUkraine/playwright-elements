import {firefox, chromium, webkit, LaunchOptions, BrowserContext} from "playwright-core";
import {Page, Browser, BrowserContextOptions} from "playwright-core";

///////////////////////////////////
export enum BrowserName {
    CHROMIUM = 'chromium',
    CHROME = 'chrome',
    FIREFOX = 'firefox',
    WEBKIT = 'webkit',
    MSEDGE = 'msedge'
}

class Context {

    private readonly context: BrowserContext
    private _pages: Page[];
    private _previousPage: Page | undefined;

    constructor(context: BrowserContext) {
        this.context = context;
        this._pages = this.context.pages();
        this.context.on('page', page => this._pages.push(page));
    }

    get get(): BrowserContext {
        return this.context;
    }

    get pages(): Page[] {
        return this._pages;
    }

    get previousPage(): Page {
        if (this._previousPage) return this._previousPage;
        throw new Error(`Previous page was not initialized.`)
    }

    set previousPage(page: Page) {
        this._previousPage = page;
    }

}

export class BrowserInstance {

    public name: BrowserName | undefined;
    private _browser: Browser | undefined;
    private _currentContext: Context | undefined;
    private _currentPage: Page | undefined;

    // page - getter, setter, builder method

    get currentPage() {
        if (this._currentPage) return this._currentPage;
        throw new Error(`Page was not started`);
    }

    set currentPage(page: Page) {
        this._currentPage = page;
    }

    withPage(page: Page) {
        this._currentPage = page;
    }

    // context - getter, setter, builder method

    private get context(): Context {
        if (this._currentContext) return this._currentContext;
        throw new Error(`Context was not started`);
    }

    get currentContext(): BrowserContext {
        if (this._currentContext) return this._currentContext.get;
        throw new Error(`Context was not started`);
    }

    set currentContext(context: BrowserContext) {
        this._currentContext = new Context(context);
    }

    withContext(context: BrowserContext) {
        this._currentContext = new Context(context);
    }

    // browser - getter, setter, builder method

    get browser() {
        if (this._browser) return this._browser;
        throw new Error(`Browser was not started`);
    }

    set browser(browser: Browser) {
        this._browser = browser;
    }

    withBrowser(browser: Browser) {
        this._browser = browser;
    }

    //

    private async launch(browserName: BrowserName, options?: LaunchOptions): Promise<Browser> {
        this.name = browserName;
        switch (browserName) {
            case BrowserName.CHROME:
                return await chromium.launch({...options, ...{channel: 'chrome'}});
            case BrowserName.MSEDGE:
                return await chromium.launch({...options, ...{channel: 'msedge'}});
            case BrowserName.WEBKIT:
                return await webkit.launch({...options});
            case BrowserName.FIREFOX:
                return await firefox.launch({...options});
            default:
                return chromium.launch({...options});
        }
    }

    public async start(browserName: BrowserName, options?: LaunchOptions): Promise<Browser> {
        this.browser = await this.launch(browserName, options);
        return this.browser;
    }

    public async startNewContext(options: BrowserContextOptions): Promise<BrowserContext> {
        const contextOptions: BrowserContextOptions = {...options, ...{ignoreHTTPSErrors: true}};
        this.currentContext = await this.browser.newContext(contextOptions);
        this.currentContext.on('page', page => {
            if (this._currentPage) this.context.previousPage = this.currentPage;
            this.currentPage = page;
        });
        return this.currentContext;
    }

    public async startNewPage(): Promise<Page> {
        this.currentPage = await this.currentContext.newPage();
        return this.currentPage;
    }

    public async close() {
        await this.browser.close();
    }

    // helpers
    public currentUrl(): string {
        return this.currentPage.url();
    }

    // tab actions
    public async switchToPreviousTab() {
        this.currentPage = this.context.previousPage;
        await this.currentPage.bringToFront();
    }
}

let instance: BrowserInstance | undefined;

export const browser = {
    init(): BrowserInstance {
        instance = new BrowserInstance();
        return instance;
    },

    get get(): BrowserInstance {
        if(instance) return instance;
        throw new Error(`Browser instance was not created please use use`)
    }
}

