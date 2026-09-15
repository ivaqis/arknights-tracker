import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { Rarity } from "$lib/classes/Rarity";

export interface RecipeFilterValueMap {
    [ItemFieldComparatorName.ITEM_GROUP]: `${ItemGroup}`;
    [ItemFieldComparatorName.ITEM_TYPE]: `${ItemType}`;
    [ItemFieldComparatorName.ITEM_MATERIAL]: `${ItemMaterial}` | "nonMaterial";
    [ItemFieldComparatorName.RARITY]: Rarity;
    [ItemFieldComparatorName.EVENT]: string | "nonEvent";
}

export type RecipeFilterGroup = keyof RecipeFilterValueMap;

export type RecipeFilterValue<K extends RecipeFilterGroup> = RecipeFilterValueMap[K];