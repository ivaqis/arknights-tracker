import {CraftSearcher} from "$lib/classes/crafts/searchers/CraftSearcher.js";
import {hubCraftItemAsIncome, hubCraftItemAsOutcome} from "$lib/data/crafts/craftMaps.js";

export class HubCraftSearcher extends CraftSearcher {

    constructor({
                    craftItemAsIncomeMap = hubCraftItemAsIncome,
                    craftItemAsOutcomeMap = hubCraftItemAsOutcome
                }) {
        super({craftItemAsIncomeMap, craftItemAsOutcomeMap});
    }
}