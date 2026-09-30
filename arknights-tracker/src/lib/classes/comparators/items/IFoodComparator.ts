import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
import type { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IUsableItem } from "$lib/classes/gameData/items/usable/IUsableItem";
import type { Rarity } from "$lib/classes/Rarity";

export interface IFoodComparator extends IComparator<IFood> {
    get rarityComparator(): IFieldValueComparator<IItem, Rarity>;
    get buffComparator(): IFieldValueComparator<IFood>;
    get equipCondComparator(): IFieldValueComparator<IUsableItem, EquipableItemConditionType | "null">
    get localeComparator(): ILocaleComparator<IItem>;

    setComparatorsOrder(order: readonly FoodFieldComparatorName[]): void;
}