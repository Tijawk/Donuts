import { Point, Region, screen, sleep } from "@nut-tree/nut-js";
import { deltaE } from "color-delta-e";

export async function getPixelColor(point: Point): Promise<string> {
    const rgbColor = await screen.colorAt(point);
    const hexColor = rgbColor.toHex().substring(0, 7);
    return hexColor;
}

export function isSameHexColor(colorA: string, colorB: string, delta: number = 10): boolean {
    return deltaE(colorA, colorB) <= delta;
}

export async function isPixelColor(point: Point, searchHexColor: string, delta: number = 10): Promise<boolean> {
    if (!searchHexColor.startsWith('#')) searchHexColor = '#';

    return isSameHexColor(await getPixelColor(point), searchHexColor, delta);
}

export function getPointsFromRegion(region: Region): Point[] {
    const points = [];

    for (let x = region.left; x < region.left + region.width; x++) {
        for (let y = region.top; y < region.top + region.height; y++) {
            points.push(new Point(x, y));
        }
    }

    return points;
}

export async function countRegionColor(region: Region, colorHex: string, delta: number = 10): Promise<number> {
    let count = 0;
    const points = getPointsFromRegion(region);
    for (const point of points) {
        const isWriteColor = await isPixelColor(point, colorHex, delta);
        console.log(isWriteColor, point, colorHex, delta);
        if (isWriteColor) count++;
    }
    return count;
}

export async function randomSleep(min: number, max: number) {
    const sleepTime = Math.floor(Math.random() * (max - min + 1) + min);
    await sleep(sleepTime);
}
