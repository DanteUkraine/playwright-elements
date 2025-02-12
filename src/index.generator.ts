import chokidar, { FSWatcher } from 'chokidar';
import { existsSync, readdirSync, writeFileSync, rmSync, statSync } from 'fs';
import { join, basename } from 'path';

export type Options = {
    watch?: boolean;
    cliLog?: boolean;
    quotes?: '\'' | '"';
};

export interface WatcherManager {
    watchers: FSWatcher[];
    addWatcher: (watcher: FSWatcher) => void;
    closeAll: () => Promise<void>;
}

// Factory function to create a new WatcherManager.
function createWatcherManager(): WatcherManager {
    const watchers: FSWatcher[] = [];
    return {
        watchers,
        addWatcher: (watcher: FSWatcher) => {
            watchers.push(watcher);
        },
        closeAll: async () => {
            await Promise.all(watchers.map((w) => w.close()));
            watchers.length = 0;
        },
    };
}

/**
 * Generates an `index.ts` file in the specified folder (and recursively in subdirectories)
 * and, if watch mode is enabled, creates watchers in every folder.
 *
 * This implementation captures all FS watchers in a shared WatcherManager that is
 * returned so that they can be canceled later.
 *
 * @param folder - The directory to generate the index file in.
 * @param options - Options for watch mode, logging, and quote style.
 * @param manager - (Optional) Shared watcher manager. If not provided, a new one is created.
 * @returns A WatcherManager instance that can close all watchers.
 */
export function generateIndexFile(
    folder: string,
    options?: Options,
    manager?: WatcherManager
): WatcherManager {
    const { cliLog, quotes, watch } = {
        watch: false,
        cliLog: false,
        quotes: '\'',
        ...options,
    };

    // Use provided manager or create a new one.
    if (!manager) {
        manager = createWatcherManager();
    }

    // Function to generate the index file for the current folder.
    const generateIndex = () => {
        if (!existsSync(folder)) {
            if (cliLog) console.warn(`Folder ${folder} does not exist, skipping index generation.`);
            return;
        }
        if (cliLog) console.info(`Processing folder: ${folder}`);
        const indexFile = join(folder, 'index.ts');

        // Remove existing index.ts if it exists.
        if (existsSync(indexFile)) {
            rmSync(indexFile, { force: true });
        }

        // Read the current folder's contents.
        const entries = readdirSync(folder);
        const tsFiles = entries.filter(file => file.endsWith('.ts') && file !== 'index.ts');
        const subDirs = entries.filter(entry => existsSync(join(folder, entry)) && statSync(join(folder, entry)).isDirectory());

        // Generate export statements for .ts files.
        const exportsArr: string[] = tsFiles.map(file => `export * from ${quotes}./${basename(file, '.ts')}${quotes};`);

        // Process each subdirectory recursively (using the same manager to capture watchers).
        for (const subDir of subDirs) {
            const subDirPath = join(folder, subDir);
            // Recursive index generation includes watchers.
            generateIndexFile(subDirPath, { ...options, watch: watch }, manager);
            if (existsSync(join(subDirPath, 'index.ts'))) {
                exportsArr.push(`export * from ${quotes}./${subDir}${quotes};`);
            }
        }

        if (exportsArr.length === 0) {
            if (cliLog) console.warn(`No exportable modules found in ${folder}. Skipping index generation.`);
            return;
        }

        // Write the collected export statements into index.ts.
        writeFileSync(indexFile, exportsArr.join('\n'));
        if (cliLog) console.info(`Created index file: ${indexFile}`);
    };

    generateIndex();

    // If watch mode is enabled, create a watcher for the current folder.
    if (watch) {
        const watcher = chokidar.watch(folder, {
            ignored: /(^|[/\\])\../, // Ignore dotfiles.
            persistent: true,
            ignoreInitial: true,
        });

        watcher.on('add', (filePath) => {
            if (filePath.endsWith('.ts') && !filePath.endsWith('index.ts')) {
                if (cliLog) console.log(`File added: ${filePath}`);
                generateIndex();
            }
        });
        watcher.on('unlink', (filePath) => {
            if (filePath.endsWith('.ts') && !filePath.endsWith('index.ts')) {
                if (cliLog) console.log(`File removed: ${filePath}`);
                generateIndex();
            }
        });
        // Add this watcher to our shared manager.
        manager.addWatcher(watcher);
    }

    return manager;
}
