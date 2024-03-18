import { outputFile } from "fs-extra";
import { glob } from "glob";
import kebabCase from "kebab-case";
import { resolve } from "path";
import { Maps } from "../types";
import { ActionScriptClassWrapper } from "./as-class-wrapper";
import { ActionScriptConverter } from "./as-converter";
import { ActionScriptParser } from "./as-parser";

export class D2Builder {
    protected asParser: ActionScriptParser;
    protected asConverter: ActionScriptConverter;
    public outputPath: string;
    protected maps: Maps = [];

    constructor(protected srcPath: string) {
        this.outputPath = resolve(__dirname, 'output');
        this.asParser = new ActionScriptParser();
        this.asConverter = new ActionScriptConverter();
    }

    async build(): Promise<void> {
        await this.writeFile({
            data: this.asConverter.convertBinary64(),
            output: resolve(this.outputPath, 'binary64.js')
        });

        await this.writeFile({
            data: this.asConverter.convertBooleanByte(),
            output: resolve(this.outputPath, 'boolean-byte-wrapper.js')
        });

        await this.writeFile({
            data: this.asConverter.convertCustomData(),
            output: resolve(this.outputPath, 'custom-data-wrapper.js')
        });

        await this.writeFile({
            data: this.asConverter.convertInt64(),
            output: resolve(this.outputPath, 'int64.js')
        });

        await this.writeFile({
            data: this.asConverter.convertNetworkMessage(),
            output: resolve(this.outputPath, 'network-message.js')
        });

        await this.writeFile({
            data: this.asConverter.convertUInt64(),
            output: resolve(this.outputPath, 'uint64.js')
        });


        // metadata.js
        const metadataAsClass = await this.asParser.parse(resolve(this.srcPath, 'Metadata.as'));
        await this.writeFile({
            data: this.asConverter.convertEnum(metadataAsClass),
            output: resolve(this.outputPath, 'metadata.js'),
            asClass: metadataAsClass
        });

        // protocol-constants-enum.js
        const protocolConstantsAsClass = await this.asParser.parse(resolve(this.srcPath, 'ProtocolConstantsEnum.as'));
        await this.writeFile({
            data: this.asConverter.convertEnum(protocolConstantsAsClass),
            output: resolve(this.outputPath, 'protocol-constants-enum.js'),
            asClass: protocolConstantsAsClass
        });

        // enums/*.as
        const enumSearchPath = resolve(this.srcPath, 'enums/*.as').replaceAll('\\', '/');
        const enumFiles = await glob(enumSearchPath);
        for (const enumFile of enumFiles) {
            const enumAsClass = await this.asParser.parse(enumFile);
            await this.writeFile({
                data: this.asConverter.convertEnum(enumAsClass),
                output: this.resolveOutputFilePath(enumFile),
                asClass: enumAsClass
            });
        }

        // types/**/*.js
        const typeSearchPath = resolve(this.srcPath, 'types/**/*.as').replaceAll('\\', '/');
        const typeFiles = (await glob(typeSearchPath)).sort((a, b) => a.localeCompare(b))
        const typeAsClassList = [];
        for (const typeFile of typeFiles) {
            const typeAsClass = await this.asParser.parse(typeFile);
            await this.writeFile({
                data: this.asConverter.convertType(typeAsClass),
                output: this.resolveOutputFilePath(typeFile),
                asClass: typeAsClass
            });

            typeAsClassList.push(typeAsClass);
        }

        // protocol-type-manager.js
        await this.writeFile({
            data: this.asConverter.convertProtocolTypeManager(typeAsClassList),
            output: resolve(this.outputPath, 'protocol-type-manager.js')
        })

        // messages/**/*.js
        const messageSearchPath = resolve(this.srcPath, 'messages/**/*.as').replaceAll('\\', '/');
        const messageFiles = (await glob(messageSearchPath)).sort((a, b) => a.localeCompare(b));
        const messageAsClassList = [];
        for (const messageFile of messageFiles) {
            const messageAsClass = await this.asParser.parse(messageFile);
            await this.writeFile({
                data: this.asConverter.convertMessage(messageAsClass),
                output: this.resolveOutputFilePath(messageFile),
                asClass: messageAsClass
            });

            messageAsClassList.push(messageAsClass);
        }

        // message-receiver.js
        await this.writeFile({
            data: this.asConverter.convertMessageReceiver(messageAsClassList),
            output: resolve(this.outputPath, 'message-receiver.js')
        });

        // maps.json
        await this.writeFile({
            data: JSON.stringify(this.maps, null, 2),
            output: resolve(this.outputPath, 'maps.json')
        });
    };

    protected resolveOutputFilePath(filepath: string) {
        const relativePath = filepath.replaceAll("\\", "/").replace(this.srcPath, '');
        const pathParts = relativePath.split('/').filter(Boolean);
        const subpath = pathParts.slice(0, -1).join('/');
        const asFilename = pathParts[pathParts.length - 1];
        const jsFilename = this.resolveOutputFileName(asFilename);

        return resolve(this.outputPath, subpath, jsFilename)
    }

    protected resolveOutputFileName(filename: string) {
        filename = filename.replace('.as', '')
        filename = kebabCase(filename);
        if (filename.startsWith('-')) filename = filename.substring(1);

        return filename + '.js'
    }

    protected async writeFile({ data, output, asClass }: { data: string; output: string; asClass?: ActionScriptClassWrapper }) {
        if (asClass) {
            this.maps.push({
                file: output,
                name: asClass.class,
                parent: asClass.super
            })
        }

        await outputFile(output, data);
    }
}
