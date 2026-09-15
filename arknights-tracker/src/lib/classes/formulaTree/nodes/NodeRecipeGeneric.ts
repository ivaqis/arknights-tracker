import type { INodeRecipe } from "$lib/classes/formulaTree/nodes/INodeRecipe";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";

export type NodeRecipeGeneric =
    | INodeRecipe<RecipeType.MACHINE, IMachineCraft>
    | INodeRecipe<RecipeType.MANUAL, IManualCraft>
    | INodeRecipe<RecipeType.HUB, IManualCraft>
    | INodeRecipe<RecipeType.MINING, IMinerRecipe>
    | INodeRecipe<RecipeType.GAS_MINING, IMinerRecipe>
    | INodeRecipe<RecipeType.PUMPING, IPumpRecipe>;