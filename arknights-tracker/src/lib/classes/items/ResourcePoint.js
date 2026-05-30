import {Item} from "$lib/classes/items/Item.js";
import {resourcePoints} from "$lib/data/items/resourcePoints.js";
import {itemId2ResourcePointId} from "$lib/data/items/itemMaps.js";

export class ResourcePoint {
    _resourcePointObj;

    constructor(resourcePointObj) {
        this._resourcePointObj = resourcePointObj;
    }

    get id() {
        return this._resourcePointObj.id;
    }

    get itemId() {
        return this._resourcePointObj.itemId;
    }

    get type() {
        return this._resourcePointObj.type;
    }

    get bgIconId() {
        switch (this.type) {
            case "mine": return "item_icon_bg_miner";
            case "liquid": return "item_icon_bg_liquid";

            default: return null;
        }
    }

    getItem() {
        return Item.getItem(this.itemId);
    }

    static getResourcePointFromItemId(itemId) {
        let resourcePointId = itemId2ResourcePointId[itemId];

        if (!resourcePointId) return null;

        return ResourcePoint.getResourcePoint(resourcePointId);
    }

    static getResourcePoint(resourcePointId) {
        let resourcePointObj = resourcePoints[resourcePointId];

        if (!resourcePointObj) return null;

        return new ResourcePoint(resourcePointObj)
    }

    static isResourcePoint(resourcePointId) {
        return resourcePoints.hasOwnProperty(resourcePointId);
    }

    static isItemResourcePoint(itemId) {
        return itemId2ResourcePointId.hasOwnProperty(itemId);
    }
}