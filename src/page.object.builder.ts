// Type for consumers page object
export type PageObject<T extends Record<string, any>, Suffix extends string = DefaultSuffix> = Instances<T, Suffix>;

type LowercaseFirst<T extends string> = T extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}` : T;

export type Instances<
    T extends Record<string, any>,
    Suffix extends string,
    LowercaseFlag extends boolean = true
> = {
    [K in keyof T as K extends `${infer Base}${Suffix}`
        ? LowercaseFlag extends true
            ? LowercaseFirst<Base>
            : Base
        : never]: T[K] extends new (...args: any[]) => infer Instance ? Instance : never;
};

type DefaultSuffix = 'Page';

type Options<Suffix extends string = DefaultSuffix, LowercaseFlag extends boolean = true> = {
    suffix?: Suffix;
    lowerCaseFirst?: LowercaseFlag;
}

const defaultSuffix = 'Page';

export function buildPageObject<
    T extends Record<string, any>,
    Suffix extends string = DefaultSuffix,
    LowercaseFlag extends boolean = true
>(
    mod: T,
    options: Options<Suffix, LowercaseFlag> = { suffix: defaultSuffix as Suffix, lowerCaseFirst: true as LowercaseFlag }
): Instances<T, Suffix, LowercaseFlag> {

    const { suffix = defaultSuffix as Suffix, lowerCaseFirst = true as LowercaseFlag } = options;

    // Initialize pages object with the correct type
    const pages = {} as Instances<T, Suffix, LowercaseFlag>;

    Object.keys(mod).forEach((key) => {
        if (!suffix || key.endsWith(suffix)) {
            // Remove the suffix from the key to get the base property name - THIS SHOULD BE OPTIONAL
            const baseName = suffix ? key.slice(0, -suffix.length) : key;

            const propName = lowerCaseFirst
                ? baseName.charAt(0).toLowerCase() + baseName.slice(1)
                : baseName;

            if (typeof mod[key] === 'function' && /^class\s/.test(mod[key].toString())) {
                pages[propName as keyof Instances<T, Suffix, LowercaseFlag>] = new mod[key]();
            }
        }
    });

    return { ...pages };
}
