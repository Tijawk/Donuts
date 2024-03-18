import { sleep } from "@nut-tree/nut-js";
import { Inventory } from "./inventory";
import { Tchat } from "./tchat";
import { container } from "./container";

export class Player {
    name: string;

    constructor(protected tchat: Tchat){
        this.name = process.env.PLAYER_NAME as string;
    }

    async getHealth(retry = 0): Promise<number> {

        await this.tchat.sendChatText('%hpp%');
        await sleep(200);
        const messages = await this.tchat.readChatText(false);
        const message = messages.filter(m => m.pseudo === this.name).at(-1);

        if (!message && retry < 3) {
            return this.getHealth(retry + 1);
        } else {
            const health = message?.text.replace('%', '') ?? 100;
            return +health;
        }
    }

    async isFullLife(): Promise<boolean> {
        return (await this.getHealth()) === 100;
    }

    async needMedic() {
        return (await this.getHealth()) < 50;
    }

    async isDead() {
        return false;
    }
}
