import { BuildingSearcher } from "$lib/classes/crafts/searchers/BuildingSearcher.js";
import { gasId2GasMinerId } from "$lib/data/crafts/craftMaps.js";

export class GasMinerSearcher extends BuildingSearcher {
    constructor({ itemId2BuildingIdMap = gasId2GasMinerId } = {}) {
        super({ itemId2BuildingIdMap });
    }

    searchByItemAsOutcome(itemId) {
        return this.searchByItem(itemId);
    }
}