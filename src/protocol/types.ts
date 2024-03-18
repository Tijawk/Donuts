export type ActionScriptClass = {
    super?: string;
    namespace?: string;
    class: string;
    imports: ActionScriptImport[];
    constants: ActionScriptConstant[];
    functions: ActionScriptFunction[];
    properties: ActionScriptProperty[];
};

export type ActionScriptImport = { class: string; namespace?: string };
export type ActionScriptConstant = { name: string; value: string };
export type ActionScriptFunction = { name: string; body: string; override: boolean; visibility: string; params: { name: string; type: string }[]; type: string; };
export type ActionScriptProperty = { name: string; visibility: string; type: string; value: string };

export type ActionScriptClassInfos = { class: string, super?: string }
export type Maps = { file: string; name: string, parent?: string }[]
