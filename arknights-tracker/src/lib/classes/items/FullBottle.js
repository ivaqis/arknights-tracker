import { Item } from "$lib/classes/items/Item.js";
import { fullBottles } from "$lib/data/items/fullBottles";

export class FullBottle extends Item {
    _fullBottleObj;

    constructor(item, fullBottleObj) {
        super(item);

        this._fullBottleObj = fullBottleObj;
    }

    get emptyBottleId() {
        return this._fullBottleObj.emptyBottleId;
    }

    get liquidId() {
        return this._fullBottleObj.liquidId;
    }

    get emptyBottleItem() {
        return Item.getItem(this.emptyBottleId)
    }

    get liquidItem() {
        return Item.getItem(this.liquidId)
    }

    static getFullBottle(itemId) {
        let item = Item.getItem(itemId);

        if (!item) return null;

        return FullBottle.getFullBottleFromItem(item);
    }

    static getFullBottleFromItem(item) {
        let fullBottleObj = fullBottles[item.id];

        if (!fullBottleObj) return null;

        return new FullBottle(item, fullBottleObj);
    }

    static isFullBottle(itemId) {
        return fullBottles.hasOwnProperty(itemId);
    }
}