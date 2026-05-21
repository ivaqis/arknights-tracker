import {Building} from "$lib/classes/buildings/Building.js";
import {crafters} from "$lib/data/buildings/crafters.js";

export class Crafter extends Building {
    _crafterObj;

    constructor(building, crafterObj) {
        super(building);

        this._crafterObj = crafterObj;
    }

    get modeList() {
        return this._crafterObj.modeMap;
    }

    get modeNameList() {
        return this.modeList
            .map((mode) => mode.modeName);
    }

    get groupIdList() {
        return this.modeList
            .map((mode) => mode.formulaGroupId);
    }

    hasMode(modeName) {
        return this.modeList
            .some((mode) => mode.modeName === modeName);
    }

    getModeNameByGroupId(groupId) {
        return this.modeList
            .find((mode) => mode.formulaGroupId === groupId)
            ?.modeName ?? null;
    }

    hasGroup(groupId) {
        return this.modeList
            .some((mode) => mode.formulaGroupId === groupId);
    }

    getGroupIdByModeName(modeName) {
        return this.modeList
            .find((mode) => mode.modeName === modeName)
            ?.formulaGroupId;
    }

    static getCrafter(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return Crafter.getCrafterFromBuilding(building);
    }

    static getCrafterFromBuilding(building) {
        let crafterObj = crafters[building.id];

        if (!crafterObj) return null;

        return new Crafter(building._buildingObj)
    }

    static isCrafter(buildingId) {
        return crafters.hasOwnProperty(buildingId);
    }
}