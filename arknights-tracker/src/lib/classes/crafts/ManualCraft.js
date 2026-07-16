import {manualCrafts} from "$lib/data/crafts/manualCrafts.js";

export class ManualCraft {
    _craftObj;

    constructor(craftObj) {
        this._craftObj = craftObj;
    }

    get formulaType() {
        return "manualCraft";
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

    static getManualCraft(formulaId) {
        let manualCraftObj = manualCrafts[formulaId];

        if (!manualCraftObj) return null;

        return new ManualCraft(manualCraftObj);
    }

    static isManualCraft(formulaId) {
        return manualCrafts.hasOwnProperty(formulaId);
    }
}