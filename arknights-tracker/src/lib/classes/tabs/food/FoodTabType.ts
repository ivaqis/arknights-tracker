export enum FoodTabType {
    COMPARISON = "comparison",
    OVERVIEW = "overview",
}

export namespace FoodTabType {
    export function isFoodTabType(str: string): str is FoodTabType {
        return str === FoodTabType.COMPARISON
            || str === FoodTabType.OVERVIEW;
    }
}