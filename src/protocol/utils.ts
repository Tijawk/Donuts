import { readFileSync } from "fs";
import { first, isEmpty, without } from "underscore";
import { ActionScriptFunction, ActionScriptProperty } from "./types";
import { diffWords } from "diff";

export const asTypes = ['uint', 'int', 'Boolean', 'String', 'Number'];

/**
 * Read tpl file and replace placeholders with data
 * 
 * @param {string} tplFilename 
 * @param {Record<string, any>} data 
 * @returns {string}
 */
export function template(tplFilename: string, data: Record<string, any>): string {
    let content = readFileSync(tplFilename.replaceAll('\\', '/')).toString();
    Object.entries(data).forEach(([key, value]) => {
        content = content.replaceAll(new RegExp(`<${key}>`, "g"), value);
    });

    return content;
}

/**
 * Clean up function body
 * 
 * @param asFunction 
 * @returns {string}
 */
export function cleanAsFunction(asFunction: ActionScriptFunction): string {
    return asFunction.body.replace(/ as \w+/g, '').replace(/:(uint|int);/g, ' = 0;').replace(/:[\w|*]+/g, '');
}

/**
 * Parse ActionScriptProperty as variable
 * 
 * @param {ActionScriptProperty} asVariable 
 * @returns {string}
 */
export function parseAsVariable(asVariable: ActionScriptProperty): string {
    let str = 'this.' + asVariable.name;
    if (asVariable.type.indexOf('Vector') > -1) {
        str += ' = []';
    } else if (asTypes.includes(asVariable.type)) {
        str += ' = ' + asVariable.value;
    } else if (asVariable.type.indexOf('ByteArray') > -1) {
        str += ' = new Buffer(32)';
    } else {
        str += ' = new ' + asVariable.type + '()';
    }
    return str + ';';
}

/**
 * Resolve dependency path
 * 
 * @param cdir 
 * @param tdir 
 * @param {string | undefined} output 
 * @returns {string}
 */
export function resolveDependencyPath(cdir: any, tdir: any, output: string = ''): string {
    if (!cdir || !tdir) {
        return './';
    }

    if (!output) {
        let dif = diffWords(cdir, tdir)[0].value;
        cdir = prepResolveDependencyPath(dif, cdir);
        tdir = prepResolveDependencyPath(dif, tdir);
        output = '';
    }

    if (cdir.length > 0) {
        output += '../';
        return resolveDependencyPath(without(cdir, '' + first(cdir)), tdir, output);
    }

    if (isEmpty(output)) {
        output = './';
    }

    if (tdir.length > 0) {
        output += first(tdir) + '/';
        return resolveDependencyPath(cdir, without(tdir, '' + first(tdir)), output);
    }

    return output;
}

/**
 *  Prep resolve dependency path
 * 
 * @param {string} diff 
 * @param {string} dir 
 * @returns 
 */
function prepResolveDependencyPath(diff: string, dir: string) {
    let loc = dir.replace(diff, '');
    if (loc[0] === '.') {
        loc = loc.substring(1);
    }
    return isEmpty(loc) ? [] : loc.split('.');
}