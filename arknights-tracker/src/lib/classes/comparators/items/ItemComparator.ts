import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator";
import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
import type { IItemComparator } from "$lib/classes/comparators/items/IItemComparator";
import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator";
import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { Rarity } from "$lib/classes/Rarity";
import type { IFactoryEventStorage } from "$lib/classes/storages/events/IFactoryEventStorage";
import type { IFullBottleStorage } from "$lib/classes/storages/items/IFullBottleStorage";
import type { IFullGasJarStorage } from "$lib/classes/storages/items/IFullGasJarStorage";
import { getMapByList } from "$lib/utils/collectionUtils";

export class ItemComparator implements IItemComparator {
    private readonly _rarityComparator: IFieldValueComparator<IItem, Rarity>;
    private readonly _groupComparator: IFieldValueComparator<IItem, ItemGroup>;
    private readonly _typeComparator: IFieldValueComparator<IItem, ItemType>;
    private readonly _materialComparator: IFieldValueComparator<IItem, ItemMaterial | "nonMaterial">;
    private readonly _eventComparator: IFieldValueComparator<IItem, string | "nonEvent">;
    private readonly _localeComparator: ILocaleComparator<IItem>;

    private readonly _itemIdToEventMap: Map<string, IFactoryEvent>;
    private readonly _fullBottleStorage: IFullBottleStorage;
    private readonly _fullJarStorage: IFullGasJarStorage;

    private _comparatorOrder: IComparator<IItem>[] = [];

    public constructor(factoryEventStorage: IFactoryEventStorage,
                       fullBottleStorage: IFullBottleStorage,
                       fullJarStorage: IFullGasJarStorage,
                       getItemNameFn: (item: IItem) => string
    ) {
        this._itemIdToEventMap = getMapByList(factoryEventStorage.list, event => event.eventItemIds);
        this._fullBottleStorage = fullBottleStorage;
        this._fullJarStorage = fullJarStorage;

        this._rarityComparator = new FieldValueComparator(item => item.rarity);
        this._groupComparator = new FieldValueComparator(item => item.groupId);
        this._typeComparator = new FieldValueComparator(item => item.type);
        this._materialComparator = new FieldValueComparator(item => item.material ?? "nonMaterial");
        this._eventComparator = new FieldValueComparator(item => this.getItemEventId(item));
        this._localeComparator = new LocaleComparator(item => getItemNameFn(item));
    }

    public get eventComparator(): IFieldValueComparator<IItem, string | "nonEvent"> {
        return this._eventComparator;
    }

    public get groupComparator(): IFieldValueComparator<IItem, ItemGroup> {
        return this._groupComparator;
    }

    public get localeComparator(): ILocaleComparator<IItem> {
        return this._localeComparator;
    }

    public get materialComparator(): IFieldValueComparator<IItem, ItemMaterial | "nonMaterial"> {
        return this._materialComparator;
    }

    public get rarityComparator(): IFieldValueComparator<IItem, Rarity> {
        return this._rarityComparator;
    }

    public get typeComparator(): IFieldValueComparator<IItem, ItemType> {
        return this._typeComparator;
    }

    public compare(a: IItem, b: IItem): number {
        for (const comparator of this._comparatorOrder) {
            let diff = comparator.compare(a, b);

            if (diff !== 0) {
                return diff;
            }

            if (comparator === this._materialComparator) {
                diff = this.compareMaterialAsFullBottle(a, b);

                if (diff !== 0) {
                    return diff;
                }

                diff = this.compareMaterialAsFullJar(a, b);

                if (diff !== 0) {
                    return diff;
                }
            }
        }

        return a.gameId.localeCompare(b.gameId);
    }

    public setComparatorsOrder(order: ItemFieldComparatorName[]): void {
        const comparators: IComparator<IItem>[] = [];

        for (const name of order) {
            const comparator = this.getComparatorByName(name);

            comparators.push(comparator);
        }

        this._comparatorOrder = comparators;
    }

    private getComparatorByName(name: ItemFieldComparatorName): IComparator<IItem> {
        switch (name) {
            case ItemFieldComparatorName.RARITY:        return this._rarityComparator;
            case ItemFieldComparatorName.EVENT:         return this._eventComparator;
            case ItemFieldComparatorName.ITEM_GROUP:    return this._groupComparator;
            case ItemFieldComparatorName.ITEM_TYPE:     return this._typeComparator;
            case ItemFieldComparatorName.ITEM_MATERIAL: return this._materialComparator;
            case ItemFieldComparatorName.LOCALE_NAME:   return this._localeComparator;
        }
    }

    private compareMaterialAsFullBottle(a: IItem, b: IItem): number {
        const bottleA = this._fullBottleStorage.byGameId.get(a.gameId);
        const bottleB = this._fullBottleStorage.byGameId.get(b.gameId);

        if (!bottleA || !bottleB) {
            return 0;
        }

        return  this._materialComparator.compare(bottleA.liquid, bottleB.liquid);
    }

    private compareMaterialAsFullJar(a: IItem, b: IItem): number {
        const jarA = this._fullJarStorage.byGameId.get(a.gameId);
        const jarB = this._fullJarStorage.byGameId.get(b.gameId);

        if (!jarA || !jarB) {
            return 0;
        }

        return this._materialComparator.compare(jarA.gas, jarB.gas);
    }

    private getItemEventId(item: IItem): string | "nonEvent" {
        return this._itemIdToEventMap.get(item.gameId)?.id
            ?? "nonEvent";
    }
}