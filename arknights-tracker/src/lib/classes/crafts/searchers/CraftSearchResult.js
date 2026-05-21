export class CraftSearchResult {
    _resultObj;

    constructor(resultObj) {
        this._resultObj = resultObj;
    }

    get craftList() {
        return this._resultObj.craftList;
    }

    hasCraft(formulaId) {
        return this.craftList.includes(formulaId);
    }

    isEmpty() {
        return this.craftList.length === 0;
    }
}