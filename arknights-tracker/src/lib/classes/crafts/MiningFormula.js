export class MiningFormula {
    _minerId;
    _minableObj;

    constructor(minerId, minableObj) {
        this._minerId = minerId;
        this._minableObj = minableObj;
    }

    get minerId() {
        return this._minerId;
    }

    get miningItemId() {
        return this._minableObj.miningItemId;
    }

    get miningTimeMs() {
        return this._minableObj.miningTimeMs;
    }

    get consumeItemId() {
        return this._minableObj.consumeItem?.itemId;
    }

    get consumeItemCount() {
        return this._minableObj.consumeItem?.count;
    }

    hasConsumeItem() {
        return this._minableObj.hasOwnProperty("consumeItem");
    }
}