import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { Rarity } from "$lib/classes/Rarity";

export interface FoodFilterValueMap {
    [FoodFieldComparatorName.RARITY]: Rarity;
    [FoodFieldComparatorName.BUFF]: string;
    [FoodFieldComparatorName.EQUIP_COND]: EquipableItemConditionType | "null";
}

export type FoodFilterGroup = keyof FoodFilterValueMap;

export type FoodFilterValue<K extends FoodFilterGroup> = FoodFilterValueMap[K];