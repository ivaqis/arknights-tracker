export class MiningFormula {
    _miner;
    _minableObj;

    constructor(miner, minableObj) {
        this._miner = miner;
        this._minableObj = minableObj;
    }

    get formulaType() {
        return "miningFormula";
    }

    get miner() {
        return this._miner;
    }

    get minerId() {
        return this._miner.id;
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
        return !!this._minableObj.consumeItem;
    }

    static getMiningFormula(miner, mineableItemId) {
        let mineableObj = miner.getMineableObj(mineableItemId);

        if (!mineableObj) return null;

        return new MiningFormula(miner, mineableObj)
    }
}