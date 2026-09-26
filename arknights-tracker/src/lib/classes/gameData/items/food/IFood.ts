import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IFood extends IItem {
    get duration(): number;
    get buffs(): readonly IFoodBuff[];

    getBuff(buffId: string): IFoodBuff | null;
    hasBuff(buffId: string): boolean;
}