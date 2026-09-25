import type { IRecipeFactory } from "$lib/classes/factories/recipes/IRecipeFactory";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import type { ManualCraftData } from "$lib/data/types/crafts/ManualCraftData";

export interface IManualCraftFactory extends IRecipeFactory<ManualCraftData, IManualCraft> {}