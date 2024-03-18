import { spawn } from "child_process";
import { SingleBar as ProgressBar } from "cli-progress";
import { glob } from "glob";
import path from "path";

export class SwfExtractor {
    protected progressbar!: ProgressBar;
    protected progressBarValue: number = 0;
    protected jpexsPath: string;
    protected swfPath: string;
    protected classPattern: string;
    public outputPath: string;

    constructor() {
        this.jpexsPath = path.resolve(__dirname, 'jpexs/ffdec.jar');
        this.outputPath = path.resolve(__dirname, 'output');
        this.classPattern = 'com.ankamagames.network++'
        this.swfPath = process.platform === 'win32'
            ? path.resolve(`${process.env.LOCALAPPDATA}/Ankama/dofus/DofusInvoker.swf`)
            : path.resolve(`${process.env.HOME}/.config/Ankama/dofus/DofusInvoker.swf`);
    }

    async extract(): Promise<void> {
        await new Promise<string>((resolve, reject) => {
            const exec = spawn('java', [
                '-jar', this.jpexsPath,
                '-selectclass', this.classPattern,
                '-export', 'script',
                this.outputPath,
                this.swfPath
            ]);

            exec.stdout.on('data', (data: Buffer) => this.printPercentage(data.toString()));
            exec.on('close', (code) => code === 0
                ? resolve('Ok')
                : reject(`Process exited with code ${code}`)
            );
        });

        this.progressbar.stop();

        this.setFullOutput();
    }

    protected printPercentage(data: string): void {
        const regex = /(\d+)\/(\d+)/;
        const match = regex.exec(data);
        if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);

            if (!this.progressbar) {
                this.progressbar = new ProgressBar({
                    format: 'Extraction progress [{bar}] {percentage}% | {value}/{total}'
                });
                this.progressbar.start(total, current);
            }
            if (this.progressBarValue < current && this.progressbar.getTotal() >= current) {
                this.progressbar.update(current);
                this.progressBarValue = current;
            }
        }
    }

    setFullOutput(): void {
        const searchIn = this.outputPath.replace(/\\/g, '/');
        const files = glob.sync(`${searchIn}/**/Metadata.as`);
        const file = files[0].replace(/\\/g, '/');
        const outputFullPath = file.split('/').slice(0, -1).join('/');
        this.outputPath = outputFullPath;
    }
}