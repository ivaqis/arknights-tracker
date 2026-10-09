export type FoodGroupField =
    | "rarity"
    | "buff"
    | "equipCond"
    | "targetType"
    | "locale";

export type FoodGroupOption =
    | FoodGroupField
    | "inherit_sort";