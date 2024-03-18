import { D2Builder } from "./d2builder/d2builder";
import { SwfExtractor } from "./extract/swf-extractor";
import { JavaScriptCompiler } from "./jscompiler/js-compiler";

(async function main() {
    const swfExtractor = new SwfExtractor();
    await swfExtractor.extract();
    console.log('Source extracted to ' + swfExtractor.outputPath);

    const d2builder = new D2Builder(swfExtractor.outputPath);
    await d2builder.build();
    console.log('Source build to ' + d2builder.outputPath);

    const jscompiler = new JavaScriptCompiler(d2builder.outputPath);
    await jscompiler.compile();
    console.log('Protocol compiled to ' + jscompiler.outputPath);
})()