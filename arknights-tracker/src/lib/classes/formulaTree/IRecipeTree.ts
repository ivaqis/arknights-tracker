import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IRecipeTree {
    get startNode(): IItemRecipeTreeNode | null;
    get maxLayer(): number;
    get maxStage(): number;

    setStartNode(item: IItem, recipe?: NodeRecipeGeneric | null): void;
    setRecipe(node: IItemRecipeTreeNode, recipe: NodeRecipeGeneric): IItemRecipeTreeNode;
    updateNode(startNode: IItemRecipeTreeNode): void;
    updateItemList(): void;
    updateNodePositions(): void;

    getIterator(): Generator<RecipeTreeNodeGeneric, void, unknown>;
}