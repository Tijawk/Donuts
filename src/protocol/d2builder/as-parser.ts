import { readFile } from "fs-extra";
import { last, without } from 'underscore';
import { ActionScriptClassInfos, ActionScriptFunction, ActionScriptImport, ActionScriptProperty } from "../types";
import { ActionScriptClassWrapper } from "./as-class-wrapper";

export class ActionScriptParser {

    async parse(filename: string): Promise<ActionScriptClassWrapper> {
        const data = (await readFile(filename)).toString();

        return new ActionScriptClassWrapper({
            ...this.getClassInfos(data),
            namespace: this.getNamespace(data),
            imports: this.getImports(data),
            constants: this.getConstants(data),
            functions: this.getFunctions(data),
            properties: this.getProperties(data),
        });
    }

    getClassInfos(data: string): ActionScriptClassInfos {
        var loc = data.match(/public class [\w| ]+/g) || [];
        var result = loc.length ? `${loc[0]}`.split(' ') : [];

        var classInfos: ActionScriptClassInfos = {
            class: '',
            super: undefined,
        };

        for (let i = 0; i < result.length; i++) {
            switch (result[i]) {
                case 'class':
                    classInfos.class = result[i + 1];
                    break;
                case 'extends':
                    classInfos.super = result[i + 1];
                    break;
            }
        }

        return classInfos;
    }

    getNamespace(data: string): string | undefined {
        const result = data.match(/package [\w|.]+/g);
        return result ? result[0].replace('package ', '') : undefined;
    }

    getImports(data: string): ActionScriptImport[] {
        const result = data.match(/import [\w|.]+;/g) || [];
        return result.map(function (str) {
            const loc = str.replace('import ', '').replace(';', '').split('.');
            return {
                class: `${last(loc)}`,
                namespace: without(loc, `${last(loc)}`).join('.')
            };
        });
    }

    getProperties(data: string): ActionScriptProperty[] {
        const result = data.match(/(private|public) var (.)+;/g) || [];
        return result.map(property => this.parseVariable(property));
    }

    getConstants(data: string) {
        const result = data.match(/(private|public) static const (.)+;/g) || [];
        return result.map(constant => this.parseVariable(constant));
    }

    getFunctions(data: string) {
        const result = data.match(/(override)* (private|public) function (.)+/g) || [];
        var arrData = data.split('\n').map(str => str.trim());
        return result.map(func => this.parseFunction(func, arrData));
    }

    parseVariable(data: string) {
        // split 'var name:type = value;'
        const [name, value] = data
            .replace(/(private|public)/g, '')
            .replace(' var ', '')
            .replace(' static const ', '')
            .replace(';', '')
            .split(' = ');
        const [varName, varType] = name.split(':');
        return {
            name: varName,
            type: varType,
            visibility: data.indexOf('public') > -1 ? 'public' : 'private',
            value,
        };
    }

    parseFunction(functionName: string, data: string[]): ActionScriptFunction {
        return {
            body: this.parseFunctionBody(functionName, data),
            override: functionName.indexOf('override') > -1,
            visibility: functionName.indexOf('public') > -1 ? 'public' : 'private',
            name: (functionName.match(/\w+\(/g) as RegExpMatchArray)[0].replace('(', ''),
            params: this.parseFunctionParams(functionName),
            type: functionName.split(':')[1] ? functionName.split(':')[1].trim() : 'constructor',
        };
    }

    parseFunctionParams(data: string): { name: string, type: string }[] {
        var result = data.match(/\((.)*\)/g) || [];
        var params = result[0]?.replace(/[\(\)]/g, '').split(',') ?? [];
        return params.map(function (param) {
            var [name, type] = param.split(':');
            return {
                name,
                type
            }
        });
    }

    parseFunctionBody(functionName: string, data: string[]): string {
        let count = 1;
        // start index after first '{' 
        let i = data.indexOf(functionName.trim()) + 2;
        let str = '';
        while (count !== 0) {
            if (data[i] === '{') count++;
            else if (data[i] === '}') count--;
            str += data[i];
            i++;
        }
        // ignore last '}'
        return str.substring(0, str.length - 1);
    }

}