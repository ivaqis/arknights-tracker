import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IFullBottle extends IItem {
    get emptyBottle(): IItem;
    get liquid(): IItem;
}