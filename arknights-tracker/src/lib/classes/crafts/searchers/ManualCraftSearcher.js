import {CraftSearcher} from "$lib/classes/crafts/searchers/CraftSearcher.js";
import {manualCraftItemAsIncome, manualCraftItemAsOutcome} from "$lib/data/crafts/craftMaps.js";

export class ManualCraftSearcher extends CraftSearcher {

    constructor({
                    craftItemAsIncomeMap = manualCraftItemAsIncome,
                    craftItemAsOutcomeMap = manualCraftItemAsOutcome
                }) {
        super({craftItemAsIncomeMap, craftItemAsOutcomeMap});
    }
}