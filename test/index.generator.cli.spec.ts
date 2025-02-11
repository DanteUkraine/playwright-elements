import { expect } from 'chai';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path, { join } from 'path';

const testRoot = join(__dirname, 'tempFlat');

describe.only('CLI Generator Tests', function () {
    this.timeout(10000);

    afterEach(() => {
      if (fs.existsSync(testRoot)) {
        fs.rmSync(testRoot, { recursive: true, force: true });
      }
    });

    it('should generate index.ts file in non-watch mode', () => {
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');

        execSync(
            `node lib/index.generator.cli.js ${testRoot} --cliLog false --watch false --quotes "'"`,
            { stdio: 'inherit' }
        );

        const indexFilePath = path.join(testRoot, 'index.ts');
        expect(fs.existsSync(indexFilePath), `Expected index file "${indexFilePath}" to exist.`).to.be.true;

        const content = fs.readFileSync(indexFilePath, 'utf8');
        expect(content, 'Index file should include export for file1.ts.').to.include(`export * from './file1';`);
    });

    it('should update index.ts when a new .ts file is added in watch mode', async function () {
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
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const indexFilePath = path.join(testRoot, 'index.ts');
            expect(fs.existsSync(indexFilePath), `Expected index file "${indexFilePath}" to exist after initial generation.`)
                .to.be.true;
            let content = fs.readFileSync(indexFilePath, 'utf8');
            expect(content, 'Initial index file should include export for file1.ts.')
                .to.include(`export * from './file1';`);

            fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');

            await new Promise((resolve) => setTimeout(resolve, 3000));

            content = fs.readFileSync(indexFilePath, 'utf8');
            expect(content, 'Updated index file should include export for file2.ts.')
                .to.include(`export * from './file2';`);
        } finally {
            cliProcess.kill();
        }
    });
});
