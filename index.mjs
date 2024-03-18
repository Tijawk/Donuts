import { kebabCase } from 'change-case';
import { sync } from 'glob';
import { resolve } from 'path';

const srcPath = resolve('.', 'src/protocol/extract/output/scripts/com/ankamagames/dofus/network');
const outputPath = resolve('.', 'output');
const searchIn = resolve(srcPath , 'enums/**/*.as').replaceAll('\\', '/')
const files = sync(searchIn).map(file => {
    const relativePath = file.replace(srcPath, '').replaceAll("\\", "/").substring(1);
    const pathParts = relativePath.split('/');
    const subpath = pathParts.slice(0, -1).join('/');
    const filename = pathParts[pathParts.length - 1].replace('.as', '');
    return resolve(outputPath, subpath, kebabCase(filename) + '.js')
});

console.log({srcPath, searchIn, files});