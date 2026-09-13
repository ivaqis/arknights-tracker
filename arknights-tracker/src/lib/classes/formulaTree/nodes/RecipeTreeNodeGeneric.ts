import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { IResourcePointRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IResourcePointRecipeTreeNode";

export type RecipeTreeNodeGeneric =
    | IItemRecipeTreeNode
    | IResourcePointRecipeTreeNode;