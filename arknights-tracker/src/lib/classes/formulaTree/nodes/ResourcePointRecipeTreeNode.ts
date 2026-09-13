import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { IResourcePointRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IResourcePointRecipeTreeNode";
import { RecipeTreeNode } from "$lib/classes/formulaTree/nodes/RecipeTreeNode";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export class ResourcePointRecipeTreeNode
    extends RecipeTreeNode<RecipeTreeNodeType.RESOURCE_POINT>
    implements IResourcePointRecipeTreeNode {

    private readonly _resourcePoint: IResourcePoint;

    public constructor(parent: IItemRecipeTreeNode | null, resourcePoint: IResourcePoint) {
        super(parent);

        this._resourcePoint = resourcePoint;
    }

    public get type(): RecipeTreeNodeType.RESOURCE_POINT {
        return RecipeTreeNodeType.RESOURCE_POINT;
    }

    protected getNode(): RecipeTreeNodeGeneric & RecipeTreeNode {
        return this;
    }

    public get resourcePoint(): IResourcePoint {
        return this._resourcePoint;
    }
}