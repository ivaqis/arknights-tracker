export enum RecipeType {
    MANUAL = "manualCraft",
    HUB = "hubCraft",
    MACHINE = "machineCraft",
    MINING = "miningFormula",
    GAS_MINING = "gasMiningFormula",
    PUMPING = "pumpingFormula"
}

export namespace RecipeType {
    export type Craft =
        | RecipeType.MANUAL
        | RecipeType.HUB
        | RecipeType.MACHINE;

    export type Building =
        | RecipeType.MINING
        | RecipeType.GAS_MINING
        | RecipeType.PUMPING;

    export function isRecipeType(str: string): str is RecipeType {
        return str === RecipeType.MANUAL
            || str === RecipeType.HUB
            || str === RecipeType.MACHINE
            || str === RecipeType.MINING
            || str === RecipeType.GAS_MINING
            || str === RecipeType.PUMPING;
    }

    export function isCraftRecipeType(recipeType: RecipeType): recipeType is RecipeType.Craft {
        return recipeType === RecipeType.MANUAL
            || recipeType === RecipeType.HUB
            || recipeType === RecipeType.MACHINE;
    }

    export function isBuildingRecipeType(recipeType: RecipeType): recipeType is RecipeType.Building {
        return recipeType === RecipeType.MINING
            || recipeType === RecipeType.GAS_MINING
            || recipeType === RecipeType.PUMPING;
    }
}