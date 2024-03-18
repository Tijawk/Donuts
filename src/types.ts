import { Point } from '@nut-tree/nut-js';

export type MapId = number;
export type CellId = number;
export type Direction = "up" | "right" | "down" | "left" | CellId | Point;

export type MapPosition = {x: number, y: number};
export type ChatMessage = {
    pseudo: string;
    text: string;
    date: string;
}