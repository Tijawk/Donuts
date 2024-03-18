import { resolve } from "path";
import { template } from "../utils";
import { ActionScriptClassWrapper } from "./as-class-wrapper";

export class ActionScriptConverter {
    convertBinary64(): string {
        return template(resolve(__dirname, `./templates/binary64.tpl`), {});
    }

    convertBooleanByte(): string {
        return template(resolve(__dirname, `./templates/boolean-byte-wrapper.tpl`), {
        });
    }

    convertCustomData(): string {
        return template(resolve(__dirname, `./templates/custom-data-wrapper.tpl`), {
        });
    }

    convertEnum(asClass: ActionScriptClassWrapper) {
        return template(resolve(__dirname, `./templates/enum.tpl`), {
            vars: [...asClass.variables, ...asClass.constants].join(''),
            classname: asClass.class,
        });
    }

    convertInt64(): string {
        return template(resolve(__dirname, `./templates/int64.tpl`), {
        });
    }

    convertMessage(asClass: ActionScriptClassWrapper): string {

        return template(resolve(__dirname, `./templates/message.class.tpl`), {
            id: asClass.protocolId,
            super: asClass.super ? '_super' : '',
            extends: asClass.super ? `__extends(${asClass.class}, _super);` : '',
            call: asClass.super ? '_super.call(this)' : '',
            parent: asClass.super ?? '',
            classname: asClass.class,
            vars: asClass.variables.join(''),
            serialize: asClass.serialize,
            deserialize: asClass.deserialize,
            typeDeps: asClass.typeDependencies.join(''),
        }
        ).replace('\n\n\n', '\n')
            .replace(/super.deserialize\(/g, 'this.deserializeAs_' + asClass.super + '.call(this, ')
            .replace(new RegExp(`super.serializeAs_${asClass.super}\\(`, 'g'), 'this.serializeAs_' + asClass.super + '.call(this, ')
            .replace('_super.call(this)', 'super()');
    }

    convertMessageReceiver(asClassList: ActionScriptClassWrapper[]): string {
        return template(resolve(__dirname, `./templates/message-receiver.tpl`), {
            list: asClassList.reduce((str, asClass) => {
                if (str !== "") str += ',\n';
                str += `${asClass.protocolId}: function () { return new ${asClass.class}(); }`;
                return str;
            }, ""),
        });
    }

    convertNetworkMessage(): string {
        return template(resolve(__dirname, `./templates/network-message.tpl`), {
        });
    }

    convertProtocolTypeManager(asClassList: ActionScriptClassWrapper[]): string {
        return template(resolve(__dirname, `./templates/protocol-type-manager.tpl`), {
            list: asClassList.reduce((str, asClass) => {
                if (str !== "") str += ',\n';
                str += `${asClass.protocolId}: function () { return new ${asClass.class}(); }`;
                return str;
            }, "")
        });
    }

    convertType(asClass: ActionScriptClassWrapper): string {
        return template(resolve(__dirname, `./templates/type.class.tpl`), {
            id: asClass.protocolId,
            super: asClass.super ? '_super' : '',
            extends: asClass.super ? `__extends(${asClass.class}, _super);` : '',
            call: asClass.super ? '_super.call(this)' : '',
            parent: asClass.super || 'NO_PARENT',
            classname: asClass.class,
            object: 'Protocol',
            vars: asClass.variables.join(''),
            serialize: asClass.serialize,
            deserialize: asClass.deserialize
        }
        ).replace('\n\n\n', '\n')
            .replace(new RegExp(`super.serializeAs_${asClass.super}\\(`, 'g'), 'this.serializeAs_' + asClass.super + '(this, ')
            .replace('_super.call(this)', 'super()')
            .replace('extends NO_PARENT', '')
    }

    convertUInt64(): string {
        return template(resolve(__dirname, `./templates/uint64.tpl`), {
        });
    }
}
