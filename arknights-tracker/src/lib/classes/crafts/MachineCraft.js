import { Crafter } from "$lib/classes/buildings/Crafter.js";
import { machineCrafts } from "$lib/data/crafts/machineCrafts";

export class MachineCraft {
    _craftObj;

    constructor(craftObj) {
        this._craftObj = craftObj;
    }

    get formulaType() {
        return "machineCraft";
    }

    get id() {
        return this._craftObj.id;
    }

    get crafterId() {
        return this._craftObj.buildingId;
    }

    get formulaGroupId() {
        return this._craftObj.formulaGroupId;
    }

    get craftTimeMs() {
        return this._craftObj.craftTimeMs;
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

    getCrafter() {
        return Crafter.getCrafter(this.crafterId);
    }

    static getMachineCraft(formulaId) {
        let machineCraftObj = machineCrafts[formulaId];

        if (!machineCraftObj) return null;

        return new MachineCraft(machineCraftObj);
    }

    static isMachineCraft(formulaId) {
        return machineCrafts.hasOwnProperty(formulaId);
    }
}