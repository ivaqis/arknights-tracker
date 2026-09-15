import type { IData } from "$lib/classes/IData";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export interface MachineCraftData extends IData, RecipeData {
    readonly formulaGroupId: string;
    readonly buildingId: string;
    readonly craftTimeMs: number;
}