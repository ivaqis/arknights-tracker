import {CraftSearchResult} from "$lib/classes/crafts/searchers/CraftSearchResult.js";

export class MachineCraftSearchResult extends CraftSearchResult {
    constructor(resultObj) {
        super(resultObj);
    }

    get resultMap() {
        return this._resultObj.resultMap;
    }

    getCrafterIdList() {
        return Object.keys(this.resultMap);
    }

    getCrafterModeList(crafterId) {
        return Object.keys(this.resultMap[crafterId]);
    }

    getCraftList(crafterId, modeName) {
        return this.resultMap[crafterId][modeName];
    }
}