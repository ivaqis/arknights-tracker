import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import { NaturalRecipe } from "$lib/classes/gameData/recipes/NaturalRecipe";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export class PumpRecipe extends NaturalRecipe<IPump, IItem, IItem> implements IPumpRecipe {

    public constructor(ingredients: IItemStack[], outcomes: IItemStack[], building: IPump, processTimeMs: number, resourcePoint: IResourcePoint) {
        super(ingredients, outcomes, building, processTimeMs, resourcePoint);
    }
}