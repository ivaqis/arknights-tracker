import {MachineCraft} from "$lib/classes/crafts/MachineCraft.js";
import {Crafter} from "$lib/classes/buildings/Crafter.js";
import {MachineCraftSearchResult} from "$lib/classes/crafts/searchers/MachineCraftSearchResult.js";
import {machineCraftItemAsIncome, machineCraftItemAsOutcome} from "$lib/data/crafts/craftMaps.js";
import {CraftSearcher} from "$lib/classes/crafts/searchers/CraftSearcher.js";
import {machineCraftGroups} from "$lib/data/crafts/machineCraftGroups.js";

export class MachineCraftSearcher extends CraftSearcher{

    constructor({
        craftItemAsIncomeMap = machineCraftItemAsIncome,
        craftItemAsOutcomeMap = machineCraftItemAsOutcome,
                } = {}) {
        super({craftItemAsIncomeMap, craftItemAsOutcomeMap});
    }

    searchByItemAsIncome(itemId) {
        let formulaIds = this._craftItemAsIncomeMap[itemId] ?? [];

        return this.searchByFormulaIds(formulaIds);
    }

    searchByItemAsOutcome(itemId) {
        let formulaIds = this._craftItemAsOutcomeMap[itemId] ?? [];

        return this.searchByFormulaIds(formulaIds);
    }

    searchByItemAsBoth(itemId) {
        let income = this._craftItemAsIncomeMap[itemId] ?? [];
        let outcome = this._craftItemAsOutcomeMap[itemId] ?? [];

        let formulaIds = [
            ...income,
            ...outcome
        ];

        return this.searchByFormulaIds(formulaIds);
    }

    searchByCrafter(crafterId) {
        let crafter = Crafter.getCrafter(crafterId);

        let groupIds = crafter?.groupIdList ?? [];
        let formulaIds = [];

        for (let groupId of groupIds) {
            let craftList = machineCraftGroups[groupId]?.craftList ?? [];

            formulaIds.push(...craftList);
        }

        return this.searchByFormulaIds(formulaIds);
    }

    searchByGroup(groupId) {
        let craftList = machineCraftGroups[groupId]?.craftList ?? [];

        return this.searchByFormulaIds(craftList);
    }

    searchByFormulaIds(formulaIdList) {
        let result = {};

        for (let formulaId of formulaIdList) {
            let formula = MachineCraft.getMachineCraft(formulaId);
            let crafterId = formula.crafterId;
            let crafterMode = Crafter.getCrafter(crafterId)
                .getModeNameByGroupId(formula.formulaGroupId);

            if (!result.hasOwnProperty(crafterId))
                result[crafterId] = {};
            if (!result[crafterId].hasOwnProperty(crafterMode))
                result[crafterId][crafterMode] = [];

            result[crafterId][crafterMode].push(formulaId);
        }

        return new MachineCraftSearchResult({
            craftList: formulaIdList,
            resultMap: result
        })
    }
}