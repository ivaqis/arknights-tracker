import {items} from "$lib/data/items/items.js";
import {Fuel} from "$lib/classes/items/Fuel.js";
import {FullBottle} from "$lib/classes/items/FullBottle.js";
import {Building} from "$lib/classes/buildings/Building.js";

export class Item {
    _itemObj;

    constructor(itemObj) {
        this._itemObj = itemObj instanceof Item ?
            itemObj._itemObj :
            itemObj;
    }

    get id() {
        return this._itemObj.id;
    }

    get rarity() {
        return this._itemObj.rarity;
    }

    get groupId() {
        return this._itemObj.groupId;
    }

    get iconId() {
        return this._itemObj.iconId;
    }

    isFuel() {
        return Fuel.isFuel(this.id);
    }

    toFuel() {
        return Fuel.getFuelFromItem(this);
    }

    isFullBottle() {
        return FullBottle.isFullBottle(this.id);
    }

    toFullBottle() {
        return FullBottle.getFullBottleFromItem(this);
    }

    isBuilding() {
        return Building.isItemBuilding(this.id);
    }

    toBuilding() {
        return Building.getBuildingFromItemId(this.id)
    }

    static getItem(itemId) {
        let itemObj = items[itemId];

        if (!itemObj) return null;

        return new Item(itemObj);
    }

    static itemExists(itemId) {
        return items.hasOwnProperty(itemId);
    }
}
