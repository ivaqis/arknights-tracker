import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { Rarity } from "$lib/classes/Rarity";

export interface RecipeFilters {
    [ItemFieldComparatorName.ITEM_GROUP]: IFilterSelector<IItem, ItemGroup>;
    [ItemFieldComparatorName.ITEM_TYPE]: IFilterSelector<IItem, ItemType>;
    [ItemFieldComparatorName.ITEM_MATERIAL]: IFilterSelector<IItem, ItemMaterial | "nonMaterial">;
    [ItemFieldComparatorName.RARITY]: IFilterSelector<IItem, Rarity>;
    [ItemFieldComparatorName.EVENT]: IFilterSelector<IItem, string | "nonEvent">;
}