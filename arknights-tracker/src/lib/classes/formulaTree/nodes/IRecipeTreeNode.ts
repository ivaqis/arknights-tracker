import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import type { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";

export interface IRecipeTreeNode<T extends RecipeTreeNodeType> {
    get type(): T;
    get selfChildIndex(): number;
    set selfChildIndex(value: number);
    get layer(): number;
    set layer(value: number);
    get stage(): number;
    set stage(value: number);
    get parent(): IItemRecipeTreeNode | null;
    get children(): RecipeTreeNodeGeneric[];

    addChild(child: RecipeTreeNodeGeneric): void;
    resetChildren(): void;

    getIterator(): Generator<RecipeTreeNodeGeneric, void, unknown>;
}