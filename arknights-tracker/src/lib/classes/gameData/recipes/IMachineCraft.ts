import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";

export interface IMachineCraft extends IBuildingRecipe<ICrafter, IItem, IItem>, IGameData {
    get formulaGroup(): ICrafterModeGroup;
}