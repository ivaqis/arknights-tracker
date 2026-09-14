import type { IRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IRecipeTreeNode";
import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
import type { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IItemRecipeTreeNode extends IRecipeTreeNode<RecipeTreeNodeType.ITEM> {
    get item(): IItem;
    get recipe(): NodeRecipeGeneric | null;
}