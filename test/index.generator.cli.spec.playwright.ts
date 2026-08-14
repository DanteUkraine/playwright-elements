import { test, expect } from '../src';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path, { join } from 'path';
import { waitForFileContent, waitForFileToExist } from './utils/waitFor';

// Migrated from mocha/chai to @playwright/test
// This file tests CLI commands, doesn't need browser

const testRoot = join(__dirname, 'tempFlat');

test.describe('CLI Generator Tests', () => {

    test.afterEach(() => {
      if (fs.existsSync(testRoot)) {
        fs.rmSync(testRoot, { recursive: true, force: true });
      }
    });

    test('should generate index.ts file in non-watch mode', () => {
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');

        execSync(
            `node lib/index.generator.cli.js ${testRoot} --cliLog false --watch false --quotes "'"`,
            { stdio: 'inherit' }
        );

        const indexFilePath = path.join(testRoot, 'index.ts');
        expect(fs.existsSync(indexFilePath), `Expected index file "${indexFilePath}" to exist.`).toBe(true);

        const content = fs.readFileSync(indexFilePath, 'utf8');
        expect(content, 'Index file should include export for file1.ts.').toContain(`export * from './file1';`);
    });

    test('should update index.ts when a new .ts file is added in watch mode', async () => {
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');
        fs.writeFileSync(join(testRoot, 'file2.ts'), 'export class LoginPage {}');

        const cliProcess = spawn(
            'node',
            [
                'lib/index.generator.cli.js',
                testRoot,
                '--cliLog',
                'false',
                '--watch',
                'true',
                '--quotes',
                `'`
            ],
            { stdio: ['ignore', 'pipe', 'pipe'] }
        );

        try {
            const indexFilePath = path.join(testRoot, 'index.ts');
            
            // Wait for initial index file generation with bounded polling
            await waitForFileToExist(indexFilePath, { timeout: 5000, interval: 100 });
            expect(fs.existsSync(indexFilePath), `Expected index file "${indexFilePath}" to exist after initial generation.`)
                .toBe(true);
            let content = fs.readFileSync(indexFilePath, 'utf8');
            expect(content, 'Initial index file should include export for file1.ts.')
                .toContain(`export * from './file1';`);

            fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');

            // Wait for file2 export to appear in index
            content = await waitForFileContent(indexFilePath, `export * from './file2';`, { timeout: 5000, interval: 100 });

            content = fs.readFileSync(indexFilePath, 'utf8');
            expect(content, 'Updated index file should include export for file2.ts.')
                .toContain(`export * from './file2';`);
        } finally {
            cliProcess.kill();
        }
    }, { timeout: 15000 });
});
