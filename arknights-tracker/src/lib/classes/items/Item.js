import {items} from "$lib/data/items/items.js";
import {Building} from "$lib/classes/buildings/Building.js";
import {itemId2EventId} from "$lib/data/items/itemMaps.js";

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

    get type() {
        return this._itemObj.type;
    }

    get material() {
        return this._itemObj.material;
    }

    get iconId() {
        return this._itemObj.iconId;
    }

    isBuilding() {
        return Building.isItemBuilding(this.id);
    }

    toBuilding() {
        return Building.getBuildingFromItemId(this.id)
    }

    getEventIds() {
        return itemId2EventId[this.id];
    }

    isEventItem() {
        return itemId2EventId.hasOwnProperty(this.id);
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
