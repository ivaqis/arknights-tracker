import { Item } from "$lib/classes/items/Item.js";
import { fuel } from "$lib/data/items/fuel";

export class Fuel extends Item {
    _fuelObj;

    constructor(item, fuelObj) {
        super(item);

        this._fuelObj = fuelObj;
    }

    get powerProvide() {
        return this._fuelObj.powerProvide;
    }

    get progressRound() {
        return this._fuelObj.progressRound;
    }

    static getFuel(itemId) {
        let item = Item.getItem(itemId);

        if (!item) return null;

        return Fuel.getFuelFromItem(item);
    }

    static getFuelFromItem(item) {
        let fuelObj = fuel[item.id];

        if (!fuelObj) return null;

        return new Fuel(item, fuelObj);
    }

    static isFuel(itemId) {
        return fuel.hasOwnProperty(itemId);
    }
}