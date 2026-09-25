import type { IComparator } from "$lib/classes/comparators/IComparator";
import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
import type { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { Rarity } from "$lib/classes/Rarity";

export interface IItemComparator extends IComparator<IItem> {
    get rarityComparator(): IFieldValueComparator<IItem, Rarity>;
    get groupComparator(): IFieldValueComparator<IItem, ItemGroup>;
    get typeComparator(): IFieldValueComparator<IItem, ItemType>;
    get materialComparator(): IFieldValueComparator<IItem, ItemMaterial | "nonMaterial">;
    get eventComparator(): IFieldValueComparator<IItem, string | "nonEvent">;
    get localeComparator(): ILocaleComparator<IItem>;
    setComparatorsOrder(order: ItemFieldComparatorName[]): void;
}