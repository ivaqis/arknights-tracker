import { Building } from "$lib/classes/buildings/Building.js";
import { GasMiningFormula } from "$lib/classes/crafts/GasMiningFormula.js";
import { gasMiners } from "$lib/data/buildings/gasMiners.js";

export class GasMiner extends Building {
    _gasMinerObj;

    constructor(building, gasMinerObj) {
        super(building);

        this._gasMinerObj = gasMinerObj;
    }

    get mineableItemIds() {
        return Object.keys(this._gasMinerObj.mineable);
    }

    isMineable(itemId) {
        return this._gasMinerObj.mineable.hasOwnProperty(itemId);
    }

    getMineableObj(itemId) {
        let mineable = this._gasMinerObj.mineable[itemId];

        if (!mineable) return null;

        return mineable;
    }

    getMiningFormula(itemId) {
        let mineable = this.getMineableObj(itemId);

        if (!mineable) return null;

        return new GasMiningFormula(this, mineable);
    }

    static getGasMiner(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return this.getGasMinerFromBuilding(building);
    }

    static getGasMinerFromBuilding(building) {
        let obj = gasMiners[building.id];

        if (!obj) return null;

        return new GasMiner(building, obj);
    }

    static isGasMiner(buildingId) {
        return gasMiners.hasOwnProperty(buildingId);
    }
}