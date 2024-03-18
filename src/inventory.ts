import { Key, Point, Region, imageResource, keyboard, mouse, screen, sleep } from '@nut-tree/nut-js';
import '@nut-tree/template-matcher';
import { countRegionColor } from './utils';
import { DofusWindow } from './dofus-window';

export class Inventory {
    podRegion: Region;
    constructor(protected window: DofusWindow) {
        this.podRegion = new Region(722, 585, 80, 1);
    }

    async isOpen() {
        const inventoryTitle = 'resources/inventory_title.png'
        try {
            await screen.find(imageResource(inventoryTitle), {
                searchRegion: this.window.gameRegion,
                confidence: 0.9
            });
            return true;
        }
        catch (e) {
            return false;
        }

    }

    async open(): Promise<void> {
        if (await this.isOpen()) return;

        await keyboard.type(Key.I);

        let retry = 0;
        do {
            await sleep(500);
            if (retry > 5) return this.open();
            retry++;
        } while (!await this.isOpen());
    }

    async close(): Promise<void> {
        if (!await this.isOpen()) return;

        await keyboard.type(Key.I);

        let retry = 0;
        do {
            await sleep(500);
            if (retry > 5) return this.close();
            else retry++;
        } while (await this.isOpen());
    }

    async getPods() {
        await this.open();
        await mouse.move([new Point(0, 0)])
        const totalPoints = this.podRegion.width * this.podRegion.height;
        const colorPoints = await countRegionColor(this.podRegion, '#CCF600', 10);
        return (colorPoints / totalPoints) * 100;
    }

    async isFullPods() {
        return await this.getPods() > 80;
    }
}