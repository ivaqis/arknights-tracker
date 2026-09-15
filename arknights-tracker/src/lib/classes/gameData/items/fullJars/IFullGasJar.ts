import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IFullGasJar extends IItem {
    get emptyJar(): IItem;
    get gas(): IItem;
}