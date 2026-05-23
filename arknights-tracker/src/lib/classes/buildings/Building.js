import {buildings} from "$lib/data/buildings/buildings.js";
import {itemId2BuildingId} from "$lib/data/buildings/itemId2BuildingId.js";
import {Crafter} from "$lib/classes/buildings/Crafter.js";
import {Miner} from "$lib/classes/buildings/Miner.js";
import {Pump} from "$lib/classes/buildings/Pump.js";
import {PowerStation} from "$lib/classes/buildings/PowerStation.js";

export class Building {
    _buildingObj;

    constructor(buildingObj) {
        this._buildingObj = buildingObj instanceof Building ?
            buildingObj._buildingObj :
            buildingObj;
    }

    get id() {
        return this._buildingObj.id;
    }

    get type() {
        return this._buildingObj.type;
    }

    get itemId() {
        return this._buildingObj.itemId;
    }

    get iconId() {
        return this._buildingObj.iconId;
    }

    isCrafter() {
        return this.type === "crafter";
    }

    isMiner() {
        return this.type === "miner";
    }

    isPump() {
        return this.type === "pump";
    }

    isPowerStation() {
        return this.type === "powerStation";
    }

    toCrafter() {
        return Crafter.getCrafterFromBuilding(this);
    }

    toMiner() {
        return Miner.getMinerFromBuilding(this);
    }

    toPump() {
        return Pump.getPumpFromBuilding(this);
    }

    toPowerStation() {
        return PowerStation.getPowerStationFromBuilding(this);
    }

    static getBuilding(buildingId) {
        let buildingObj = buildings[buildingId];

        if (!buildingObj) return null;

        return new Building(buildingObj);
    }

    static getBuildingFromItemId(itemId) {
        let buildingId = Building.getBuildingIdFromItemId(itemId);

        if (!buildingId) return null;

        return Building.getBuilding(buildingId);
    }

    static getBuildingIdFromItemId(itemId) {
        return itemId2BuildingId[itemId];
    }

    static isBuilding(buildingId) {
        return buildings.hasOwnProperty(buildingId);
    }

    static isItemBuilding(itemId) {
        return itemId2BuildingId.hasOwnProperty(itemId);
    }
}