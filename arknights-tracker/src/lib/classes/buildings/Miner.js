import { Building } from "$lib/classes/buildings/Building.js";
import { MiningFormula } from "$lib/classes/crafts/MiningFormula.js";
import { miners } from "$lib/data/buildings/miners";

export class Miner extends Building {
    _minerObj;

    constructor(building, minerObj) {
        super(building);

        this._minerObj = minerObj;
    }

    get mineableItemIds() {
        return Object.keys(this._minerObj.mineable);
    }

    isMineable(itemId) {
        return this._minerObj.mineable.hasOwnProperty(itemId);
    }

    getMineableObj(itemId) {
        let mineableObj = this._minerObj.mineable[itemId];

        if (!mineableObj) return null;

        return mineableObj;
    }

    getMiningFormula(itemId) {
        return MiningFormula.getMiningFormula(this, itemId);
    }

    static getMiner(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return Miner.getMinerFromBuilding(building);
    }

    static getMinerFromBuilding(building) {
        let minerObj = miners[building.id];

        if (!minerObj) return null;

        return new Miner(building, minerObj);
    }

    static isMiner(buildingId) {
        return miners.hasOwnProperty(buildingId);
    }
}