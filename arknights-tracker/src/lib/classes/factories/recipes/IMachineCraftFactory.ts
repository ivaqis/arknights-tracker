import type { IRecipeFactory } from "$lib/classes/factories/recipes/IRecipeFactory";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { MachineCraftData } from "$lib/data/types/crafts/MachineCraftData";

export interface IMachineCraftFactory extends IRecipeFactory<MachineCraftData, IMachineCraft> {}