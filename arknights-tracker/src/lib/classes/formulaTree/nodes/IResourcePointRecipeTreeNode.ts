import type { IRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IRecipeTreeNode";
import type { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export interface IResourcePointRecipeTreeNode extends IRecipeTreeNode<RecipeTreeNodeType.RESOURCE_POINT> {
    get resourcePoint(): IResourcePoint;
}