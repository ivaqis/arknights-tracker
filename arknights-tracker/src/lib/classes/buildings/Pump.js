import {Building} from "$lib/classes/buildings/Building.js";
import {pumps} from "$lib/data/buildings/pumps.js";
import {PumpingFormula} from "$lib/classes/crafts/PumpingFormula.js";
import {ResourcePoint} from "$lib/classes/items/ResourcePoint.js";

export class Pump extends Building {
    _pumpObj;

    constructor(building, pumpObj) {
        super(building);

        this._pumpObj = pumpObj;
    }

    get pumpTimeMs() {
        return this._pumpObj.pumpTimeMs;
    }

    get enableLiquidIds() {
        return this._pumpObj.enableLiquidIds
            .filter((itemId) => ResourcePoint.isItemResourcePoint(itemId));
    }

    isLiquidEnable(liquidId) {
        return this.enableLiquidIds.includes(liquidId);
    }

    getPumpingFormula(liquidId) {
        if (!this.isLiquidEnable(liquidId)) return null;
        if (!ResourcePoint.isItemResourcePoint(liquidId)) return null;

        return new PumpingFormula(this, liquidId);
    }

    static getPump(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return Pump.getPumpFromBuilding(building);
    }

    static getPumpFromBuilding(building) {
        let pumpObj = pumps[building.id];

        if (!pumpObj) return null;

        return new Pump(building, pumpObj);
    }

    static isPump(buildingId) {
        return pumps.hasOwnProperty(buildingId);
    }
}