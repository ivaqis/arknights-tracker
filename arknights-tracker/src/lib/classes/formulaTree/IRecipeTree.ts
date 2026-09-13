import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IRecipeTree {
    get startNode(): RecipeTreeNodeGeneric | null;
    get maxLayer(): number;
    get maxStage(): number;

    setStartNode(item: IItem, recipe: NodeRecipeGeneric): void;
    updateNode(startNode: IItemRecipeTreeNode): void;
    updateItemList(): void;
    updateNodePositions(): void;

    getIterator(): Generator<RecipeTreeNodeGeneric, void, unknown>;
}