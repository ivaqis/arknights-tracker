import {CraftSearchResult} from "$lib/classes/crafts/searchers/CraftSearchResult.js";

export class CraftSearcher {
    _craftItemAsIncomeMap;
    _craftItemAsOutcomeMap;

    constructor({craftItemAsIncomeMap, craftItemAsOutcomeMap}) {
        this._craftItemAsIncomeMap = craftItemAsIncomeMap;
        this._craftItemAsOutcomeMap = craftItemAsOutcomeMap;
    }

    searchByItemAsIncome(itemId) {
        let craftList = this._craftItemAsIncomeMap[itemId] ?? [];

        return new CraftSearchResult({
            craftList: craftList,
        });
    }

    searchByItemAsOutcome(itemId) {
        let craftList = this._craftItemAsOutcomeMap[itemId] ?? [];

        return new CraftSearchResult({
            craftList: craftList,
        });
    }

    searchByItemAsBoth(itemId) {
        let income = this._craftItemAsIncomeMap[itemId] ?? [];
        let outcome = this._craftItemAsOutcomeMap[itemId] ?? [];

        let craftList = [...income, ...outcome];

        return new CraftSearchResult({
            craftList: craftList,
        });
    }
}