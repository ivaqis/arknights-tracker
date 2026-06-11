export class Comparator {
    _fieldName;
    _valueOrders;

    /**
     *
     * @param {string} fieldName
     */
    constructor(fieldName) {
        this._fieldName = fieldName;
    }

    /**
     *
     * @returns {string}
     */
    get fieldName() {
        return this._fieldName;
    }

    /**
     *
     * @param {string} fieldName
     */
    set fieldName(fieldName) {
        this._fieldName = fieldName;
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
        return this._getValueOrder(obj?.[this._fieldName] ?? "");
    }
}