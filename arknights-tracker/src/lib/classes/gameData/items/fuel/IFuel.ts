import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IFuel extends IItem {
    get powerProvide(): number;
    get progressRound(): number;
}