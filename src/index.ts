import { screen } from "@nut-tree/nut-js";
import "dotenv/config";
import { container } from "./container";

(async function () {
    // const map = await getMap();
    const window = await container.getDofusWindow();
    console.log({
        height: await screen.height(),
        width: await screen.width()
    });
    console.log(window.gameRegion);
    // await window.player.inventory.open();
    // console.log('pods ' + await window.player.inventory.getPods() + '%');
    // await window.player.inventory.close();
    // console.log(await window.player.getMapPosition());    
    // console.log(await window.player.isFullLife() ? 'full life' : 'not full life');
    // const packetSniffer = new PacketSniffer(window.gameTitle);
    // const mapChanged = await map.moveDown();
    // console.log({mapChanged});
    // await packetSniffer.init();
})();

