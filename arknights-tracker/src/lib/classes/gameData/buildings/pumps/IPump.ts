import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IEnableLiquid } from "$lib/classes/gameData/buildings/pumps/IEnableLiquid";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";

export interface IPump extends IBuilding {
    get pumpTimeMs(): number;
    get enableLiquids(): readonly IEnableLiquid[];
    getEnableLiquid(liquidId: string): IEnableLiquid | null;
    isLiquidEnable(liquidId: string): boolean;

    getRecipe(liquidId: string): IPumpRecipe | null;
}