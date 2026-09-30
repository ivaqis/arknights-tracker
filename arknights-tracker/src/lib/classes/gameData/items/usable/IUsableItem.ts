import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";

export interface IUsableItem extends IItem {
    get tactical(): ITactical | null;
}