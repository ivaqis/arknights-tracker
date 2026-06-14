import { FieldComparator } from "$lib/classes/comparators/FieldComparator.js";
import { IComparator } from "$lib/classes/comparators/IComparator.js";
import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator.js";
import { FullBottle } from "$lib/classes/items/FullBottle.js";
import { Item } from "$lib/classes/items/Item.js";

export class ItemComparator {
    /**
     * @type {IComparator[]}
     * @private
     */
    _comparatorsOrder = [];

    _rarityComparator;
    _groupComparator;
    _typeComparator;
    _materialComparator;
    _eventComparator;
    _localeComparator;

    constructor({
                    rarityComparator = new FieldComparator((item) => item.rarity),
                    groupComparator = new FieldComparator((item) => item.groupId),
                    typeComparator = new FieldComparator((item) => item.type),
                    materialComparator = new FieldComparator(ItemComparator._getMaterial),
                    eventComparator = new FieldComparator((item) => item.getEventIds()?.[0] ?? ""),
                    localeComparator = new LocaleComparator((item) => item.id)
    } = {}) {
        this._rarityComparator = rarityComparator;
        this._groupComparator = groupComparator;
        this._typeComparator = typeComparator;
        this._materialComparator = materialComparator;
        this._eventComparator = eventComparator;
        this._localeComparator = localeComparator;
    }

    /**
     * @returns {FieldComparator}
     */
    get rarityComparator() {
        return this._rarityComparator;
    }

    /**
     * @returns {FieldComparator}
     */
    get groupComparator() {
        return this._groupComparator;
    }

    /**
     * @returns {FieldComparator}
     */
    get typeComparator() {
        return this._typeComparator;
    }

    /**
     * @returns {FieldComparator}
     */
    get materialComparator() {
        return this._materialComparator;
    }

    /**
     * @returns {FieldComparator}
     */
    get eventComparator() {
        return this._eventComparator;
    }

    /**
     * @returns {LocaleComparator}
     */
    get localeComparator() {
        return this._localeComparator;
    }

    /**
     * @param {Item} itemA
     * @param {Item} itemB
     * @returns {number}
     */
    compareItems(itemA, itemB) {
        for (let comparator of this._comparatorsOrder) {
            let diff = comparator.compare(itemA, itemB);

            if (diff !== 0) {
                return diff;
            }

            if (comparator === this._materialComparator
                && FullBottle.isFullBottle(itemA.id)
                && FullBottle.isFullBottle(itemB.id)
            ) {
                let fullBottleA = FullBottle.getFullBottleFromItem(itemA);
                let fullBottleB = FullBottle.getFullBottleFromItem(itemB);

                diff = comparator.compare(fullBottleA.liquidItem, fullBottleB.liquidItem);

                if (diff !== 0) {
                    return diff;
                }
            }
        }

        return itemA.id.localeCompare(itemB.id);
    }

    /**
     * @param {string[]} comparatorNameList
     */
    setComparatorsOrder(comparatorNameList) {
        let comparatorsOrder = [];

        for (let name of comparatorNameList) {
            let comparator = this._getComparatorByName(name);

            if (!comparator) continue;

            comparatorsOrder.push(comparator);
        }

        this._comparatorsOrder = comparatorsOrder;
    }

    /**
     * Returns new sorted item list
     * @param {Item[]} itemList
     * @param {boolean} reverse
     */
    getSortedList(itemList, reverse = false) {
        let newItemList = [...itemList];

        this.sortList(newItemList, reverse);

        return newItemList;
    }

    /**
     * Sorts itemList in place
     * @param {Item[]} itemList
     * @param {boolean} reverse
     */
    sortList(itemList, reverse = false) {
        itemList.sort((a, b) => {
            let diff = this.compareItems(a, b);

            return reverse ? -diff : diff;
        });
    }

    _getComparatorByName(comparatorName) {
        switch (comparatorName) {
            case "rarity": return this._rarityComparator;
            case "itemGroups": return this._groupComparator;
            case "itemTypes": return this._typeComparator;
            case "itemMaterials": return this._materialComparator;
            case "localeName": return this._localeComparator;
            default: return null;
        }
    }

    static _getMaterial(item) {
        let fullBottle = FullBottle.getFullBottleFromItem(item);

        if (fullBottle) {
            return fullBottle.emptyBottleItem.material;
        }

        return item.material;
    }
}