import { dirname, sep } from 'path';
import { fileURLToPath } from 'url';

export const localFilePath = `file://${dirname(fileURLToPath(import.meta.url)).replace(/\//g, sep)}/test.html`;
export const localFilePath1 = `file://${dirname(fileURLToPath(import.meta.url)).replace(/\//g, sep)}/test1.html`;
