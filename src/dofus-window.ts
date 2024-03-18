import { Point, Region, Size, Window, getWindows, sleep } from "@nut-tree/nut-js";

export class DofusWindow {
    public gameTitle!: string;
    public gameRegion!: Region;
    public window!: Window;

    async init() {
        await this.findWindow();
        await this.window.focus();
        await sleep(1000);
        this.gameTitle = await this.window.getTitle();
        await this.window.resize(new Size(1024, 728))
        await this.window.move(new Point(0, 0));
        const region = await this.window.getRegion();        
        // remove the top bar
        this.gameRegion = new Region(
            region.left,
            region.top, // + 21,
            region.width,
            region.height, // - 21
        );
    }

    protected async findWindow() {
        const windows = await getWindows();
        const expectedTitle = `${process.env.PLAYER_NAME} - Dofus 2.`

        for (const window of windows) {
            if (!this.window) {
                const title = (await window.title).toLowerCase();
                if (title.includes(expectedTitle.toLowerCase())) {
                    this.window = window;
                }
            }
        }

        if (!this.window) {
            throw new Error('Window not found. Make sure Dofus is running and the character is logged in.')
        }
    }
}

