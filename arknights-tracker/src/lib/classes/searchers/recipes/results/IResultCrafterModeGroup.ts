import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";

export interface IResultCrafterModeGroup extends IResultBuildingGroup<ICrafter, IMachineCraft> {
    get mode(): ICrafterModeGroup;
}