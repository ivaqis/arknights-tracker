import { Item } from "$lib/classes/items/Item.js";
import { fullJars } from "$lib/data/items/fullJars.js";

export class FullGasJar extends Item {
    _fullGasJarObj;

    constructor(item, fullGasJarObj) {
        super(item);

        this._fullGasJarObj = fullGasJarObj;
    }

    get emptyJarId() {
        return this._fullGasJarObj.emptyJarId;
    }

    get gasId() {
        return this._fullGasJarObj.gasId;
    }

    get emptyJarItem() {
        return Item.getItem(this.emptyJarId);
    }

    get gasItem() {
        return Item.getItem(this.gasId);
    }

    static getFullGasJar(itemId) {
        let item = Item.getItem(itemId);

        if (!item) return null;

        return this.getFullGasJarFromItem(item);
    }

    static getFullGasJarFromItem(item) {
        let obj = fullJars[item.id];

        if (!obj) return null;

        return new FullGasJar(item, obj);
    }

    static isFullGasJar(itemId) {
        return fullJars.hasOwnProperty(itemId);
    }
}