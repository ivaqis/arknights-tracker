import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import { NaturalRecipe } from "$lib/classes/gameData/recipes/NaturalRecipe";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export class MinerRecipe extends NaturalRecipe<IMiner, IItem, IItem> implements IMinerRecipe {

    public constructor(ingredients: IItemStack<IItem>[], outcomes: IItemStack<IItem>[], building: IMiner, processTimeMs: number, resourcePoint: IResourcePoint) {
        super(ingredients, outcomes, building, processTimeMs, resourcePoint);
    }
}