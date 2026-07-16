import { IComparator } from "$lib/classes/comparators/IComparator.js";

export class FieldComparator extends IComparator {
    _getValueFunc;
    _valueOrders;

    constructor(getValueFunc) {
        super();

        this._getValueFunc = getValueFunc;
    }

    get getValueFunc() {
        return this._getValueFunc;
    }

    set getValueFunc(func) {
        this._getValueFunc = func;
    }

    /**
     * Sets values order. To set order for values that not in list, use empty string ("")
     * @param {string[]} valueList
     */
    setValueOrder(valueList) {
        this._setValueOrders(valueList);
    }

    compare(objA, objB) {
        let orderA = this._getObjectOrder(objA);
        let orderB = this._getObjectOrder(objB);

        return orderA - orderB;
    }

    _clearValueOrders() {
        this._valueOrders = {};
    }

    _setValueOrders(valueOrderList) {
        this._clearValueOrders();

        for (let i = 0; i < valueOrderList.length; i++) {
            this._valueOrders[valueOrderList[i]] = i;
        }
    }

    _getValueOrder(value) {
        return this._valueOrders[value] ?? +Infinity;
    }

    _getObjectOrder(obj) {
        return this._getValueOrder(this._getValueFunc?.(obj) ?? "");
    }
}