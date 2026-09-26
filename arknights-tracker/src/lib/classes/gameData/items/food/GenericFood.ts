import type { IEquipableFood } from "$lib/classes/gameData/items/equipable/IEquipableFood";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";

export type GenericFood =
    | IFood
    | IEquipableFood;