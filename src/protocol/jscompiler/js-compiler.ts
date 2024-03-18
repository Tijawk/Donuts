import { readFileSync } from "fs";
import { outputFile } from "fs-extra";
import { glob } from "glob";
import { resolve } from "path";
import { Maps } from "../types";
import { template } from "../utils";
import {format} from 'prettier';
import { minify } from 'terser';

export class JavaScriptCompiler {
    public outputPath: string;
    protected maps: Maps;
    protected compiledFiles: string[];

    constructor(protected srcPath: string) {
        this.outputPath = resolve(__dirname, '../output');
        this.maps = JSON.parse(readFileSync(resolve(this.srcPath, 'maps.json')).toString()) as Maps;
        this.compiledFiles = [];
    }

    async compile(): Promise<void> {
        const jsSearchPath = resolve(this.srcPath, '*.js').replaceAll('\\', '/');
        const jsFiles = (await glob(jsSearchPath, {})).sort((a, b) => a.localeCompare(b));
        let data = '';

        for (const file of jsFiles) {
            console.log('compiling', file);
            if (data !== '') data += '\n';
            data += readFileSync(file).toString();
        }

        for (const map of this.maps) {
            const deps = this.compileDependency(map);
            if (deps) data += deps + '\n';
            if(map.name === 'CharacterMinimalInformations') {
                console.log('compiling', map.file, this.compiledFiles.includes(map.file));
            }
            if (!this.compiledFiles.includes(map.file)) {
                data += readFileSync(map.file).toString()
                if(map.name === 'CharacterMinimalInformations') console.log(map.file)

                this.compiledFiles.push(map.file)
            }
        }

        const protocol = template(resolve(__dirname, './templates/protocol.tpl'), {
            data,
        })

        const formatedData = await format(protocol, {parser: 'babel'});
        await outputFile(resolve(this.outputPath, 'protocol.js'), formatedData);

        const minifiedData = await minify(formatedData, {compress: false});
        await outputFile(resolve(this.outputPath, 'protocol.min.js'), minifiedData.code as string);
    }

    protected compileDependency(map: Maps[0]) {
        if(map.name === 'CharacterMinimalInformations')  
            console.log(map.file, this.compiledFiles.includes(map.file), map.parent)
        let data = '';
        // add deps content only once
        if (map.parent) {
            const parent = this.maps.find(({ name }) => map.parent === name);
            if (parent && !this.compiledFiles.includes(parent.file)) {
                data += this.compileDependency(parent)+ '\n';
                data += readFileSync(parent.file).toString() + '\n';
                this.compiledFiles.push(parent.file);
            }
        }

        return data;
    }
}