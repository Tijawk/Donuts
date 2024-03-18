import kebabCase from "kebab-case";
import { ActionScriptClass, ActionScriptConstant, ActionScriptFunction } from "../types";
import { cleanAsFunction, parseAsVariable, resolveDependencyPath } from "../utils";

export class ActionScriptClassWrapper {
    class: string;
    namespace: string | undefined;
    super?: string;
    protocolId!: string;
    variables!: string[];
    constants!: string[];
    typeDependencies!: string[];
    serialize!: string;
    deserialize!: string;

    constructor(asClass: ActionScriptClass) {
        this.class = asClass.class;
        this.namespace = asClass.namespace;
        this.super = asClass.super;
        this.setProtocolId(asClass);
        this.setConstants(asClass);
        this.setVariables(asClass);
        this.setTypeDependencies(asClass);
        this.setSerialize(asClass);
        this.setDeserialize(asClass);
    }

    protected setProtocolId(asClass: ActionScriptClass) {
        const asConstant = asClass.constants.find(({ name }) => name === 'protocolId');
        this.protocolId = (asConstant as ActionScriptConstant)?.value ?? '';
    }

    protected setVariables(asClass: ActionScriptClass) {
        this.variables = asClass.properties
            ?.filter(property => property.visibility === 'public')
            ?.map(asVariable => parseAsVariable(asVariable));
    }

    protected setConstants(asClass: ActionScriptClass) {
        this.constants = asClass.constants.map(constant => {
            return `${asClass.class}.${constant.name} = ${constant.value};\n`
        });
    }

    protected setTypeDependencies(asClass: ActionScriptClass) {
        this.typeDependencies = asClass.imports
            .filter(asImport => asImport.namespace?.includes('dofus.network.types'))
            .map(asImport => {
                var depPath = resolveDependencyPath(asClass.namespace, asImport.namespace) + kebabCase(asImport.class + '.js');
                return '\nvar ' + asImport.class + ' = require(\'' + depPath + '\').' + asImport.class + ';';
            })
    }

    protected setSerialize(asClass: ActionScriptClass) {
        const asFunction = asClass.functions.find(({ name }) => name === 'serializeAs_' + asClass.class);

        this.serialize = asFunction ? cleanAsFunction(asFunction as ActionScriptFunction) : '';
    }

    protected setDeserialize(asClass: ActionScriptClass) {
        const asFunction = asClass.functions.find(({ name }) => name === 'deserializeAs_' + asClass.class);
        let deserialize = asFunction ? cleanAsFunction(asFunction as ActionScriptFunction) : '';

        deserialize = deserialize.replace(/this._([^;]*)\(input\);/g, (_: unknown, b: string) => {
            const asFunction = asClass.functions.find(({ name }) => name === `_${b}`);
            return asFunction ? cleanAsFunction(asFunction as ActionScriptFunction) : '';
        });

        deserialize = deserialize.replace(/this.deserializeByteBoxes\(input\);/g, (_: unknown) => {
            const asFunction = asClass.functions.find(({ name }) => name === `deserializeByteBoxes`);
            return asFunction ? cleanAsFunction(asFunction as ActionScriptFunction) : '';
        });

        this.deserialize = deserialize;
    }
}

