import { Button, Image, Point, Region, mouse, randomPointIn, sleep } from "@nut-tree/nut-js";
import { DofusWindow } from "./dofus-window";
import { Player } from "./player";
import { Tchat } from "./tchat";
import { getPixelColor, isSameHexColor } from "./utils";

export class WorldMap {
    mapRegion!: Region;
    currentPosition!: string;
    currentMapImage!: Image;
    window!: DofusWindow;
    player!: Player;
    tchat!: Tchat;

    constructor(window: DofusWindow, player: Player, tchat: Tchat) {
        this.window = window;
        this.player = player;
        this.tchat = tchat;
        // remove unuseful part of the gameRegion (interface, change map zone, etc...)
        this.mapRegion = new Region(
            this.window.gameRegion.left + 99,
            this.window.gameRegion.top + 27,
            830,
            579
        );
    }

    async init() {
        this.currentPosition = await this.getPosition();
        console.log('current position:', this.currentPosition);
    }

    async getPosition(retry = 0): Promise<string> {
        await this.tchat.sendChatText('%pos%');
        await sleep(200);
        const messages = await this.tchat.readChatText(false);
        const message = messages.filter(m => m.pseudo === process.env.PLAYER_NAME).at(-1);

        if (!message && retry < 3) {
            return this.getPosition(retry + 1);
        }

        return message?.text ?? process.exit(1);
    }

    async moveUp() {
        const region = new Region(429, 627, 869 - 429, 641 - 627);  // todo region
        const point = await randomPointIn(region);
        return this.changeMapTo(point);
    }

    async moveRight() {
        const region = new Region(429, 627, 869 - 429, 641 - 627); // todo region
        const point = await randomPointIn(region);
        return this.changeMapTo(point);
    }

    async moveDown() {
        const region = new Region(429, 627, 869 - 429, 641 - 627);
        const point = await randomPointIn(region);
        return this.changeMapTo(point);
    }

    async moveLeft() {
        const region = new Region(429, 627, 869 - 429, 641 - 627);  // todo region
        const point = await randomPointIn(region);
        return this.changeMapTo(point);
    }

    async changeMapTo(point: Point, retry = 0) {
        const randomPixelColors: { point: Point, color: string }[] = await Promise.all(
            Array.from({ length: 10 }, async () => {
                const point = await randomPointIn(this.mapRegion);
                const color = await getPixelColor(point);
                return { point, color };
            })
        );

        await mouse.move([point]);
        await mouse.click(Button.LEFT);
        await sleep(5000);

        let mapChanged = await this.detectMapChange(randomPixelColors);
        while (!mapChanged && retry <= 3) {
            mapChanged = await this.changeMapTo(point, retry + 1);
        }

        return mapChanged;
    }

    /**
     * Detect if the map has changed by comparing the pixel colors of the map
     */
    async detectMapChange(pixelColors: { point: Point, color: string }[], retry = 0): Promise<boolean> {
        if (retry > 0) await sleep(1000);
        let confidence = 0;

        await Promise.all(pixelColors.map(async (pixelColor) => {
            const newColor = await getPixelColor(pixelColor.point);
            if (!isSameHexColor(pixelColor.color, newColor, 5)) {
                confidence++;
            }
        }));

        if (confidence >= 9) return true;
        else if (retry > 3) {
            // if pixel detection failed, check position with tchat command
            const pos = await this.getPosition();
            if (pos !== this.currentPosition) {
                this.currentPosition = pos;
                return true;
            } else return false;
        }
        else return this.detectMapChange(pixelColors, retry + 1);
    }
}

