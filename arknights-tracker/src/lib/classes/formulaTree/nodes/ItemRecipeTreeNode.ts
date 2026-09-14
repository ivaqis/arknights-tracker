import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
import { RecipeTreeNode } from "$lib/classes/formulaTree/nodes/RecipeTreeNode";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export class ItemRecipeTreeNode
    extends RecipeTreeNode<RecipeTreeNodeType.ITEM>
    implements IItemRecipeTreeNode {

    private readonly _item: IItem;
    private readonly _recipe: NodeRecipeGeneric | null;

    public constructor(parent: IItemRecipeTreeNode | null, item: IItem, recipe: NodeRecipeGeneric | null) {
        super(parent);
        this._item = item;
        this._recipe = recipe;
    }

    public get type(): RecipeTreeNodeType.ITEM {
        return RecipeTreeNodeType.ITEM;
    }

    protected getNode(): RecipeTreeNodeGeneric & RecipeTreeNode {
        return this;
    }

    public get item(): IItem {
        return this._item;
    }

    public get recipe(): NodeRecipeGeneric | null {
        return this._recipe;
    }
}