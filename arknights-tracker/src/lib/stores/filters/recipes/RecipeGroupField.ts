export type RecipeGroupField =
    | "itemGroups"
    | "itemTypes"
    | "events"
    | "rarity"
    | "itemMaterials"
    | "localeName";

export type RecipeGroupOption =
    | RecipeGroupField
    | "inherit_sort";