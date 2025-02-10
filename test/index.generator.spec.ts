import { expect } from 'chai';
import { generateIndexFile } from '../src';
import fs from 'fs';
import { join } from 'path';

const testRoot = join(__dirname, 'tempFlat');
const nestedRoot = join(__dirname, 'tempNested');

describe('generateIndexFile', () => {

    afterEach(() => {
        [testRoot, nestedRoot].forEach((dir) => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        });
    });

    it('should generate index file for flat directory structure', () => {
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');
        fs.writeFileSync(join(testRoot, 'file2.ts'), 'export class LoginPage {}');

        generateIndexFile(testRoot, { watch: false, cliLog: false });

        const indexPath = join(testRoot, 'index.ts');
        expect(fs.existsSync(indexPath), `Expected index file "${indexPath}" to exist after generation.`).to.be.true;
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content, `Expected index file to include export for file1.ts.`)
            .to.include(`export * from './file1';`);
        expect(content, `Expected index file to include export for file2.ts.`)
            .to.include(`export * from './file2';`);
    });

    it('should generate index files for nested directories and reexport nested modules', () => {
        fs.mkdirSync(join(nestedRoot, 'sub'), { recursive: true });
        fs.writeFileSync(join(nestedRoot, 'rootFile.ts'), 'export class LoginPage {}');
        fs.writeFileSync(join(nestedRoot, 'sub', 'nestedFile.ts'), 'export class AdminPage {}');

        generateIndexFile(nestedRoot, { watch: false, cliLog: false });

        const nestedIndex = join(nestedRoot, 'sub', 'index.ts');
        expect(fs.existsSync(nestedIndex), `Expected nested index file "${nestedIndex}" to be created in the subdirectory.`).to.be.true;
        const nestedContent = fs.readFileSync(nestedIndex, 'utf-8');
        expect(nestedContent, `Expected nested index file to include export for nestedFile.ts.`)
            .to.include(`export * from './nestedFile';`);

        const rootIndex = join(nestedRoot, 'index.ts');
        expect(fs.existsSync(rootIndex), `Expected root index file "${rootIndex}" to be created.`).to.be.true;
        const rootContent = fs.readFileSync(rootIndex, 'utf-8');
        expect(rootContent, `Expected root index file to include export for rootFile.ts.`)
            .to.include(`export * from './rootFile';`);
        expect(rootContent, `Expected root index file to include export for the subdirectory "sub".`)
            .to.include(`export * from './sub';`);
    });

    it('should respect the quotes option by using double quotes when specified', () => {
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(join(testRoot, 'file1.ts'), 'export class AdminPage {}');

        generateIndexFile(testRoot, { watch: false, quotes: '"' });

        const indexPath = join(testRoot, 'index.ts');
        expect(fs.existsSync(indexPath), `Expected index file "${indexPath}" to be generated with double quotes option.`).to.be.true;
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content, `Expected index file to include export using double quotes for file1.ts.`)
            .to.include('export * from "./file1";');
        expect(content, `Expected index file NOT to include export using single quotes when double quotes are specified.`)
            .to.not.include(`export * from './file1';`);
    });

    it('should update index.ts when a new .ts file is added in watch mode', async () => {
        const rootIndexFilePath = join(nestedRoot, 'index.ts');
        const nestedIndexFilePath = join(nestedRoot, 'sub', 'index.ts');

        fs.mkdirSync(join(nestedRoot, 'sub'), { recursive: true });
        fs.writeFileSync(join(nestedRoot, 'rootFile.ts'), 'export class LoginPage {}');
        fs.writeFileSync(join(nestedRoot, 'sub', 'nestedFile.ts'), 'export class AdminPage {}');

        await new Promise((resolve) => setTimeout(resolve, 300));

        const watchers = generateIndexFile(nestedRoot, { watch: true, cliLog: false });

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));

            expect(fs.existsSync(rootIndexFilePath), `Expected root index file '${rootIndexFilePath}' to be generated.`).to.be.true;
            expect(fs.existsSync(nestedIndexFilePath), `Expected nested index file '${nestedIndexFilePath}' to be generated.`).to.be.true;

            let content = fs.readFileSync(rootIndexFilePath, 'utf-8');
            let nestedContent = fs.readFileSync(nestedIndexFilePath, 'utf-8');
            expect(content, 'Expected root index file to include export for rootFile.ts.')
                .to.include(`export * from './rootFile';`);
            expect(content, 'Expected root index file to include export for the `sub` directory.')
                .to.include(`export * from './sub';`);
            expect(nestedContent, 'Expected nested index file to include export for nestedFile.ts.')
                .to.include(`export * from './nestedFile';`);

            fs.writeFileSync(join(nestedRoot, 'newFile.ts'), 'export class NewPage {}');
            fs.writeFileSync(join(nestedRoot, 'sub', 'newFile.ts'), 'export class NewPage {}');

            await new Promise((resolve) => setTimeout(resolve, 2500));

            content = fs.readFileSync(rootIndexFilePath, 'utf-8');
            nestedContent = fs.readFileSync(nestedIndexFilePath, 'utf-8');
            expect(content, 'After adding newFile.ts, expected root index file to include export for newFile.ts.')
                .to.include(`export * from './newFile';`);
            expect(nestedContent, 'After adding newFile.ts, expected nested index file to include export for newFile.ts.')
                .to.include(`export * from './newFile'`);
        } finally {
            await watchers.closeAll();
        }
    }).timeout(7_000);
});
