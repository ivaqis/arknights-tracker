import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";
import { gasMinerStorage } from "$lib/dataStorages/buildings/gasMinerStorage";
import { minerStorage } from "$lib/dataStorages/buildings/minerStorage";
import { pumpStorage } from "$lib/dataStorages/buildings/pumpStorage";
import { hubCraftDataStorage } from "$lib/dataStorages/crafts/hubCraftDataStorage";
import { machineCraftDataStorage } from "$lib/dataStorages/crafts/machineCraftDataStorage";
import { manualCraftDataStorage } from "$lib/dataStorages/crafts/manualCraftDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
    const itemId = url.searchParams.get("itemId");

    if (!validateItemId(itemId)) {
        redirect(307, "/recipes");
    }

    const recipeType = url.searchParams.get("type");
    const buildingId = url.searchParams.get("buildingId");
    const recipeId = url.searchParams.get("formulaId");

    if (recipeType
        && (!RecipeType.isRecipeType(recipeType) || !validateRecipeParams(recipeType, recipeId, buildingId))
    ) {
        redirect(307, `/recipe/tree?itemId=${itemId}`);
    }

    return {
        itemId,
        recipeType: recipeType as RecipeType | null,
        buildingId,
        recipeId
    };
};

function validateItemId(itemId: string | null): boolean {
    if (!itemId) {
        return false;
    }

    return itemStorage.byGameId.has(itemId);
}

function validateRecipeParams(recipeType: RecipeType, recipeId: string | null, buildingId: string | null): boolean {
    if (!recipeId && !buildingId) {
        return false;
    }

    switch (recipeType) {
        case RecipeType.MACHINE:    return recipeId !== null && machineCraftDataStorage.byId.has(recipeId);
        case RecipeType.MANUAL:     return recipeId !== null && manualCraftDataStorage.byId.has(recipeId);
        case RecipeType.HUB:        return recipeId !== null && hubCraftDataStorage.byId.has(recipeId);
        case RecipeType.MINING:     return buildingId !== null && minerStorage.byGameId.has(buildingId);
        case RecipeType.GAS_MINING: return buildingId !== null && gasMinerStorage.byGameId.has(buildingId);
        case RecipeType.PUMPING:    return buildingId !== null && pumpStorage.byGameId.has(buildingId);
    }
}