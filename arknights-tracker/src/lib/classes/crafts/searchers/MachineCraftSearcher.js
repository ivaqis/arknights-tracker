import { Crafter } from "$lib/classes/buildings/Crafter.js";
import { MachineCraft } from "$lib/classes/crafts/MachineCraft.js";
import { CraftSearcher } from "$lib/classes/crafts/searchers/CraftSearcher.js";
import { MachineCraftSearchResult } from "$lib/classes/crafts/searchers/MachineCraftSearchResult.js";
import { machineCraftItemAsIncome, machineCraftItemAsOutcome } from "$lib/data/crafts/craftMaps.js";
import { machineCraftGroups } from "$lib/data/crafts/machineCraftGroups.js";

export class MachineCraftSearcher extends CraftSearcher {

    constructor({
                    craftItemAsIncomeMap = machineCraftItemAsIncome,
                    craftItemAsOutcomeMap = machineCraftItemAsOutcome,
                } = {}) {
        super({ craftItemAsIncomeMap, craftItemAsOutcomeMap });
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
        let otherFormulaIdList = [];
        let dismantlerFormulaIdList = [];
        let purifierFormulaIdList = [];
        let furnaceIdList = [];

        for (let formulaId of formulaIdList) {
            let formula = MachineCraft.getMachineCraft(formulaId);
            let crafterId = formula.crafterId;
            let crafterMode = Crafter.getCrafter(crafterId)
                .getModeNameByGroupId(formula.formulaGroupId);

            if (crafterId === "dismantler_1") dismantlerFormulaIdList.push(formulaId);
            else if (crafterId === "liquid_purifier_1") purifierFormulaIdList.push(formulaId);
            else if (crafterId === "furnance_1") furnaceIdList.push(formulaId);
            else otherFormulaIdList.push(formulaId);

            if (!result.hasOwnProperty(crafterId))
                result[crafterId] = {};
            if (!result[crafterId].hasOwnProperty(crafterMode))
                result[crafterId][crafterMode] = [];

            result[crafterId][crafterMode].push(formulaId);
        }

        let purifierResult = result.liquid_purifier_1;
        if (purifierResult) {
            delete result.liquid_purifier_1;
            result.liquid_purifier_1 = purifierResult;
        }

        let dismantlerResult = result.dismantler_1;
        if (dismantlerResult) {
            delete result.dismantler_1;
            result.dismantler_1 = dismantlerResult;
        }

        let furnaceResult = result.furnance_1;
        if (furnaceResult) {
            delete result.furnance_1;
            result = { furnance_1: furnaceResult, ...result };
        }

        return new MachineCraftSearchResult({
            craftList: [...furnaceIdList, ...otherFormulaIdList, ...purifierFormulaIdList, ...dismantlerFormulaIdList],
            resultMap: result
        });
    }
}