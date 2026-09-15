import type { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";

export function getRecipeTreeLinkParameters(itemId: string, formula: any): string | null {
    if (!formula) {
        return `itemId=${itemId}`;
    }

    let formulaType = formula.formulaType;

    if (formulaType === "machineCraft" || formulaType === "manualCraft" || formulaType === "hubCraft") {
        return `itemId=${itemId}&type=${formulaType}&formulaId=${formula.id}`;
    }
    if (formulaType === "miningFormula") {
        return `itemId=${itemId}&type=${formulaType}&buildingId=${formula.minerId}`;
    }
    if (formulaType === "pumpingFormula") {
        return `itemId=${itemId}&type=${formulaType}&buildingId=${formula.pumpId}`;
    }

    return null;
}

export function getRecipeTreeUrlItem(itemId: string): string {
    return `/recipes/tree?itemId=${itemId}`;
}

export function getRecipeTreeUrlCraft(recipeType: RecipeType.Craft, itemId: string, recipeId: string): string {
    return `/recipes/tree?itemId=${itemId}&type=${recipeType}&formulaId=${recipeId}`;
}

export function getRecipeTreeUrlBuilding(recipeType: RecipeType.Building, itemId: string, buildingId: string) {
    return `/recipes/tree?itemId=${itemId}&type=${recipeType}&buildingId=${buildingId}`;
}