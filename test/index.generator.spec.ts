import { expect } from 'chai';
import { generateIndexFile } from '../src';
import fs from 'fs';
import path from 'path';

const testRoot = path.join(__dirname, 'tempFlat');
const nestedRoot = path.join(__dirname, 'tempNested');

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
        fs.writeFileSync(path.join(testRoot, 'file1.ts'), 'export AdminPage {}');
        fs.writeFileSync(path.join(testRoot, 'file2.ts'), 'export LoginPage {}');

        generateIndexFile(testRoot, { cliLog: false });

        const indexPath = path.join(testRoot, 'index.ts');
        expect(fs.existsSync(indexPath)).to.be.true;
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content).to.include(`export * from './file1';`);
        expect(content).to.include(`export * from './file2';`);
    });

    it('should generate index files for nested directories and reexport nested modules', () => {
        fs.mkdirSync(path.join(nestedRoot, 'sub'), { recursive: true });
        fs.writeFileSync(path.join(nestedRoot, 'rootFile.ts'), 'export LoginPage {}');
        fs.writeFileSync(path.join(nestedRoot, 'sub', 'nestedFile.ts'), 'export AdminPage {}');

        generateIndexFile(nestedRoot, { cliLog: false });

        const nestedIndex = path.join(nestedRoot, 'sub', 'index.ts');
        expect(fs.existsSync(nestedIndex)).to.be.true;
        const nestedContent = fs.readFileSync(nestedIndex, 'utf-8');
        expect(nestedContent).to.include(`export * from './nestedFile';`);

        const rootIndex = path.join(nestedRoot, 'index.ts');
        expect(fs.existsSync(rootIndex)).to.be.true;
        const rootContent = fs.readFileSync(rootIndex, 'utf-8');
        expect(rootContent).to.include(`export * from './rootFile';`);
        expect(rootContent).to.include(`export * from './sub';`);
    });

    it('should respect the quotes option by using double quotes when specified', () => {
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(path.join(testRoot, 'file1.ts'), 'export AdminPage {}');

        generateIndexFile(testRoot, { quotes: '"' });

        const indexPath = path.join(testRoot, 'index.ts');
        expect(fs.existsSync(indexPath)).to.be.true;
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content).to.include('export * from "./file1";');
        expect(content).to.not.include(`export * from './file1';`);
    });
});
