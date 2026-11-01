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

export function getWeaponUrl(id: string, isSplitView = false, params?: Record<string, string | number | undefined>): string {
    if (!id) return "";
    const searchParams = new URLSearchParams();
    if (isSplitView) {
        searchParams.set("id", id);
    }
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== "") {
                searchParams.set(k, String(v));
            }
        }
    }
    const qStr = searchParams.toString();
    if (isSplitView) {
        return `/weapons?${qStr}`;
    }
    return `/weapons/${id}${qStr ? `?${qStr}` : ""}`;
}

export function getEquipmentUrl(id: string, isSplitView = false): string {
    if (!id) return "";
    return isSplitView ? `/equipment?id=${id}` : `/equipment/${id}`;
}

export function getEnemyUrl(id: string, isSplitView = false, params?: { variant?: string; level?: number | string }): string {
    if (!id) return "";
    const searchParams = new URLSearchParams();
    if (isSplitView) {
        searchParams.set("id", id);
    }
    if (params?.variant) searchParams.set("variant", params.variant);
    if (params?.level !== undefined && params?.level !== null && params?.level !== "") {
        searchParams.set("level", String(params.level));
    }
    const qStr = searchParams.toString();
    if (isSplitView) {
        return `/enemies?${qStr}`;
    }
    return `/enemies/${id}${qStr ? `?${qStr}` : ""}`;
}
