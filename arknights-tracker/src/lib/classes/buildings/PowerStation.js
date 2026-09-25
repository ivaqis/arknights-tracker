import { Building } from "$lib/classes/buildings/Building.js";
import { powerStations } from "$lib/data/buildings/powerStations";
import { fuel } from "$lib/data/items/fuel";

export class PowerStation extends Building {
    _powerStationObj;

    constructor(building, powerStationObj) {
        super(building);

        this._powerStationObj = powerStationObj;
    }

    get msPerRound() {
        return this._powerStationObj.msPerRound;
    }

    get enableFuelIds() {
        return Object.keys(fuel);
    }

    static getPowerStation(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return PowerStation.getPowerStationFromBuilding(building);
    }

    static getPowerStationFromBuilding(building) {
        let powerStationObj = powerStations[building.id];

        if (!powerStationObj) return null;

        return new PowerStation(building, powerStationObj);
    }

    static isPowerStation(buildingId) {
        return powerStations.hasOwnProperty(buildingId);
    }
}