import type { IBoardable } from "$lib/classes/gameData/IBoardable";
import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
import type { IUsableItem } from "$lib/classes/gameData/items/usable/IUsableItem";

export interface IFood extends IUsableItem, IBoardable {
    get duration(): number;
    get buffs(): readonly IFoodBuff[];

    getBuff(buffId: string): IFoodBuff | null;
    hasBuff(buffId: string): boolean;
}