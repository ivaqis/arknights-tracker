export class GasMiningFormula {
    _gasMiner;
    _mineableObj;


    constructor(gasMiner, mineableObj) {
        this._gasMiner = gasMiner;
        this._mineableObj = mineableObj;
    }

    get formulaType() {
        return "gasMiningFormula";
    }

    get gasMiner() {
        return this._gasMiner;
    }

    get gasMinerId() {
        return this._gasMiner.id;
    }

    get miningItemId() {
        return this._mineableObj.miningItemId;
    }

    get miningTimeMs() {
        return this._mineableObj.miningTimeMs;
    }

    get consumeItemId() {
        return this._mineableObj.consumeItem?.itemId;
    }

    get consumeItemCount() {
        return this._mineableObj.consumeItem?.count;
    }

    hasConsumeItem() {
        return !!this._mineableObj.consumeItem;
    }
}