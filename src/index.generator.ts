import { existsSync, unlinkSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, basename } from 'path';

export type Options = {
    cliLog?: boolean;
    /** Determines whether to use single (') or double (") quotes. */
    quotes?: '\'' | '"';
};

/**
 * Creates an `index.ts` file in the specified folder.
 *
 * The function scans the supplied folder for `.ts` files (excluding any existing `index.ts`)
 * and also looks for nested subdirectories. It generates export statements for all TypeScript
 * files in the folder, then recurses into any subdirectories. If an index file is created in a
 * subdirectory, an export statement reexporting that submodule is added in the parent folder's
 * index.
 *
 * @param folder - The folder in which to generate the index file.
 * @param options - Optional settings:
 *   - cliLog?: enables logging to the console (default false)
 *   - quotes?: whether to use single (`'`) or double (`"`) quotes in the export statements (default `'`)
 *
 * @example
 * // In a Playwright configuration file (playwright.config.ts)
 * import { devices, PlaywrightTestConfig } from '@playwright/test';
 * import { createIndexFile } from '../src/indexGenerator';
 *
 * // Generate an index file in the target folder:
 * createIndexFile('./integration.tests/resources');
 *
 * const config: PlaywrightTestConfig = {
 *   testDir: './integration.tests',
 *   timeout: 30000,
 *   projects: [
 *     { name: 'Desktop Chromium', use: { ...devices['Desktop Chrome'] } },
 *   ],
 * };
 *
 * export default config;
 *
 * In either a flat or nested directory structure, one index file is generated:
 * - In a flat folder with file1.ts and file2.ts:
 *      export * from './file1';
 *      export * from './file2';
 * - In a folder with a nested directory `nested` (with its own index.ts),
 *   the parent index file will also include:
 *      export * from './nested';
 */
export function generateIndexFile(folder: string, options?: Options): void {
    const { cliLog, quotes }: Options = {
        cliLog: false,
        quotes: '\'',
        ...options,
    };

    if (cliLog) console.info(`Processing folder: ${folder}`);
    const indexFile = join(folder, 'index.ts');

    if (existsSync(indexFile)) {
        unlinkSync(indexFile);
    }

    const entries = readdirSync(folder);
    // .ts files (excluding index.ts)
    const tsFiles = entries.filter(
        (file) => file.endsWith('.ts') && file !== 'index.ts'
    );

    const subDirs = entries.filter((entry) => {
        const entryPath = join(folder, entry);
        return statSync(entryPath).isDirectory();
    });

    const exportsArr: string[] = tsFiles.map(
        (file) => `export * from ${quotes}./${basename(file, '.ts')}${quotes};`
    );

    for (const subDir of subDirs) {
        const subDirPath = join(folder, subDir);
        generateIndexFile(subDirPath, options);
        if (existsSync(join(subDirPath, 'index.ts'))) {
            exportsArr.push(`export * from ${quotes}./${subDir}${quotes};`);
        }
    }

    if (exportsArr.length === 0) {
        if (cliLog) console.warn(`No exportable modules found in ${folder}. Skipping index generation.`);
        return;
    }

    writeFileSync(indexFile, exportsArr.join('\n'));
    if (cliLog) console.info(`Created index file: ${indexFile}`);
}