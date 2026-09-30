import { FieldManyValuesComparator } from "$lib/classes/comparators/FieldManyValuesComparator";
import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator";
import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import type { IFoodComparator } from "$lib/classes/comparators/items/IFoodComparator";
import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator";
import { type EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IUsableItem } from "$lib/classes/gameData/items/usable/IUsableItem";
import type { Rarity } from "$lib/classes/Rarity";

export class FoodComparator implements IFoodComparator {
    private readonly _rarityComparator: IFieldValueComparator<IItem, Rarity>;
    private readonly _buffComparator: IFieldValueComparator<IFood>;
    private readonly _equipCondComparator: IFieldValueComparator<IUsableItem, EquipableItemConditionType | "null">;
    private readonly _localeComparator: ILocaleComparator<IItem>;

    private _comparatorOrder: IComparator<IFood>[] = [];

    public constructor(getItemNameFn: (item: IItem) => string) {
        this._rarityComparator = new FieldValueComparator(item => item.rarity);
        this._buffComparator = new FieldManyValuesComparator(food => food.buffs.map(buff => buff.buffId));
        this._equipCondComparator = new FieldValueComparator(food => food.tactical?.condType ?? "null");
        this._localeComparator = new LocaleComparator(item => getItemNameFn(item));
    }

    public get rarityComparator(): IFieldValueComparator<IItem, Rarity> {
        return this._rarityComparator;
    }

    public get buffComparator(): IFieldValueComparator<IFood> {
        return this._buffComparator;
    }

    public get equipCondComparator(): IFieldValueComparator<IFood, EquipableItemConditionType | "null"> {
        return this._equipCondComparator;
    }

    public get localeComparator(): ILocaleComparator<IItem> {
        return this._localeComparator;
    }

    public compare(a: IFood, b: IFood): number {
        for (const comparator of this._comparatorOrder) {
            let diff = comparator.compare(a, b);

            if (diff !== 0) {
                return diff;
            }
        }

        return a.gameId.localeCompare(b.gameId);
    }

    public setComparatorsOrder(order: readonly FoodFieldComparatorName[]): void {
        const comparators: IComparator<IFood>[] = [];

        for (const name of order) {
            const comparator = this.getComparatorByName(name);

            comparators.push(comparator);
        }

        this._comparatorOrder = comparators;
    }

    private getComparatorByName(name: FoodFieldComparatorName): IComparator<IFood> {
        switch (name) {
            case FoodFieldComparatorName.RARITY: return this._rarityComparator;
            case FoodFieldComparatorName.BUFF: return this._buffComparator;
            case FoodFieldComparatorName.EQUIP_COND: return this._equipCondComparator;
            case FoodFieldComparatorName.LOCALE: return this._localeComparator;
        }
    }
}