import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IItemStack<T extends IItem = IItem> {
    get item(): T;
    get count(): number;
}