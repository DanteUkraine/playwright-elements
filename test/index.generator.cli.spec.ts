import { expect } from 'chai';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('CLI Generator Tests', function () {
    this.timeout(10000);

    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-'));
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('should generate index.ts file in non-watch mode', () => {
        fs.writeFileSync(path.join(tempDir, 'file1.ts'), 'export class Dummy {}');

        execSync(
            `node lib/index.generator.cli.js ${tempDir} --cliLog false --watch false --quotes "'"`,
            { stdio: 'inherit' }
        );

        const indexFilePath = path.join(tempDir, 'index.ts');
        expect(fs.existsSync(indexFilePath), `Expected index file "${indexFilePath}" to exist.`).to.be.true;

        const content = fs.readFileSync(indexFilePath, 'utf8');
        expect(content, 'Index file should include export for file1.ts.').to.include(`export * from './file1';`);
    });

    it('should update index.ts when a new .ts file is added in watch mode', async function () {
        // Create an initial dummy TypeScript file.
        fs.writeFileSync(path.join(tempDir, 'file1.ts'), 'export class Dummy {}');

        const cliProcess = spawn(
            'node',
            [
                'lib/index.generator.cli.js',
                tempDir,
                '--cliLog',
                'false',
                '--watch',
                'true',
                '--quotes',
                `'`
            ],
            { stdio: ['ignore', 'pipe', 'pipe'] }
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const indexFilePath = path.join(tempDir, 'index.ts');
        expect(fs.existsSync(indexFilePath), `Expected index file "${indexFilePath}" to exist after initial generation.`)
            .to.be.true;
        let content = fs.readFileSync(indexFilePath, 'utf8');
        expect(content, 'Initial index file should include export for file1.ts.')
            .to.include(`export * from './file1';`);

        fs.writeFileSync(path.join(tempDir, 'file2.ts'), 'export class NewDummy {}');

        await new Promise((resolve) => setTimeout(resolve, 3000));

        content = fs.readFileSync(indexFilePath, 'utf8');
        expect(content, 'Updated index file should include export for file2.ts.')
            .to.include(`export * from './file2';`);

        cliProcess.kill();
    });
});
