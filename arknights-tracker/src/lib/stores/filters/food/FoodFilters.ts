import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
import type { Rarity } from "$lib/classes/Rarity";

export interface FoodFilters {
    [FoodFieldComparatorName.RARITY]: IFilterSelector<IFood, Rarity>;
    [FoodFieldComparatorName.BUFF]: IFilterSelector<IFood>;
    [FoodFieldComparatorName.EQUIP_COND]: IFilterSelector<IFood, EquipableItemConditionType | "null">;
    [FoodFieldComparatorName.TARGET_TYPE]: IFilterSelector<IFood, UsableTargetType>;
}