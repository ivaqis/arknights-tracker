import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IMineable } from "$lib/classes/gameData/buildings/miners/IMineable";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";

export interface IMiner extends IBuilding {
    get mineableList(): readonly IMineable[];
    isMineable(itemId: string): boolean;
    getMineableData(itemId: string): IMineable | null;

    getRecipe(mineableItemId: string): IMinerRecipe | null;
}