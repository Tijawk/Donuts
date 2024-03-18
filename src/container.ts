import { DofusWindow } from "./dofus-window";
import { Inventory } from "./inventory";
import { Player } from "./player";
import { Tchat } from "./tchat";
import { WorldMap } from "./world-map";

class Container {
    services = new Map();

    async getDofusWindow(): Promise<DofusWindow> {
        if (!this.services.has('DofusWindow')) {
            const dofusWindow = new DofusWindow();
            await dofusWindow.init();
            this.services.set('DofusWindow', dofusWindow);
        }

        return this.services.get('dofusWindow');
    }

    async getTchat(): Promise<Tchat> {
        if (!this.services.has('Tchat')) {
            const tchat = new Tchat();
            this.services.set('Tchat', tchat);
        }

        return this.services.get('Tchat');
    }

    async getInventory(): Promise<Inventory> {
        if (!this.services.has('Inventory')) {
            const dofusWindow = await this.getDofusWindow();
            const inventory = new Inventory(dofusWindow);
            this.services.set('Inventory', inventory);

        }

        return this.services.get('Inventory');
    }

    async getPlayer(): Promise<Player> {
        if (!this.services.has('Player')) {
            const tchat = await this.getTchat();
            const player = new Player(tchat);
            this.services.set('Player', player);
        }

        return this.services.get('Player');
    }

    async getWorldMap(): Promise<WorldMap> {
        if (!this.services.has('WorldMap')) {
            const dofusWindow = await this.getDofusWindow();
            const player = await this.getPlayer();
            const tchat = await this.getTchat();
            const worldMap = new WorldMap(dofusWindow, player, tchat);
            await worldMap.init();
            this.services.set('WorldMap', worldMap);
        }

        return this.services.get('WorldMap');
    }
}

export const container = new Container();