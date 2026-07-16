import {hubCrafts} from "$lib/data/crafts/hubCrafts.js";

export class HubCraft {
    _craftObj;

    constructor(craftObj) {
        this._craftObj = craftObj;
    }

    get formulaType() {
        return "hubCraft";
    }

    get id() {
        return this._craftObj.id;
    }

    get ingredients() {
        return this._craftObj.ingredients;
    }

    get outcomes() {
        return this._craftObj.outcomes;
    }

    getIngredientItemIds() {
        return this.ingredients.map((obj) => obj.itemId)
    }

    getIngredientItemCount(itemId) {
        let result = this.ingredients.find((obj) => obj.itemId === itemId);

        return result ?? null;
    }

    getOutcomeItemIds() {
        return this.outcomes.map((obj) => obj.itemId);
    }

    getOutcomeItemCount(itemId) {
        let result = this.outcomes.find((obj) => obj.itemId === itemId);

        return result ?? null;
    }

    static getHubCraft(formulaId) {
        let craftObj = hubCrafts[formulaId];

        if (!craftObj) return null;

        return new HubCraft(craftObj);
    }

    static isHubCraft(formulaId) {
        return hubCrafts.hasOwnProperty(formulaId);
    }
}