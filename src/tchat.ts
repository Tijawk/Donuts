import { Button, Key, Region, clipboard, keyboard, mouse, randomPointIn, sleep, straightTo } from "@nut-tree/nut-js";
import { ChatMessage } from "./types";

export class Tchat {
    chatRegion: Region
    messages: ChatMessage[] = [];

    constructor() {
        this.chatRegion = new Region(
            95,
            650,
            230,
            50
        )
    }

    async openChat() {
        await keyboard.type(Key.Add);
    }

    async closeChat() {
        await keyboard.type(Key.Add);
        await keyboard.type(Key.Add);
    }

    async copyChatText() {
        await mouse.move(straightTo(randomPointIn(this.chatRegion)))
        await mouse.click(Button.RIGHT);
        await sleep(200);
        await keyboard.pressKey(Key.Enter);
        await sleep(200);
        await keyboard.pressKey(Key.LeftControl, Key.A);
        await keyboard.releaseKey(Key.LeftControl, Key.A);
        await sleep(200);
        await keyboard.pressKey(Key.LeftControl, Key.C);
        await keyboard.releaseKey(Key.LeftControl, Key.C);
    }

    messageAlreadyRead(message: ChatMessage) {
        return this.messages.filter(m =>
            m.date === message.date &&
            m.pseudo === message.pseudo &&
            m.text === message.text
        ).length > 0;
    }

    async readChatText(cache = true): Promise<ChatMessage[]> {
        await this.openChat();
        await sleep(200);
        await this.copyChatText();

        const content = await clipboard.getContent();

        const regex = /^\[(\d{2}:\d{2})\]\s*(?:(?:De\s+)?(\w+)\s*:\s*)?(.*)$/;
        const messages: ChatMessage[] = [];
        const now = new Date().toLocaleDateString();

        content.split('\n').forEach((message) => {
            message = message.replace(/\r/g, '');
            const match = message.match(regex);
            if (match) {
                const chatMessage = {
                    date: now + ' ' + match[1],
                    pseudo: match[2] || "",
                    text: match[3].trim()
                };

                // if message is not already in the list
                if (!this.messageAlreadyRead(chatMessage)) {
                    messages.push(chatMessage);
                }
            } else {
                console.log('no match', message);
            }
        });

        await this.closeChat();

        if (cache) this.messages.push(...messages);

        return messages;
    }

    async sendChatText(text: string) {
        // focus on chat input
        await keyboard.type(Key.Space);

        await keyboard.type(text);
        await keyboard.type(Key.Enter);

        // unfocus chat input
        await keyboard.type(Key.Escape);
    }
}

let tchat: Tchat | undefined = undefined;
export async function getTchat(): Promise<Tchat> {
    if (!tchat) {
        tchat = new Tchat();
    }

    return tchat;
}