import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { IRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IRecipeTreeNode";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import { type RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";

export abstract class RecipeTreeNode<T extends RecipeTreeNodeType = RecipeTreeNodeType> implements IRecipeTreeNode<T> {
    private readonly _parent: IItemRecipeTreeNode | null;

    private _children: RecipeTreeNodeGeneric[] = [];

    private _selfChildIndex: number = -1;
    private _layer: number = 0;
    private _stage: number = 0;

    protected constructor(parent: IItemRecipeTreeNode | null) {
        this._parent = parent;
    }

    public get children(): readonly RecipeTreeNodeGeneric[] {
        return this._children;
    }

    public get parent(): IItemRecipeTreeNode | null {
        return this._parent;
    }

    public get selfChildIndex(): number {
        return this._selfChildIndex;
    }

    public set selfChildIndex(value: number) {
        this._selfChildIndex = value;
    }

    public get layer(): number {
        return this._layer;
    }

    public set layer(value: number) {
        this._layer = value;
    }

    public get stage(): number {
        return this._stage;
    }

    public set stage(value: number) {
        this._stage = value;
    }

    public abstract get type(): T;

    public addChild(child: RecipeTreeNodeGeneric): void {
        this._children.push(child);
    }

    public resetChildren(): void {
        this._children = [];
    }

    public *getIterator(): Generator<RecipeTreeNodeGeneric, void, unknown> {
        const stack: RecipeTreeNodeGeneric[] = [this.getNode()];
    }

    protected abstract getNode(): RecipeTreeNodeGeneric;
}