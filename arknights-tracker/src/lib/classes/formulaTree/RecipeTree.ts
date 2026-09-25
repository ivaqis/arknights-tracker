import type { IRecipeTree } from "$lib/classes/formulaTree/IRecipeTree";
import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
import type { INodeRecipe } from "$lib/classes/formulaTree/nodes/INodeRecipe";
import { ItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/ItemRecipeTreeNode";
import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
import type { RecipeTreeNodeGeneric } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeGeneric";
import { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";
import { ResourcePointRecipeTreeNode } from "$lib/classes/formulaTree/nodes/ResourcePointRecipeTreeNode";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";
import type { IMachineCraftSearcher } from "$lib/classes/searchers/recipes/IMachineCraftSearcher";
import type { IManualCraftSearcher } from "$lib/classes/searchers/recipes/IManualCraftSearcher";
import type { IMinerRecipeSearcher } from "$lib/classes/searchers/recipes/IMinerRecipeSearcher";
import type { IPumpRecipeSearcher } from "$lib/classes/searchers/recipes/IPumpRecipeSearcher";
import type { DefaultCraftMap } from "$lib/data/types/crafts/DefaultCraftMap";

export class RecipeTree implements IRecipeTree {
    private readonly _machineCraftSearcher: IMachineCraftSearcher;
    private readonly _manualCraftSearcher: IManualCraftSearcher;
    private readonly _hubCraftSearcher: IManualCraftSearcher;
    private readonly _minerRecipeSearcher: IMinerRecipeSearcher;
    private readonly _gasMinerRecipeSearcher: IMinerRecipeSearcher;
    private readonly _pumpRecipeSearcher: IPumpRecipeSearcher;

    private readonly _defaultMachineCraftMap: DefaultCraftMap;
    private readonly _defaultManualCraftMap: DefaultCraftMap;
    private readonly _defaultHubCraftMap: DefaultCraftMap;

    private readonly _itemUsageMap: Map<string, number> = new Map();

    private _startNode: IItemRecipeTreeNode | null = null;
    private _maxLayer: number = 0;
    private _maxStage: number = 0;

    public constructor(machineCraftSearcher: IMachineCraftSearcher, manualCraftSearcher: IManualCraftSearcher, hubCraftSearcher: IManualCraftSearcher, minerRecipeSearcher: IMinerRecipeSearcher, gasMinerRecipeSearcher: IMinerRecipeSearcher, pumpRecipeSearcher: IPumpRecipeSearcher, defaultMachineCraftMap: DefaultCraftMap, defaultManualCraftMap: DefaultCraftMap, defaultHubCraftMap: DefaultCraftMap) {
        this._machineCraftSearcher = machineCraftSearcher;
        this._manualCraftSearcher = manualCraftSearcher;
        this._hubCraftSearcher = hubCraftSearcher;
        this._minerRecipeSearcher = minerRecipeSearcher;
        this._gasMinerRecipeSearcher = gasMinerRecipeSearcher;
        this._pumpRecipeSearcher = pumpRecipeSearcher;

        this._defaultMachineCraftMap = defaultMachineCraftMap;
        this._defaultManualCraftMap = defaultManualCraftMap;
        this._defaultHubCraftMap = defaultHubCraftMap;
    }

    public get maxLayer(): number {
        return this._maxLayer;
    }

    public get maxStage(): number {
        return this._maxStage;
    }

    public get startNode(): IItemRecipeTreeNode | null {
        return this._startNode;
    }

    public setStartNode(item: IItem, recipe?: NodeRecipeGeneric | null): void {
        if (!recipe) {
            recipe = this.getNodeRecipe(item);
        }

        this._startNode = new ItemRecipeTreeNode(null, item, recipe);

        this.updateNode(this._startNode);
    }

    public setRecipe(node: IItemRecipeTreeNode, recipe: NodeRecipeGeneric): IItemRecipeTreeNode {
        const parent = node.parent;

        const newNode = new ItemRecipeTreeNode(parent, node.item, recipe);

        if (parent) {
            const index = parent.children.findIndex(n => n === node);

            parent.children[index] = newNode;
        }
        else {
            this._startNode = newNode;
        }

        this.updateNode(newNode);

        return newNode;
    }

    public updateNode(startNode: IItemRecipeTreeNode): void {
        startNode.resetChildren();
        this.updateItemList();

        const stack: RecipeTreeNodeGeneric[] = [startNode];

        this.addItemToUsed(startNode.item.gameId, -1);

        while (stack.length > 0) {
            const node = stack.pop();

            if (node?.type !== RecipeTreeNodeType.ITEM) {
                continue;
            }

            const item = node.item;

            if (this.getItemUseCount(item.gameId) >= 1 && node !== startNode) {
                continue;
            }

            this.addItemToUsed(item.gameId);

            const formula = node.recipe;

            if (formula?.type === RecipeType.MACHINE
                || formula?.type === RecipeType.MANUAL
                || formula?.type === RecipeType.HUB
            ) {
                const ingredients = formula.recipe.ingredients;

                for (const ingredient of ingredients) {
                    const child = new ItemRecipeTreeNode(
                        node,
                        ingredient.item,
                        this.getNodeRecipe(ingredient.item)
                    );

                    node.addChild(child);
                }

                const children = node.children;

                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push(children[i]);
                }
            } else if (formula?.type === RecipeType.PUMPING
                || formula?.type === RecipeType.MINING
                || formula?.type === RecipeType.GAS_MINING
            ) {
                const resourcePoint = formula.recipe.resourcePoint;
                const child = new ResourcePointRecipeTreeNode(
                    node,
                    resourcePoint
                );

                node.addChild(child);
            }
        }

        this.updateNodePositions();
    }

    public updateItemList(): void {
        this.clearItemList();

        for (const node of this.getStartNode().getIterator()) {
            if (node.type === RecipeTreeNodeType.RESOURCE_POINT) {
                continue;
            }

            this.addItemToUsed(node.item.gameId);
        }
    }

    public updateNodePositions(): void {
        let maxLayer = 0;
        let maxStage = 0;

        const startNode = this.getStartNode();
        startNode.selfChildIndex = -1;
        startNode.layer = 0;
        startNode.stage = 0;

        const minStageByLayer = new Map<number, number>();

        let layer = 0;

        for (const node of startNode.getIterator()) {
            const children = node.children;

            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];

                child.selfChildIndex = i;
            }

            if (node.parent) {
                node.stage = node.parent.stage + 1;
                node.layer = node.selfChildIndex === 0 ? layer : ++layer;
            }

            if (node.children.length === 0) {
                while (minStageByLayer.get(layer - 1)! > node.stage && node.layer !== 0) {
                    layer--;

                    let tempNode = node;
                    node.layer = layer;

                    while (tempNode.selfChildIndex === 0 && tempNode.parent) {
                        tempNode = tempNode.parent;
                        tempNode.layer--;
                    }
                }

                let tempNode = node;

                while (tempNode.selfChildIndex === 0 && tempNode.parent) {
                    tempNode = tempNode.parent;
                }

                minStageByLayer.set(layer, tempNode.stage);
            }

            maxLayer = Math.max(maxLayer, node.layer);
            maxStage = Math.max(maxStage, node.stage);
        }

        this._maxLayer = maxLayer;
        this._maxStage = maxStage;
    }

    public getIterator(): Generator<RecipeTreeNodeGeneric, void, unknown> {
        return this.getStartNode().getIterator();
    }

    private clearItemList() {
        this._itemUsageMap.clear();
    }

    private addItemToUsed(itemId: string, count?: number): number {
        let currentUsage = this.getItemUseCount(itemId);

        currentUsage += count ?? 1;

        this._itemUsageMap.set(itemId, currentUsage);

        return currentUsage;
    }

    private getItemUseCount(itemId: string): number {
        return this._itemUsageMap.get(itemId) ?? 0;
    }

    private getNodeRecipe(item: IItem): NodeRecipeGeneric | null {
        const itemId = item.gameId;

        let recipe: NodeRecipeGeneric | null = null;

        if (item.groupId === ItemGroup.NATURE || item.type === ItemType.LIQUID) {
            recipe = this.getFirstMinerRecipe(itemId)
                ?? this.getFirstGasMinerRecipe(itemId)
                ?? this.getFirstPumpRecipe(itemId)
                ?? this.getDefaultMachineCraft(itemId)
                ?? this.getFirstMachineCraft(itemId)
                ?? this.getDefaultManualCraft(itemId)
                ?? this.getFirstManualCraft(itemId)
                ?? this.getDefaultHubCraft(itemId)
                ?? this.getFirstHubCraft(itemId);
        } else {
            recipe = this.getFirstMinerRecipe(itemId)
                ?? this.getFirstGasMinerRecipe(itemId)
                ?? this.getDefaultMachineCraft(itemId)
                ?? this.getFirstMachineCraft(itemId)
                ?? this.getFirstPumpRecipe(itemId)
                ?? this.getDefaultManualCraft(itemId)
                ?? this.getFirstManualCraft(itemId)
                ?? this.getDefaultHubCraft(itemId)
                ?? this.getFirstHubCraft(itemId);
        }

        return recipe;
    }

    private getDefaultMachineCraft(itemId: string): INodeRecipe<RecipeType.MACHINE, IMachineCraft> | null {
        const recipeId = this._defaultMachineCraftMap[itemId];

        if (!recipeId) {
            return null;
        }

        const recipe = this._machineCraftSearcher.findRecipe(recipeId);

        if (!recipe) {
            return null;
        }

        return {
            type: RecipeType.MACHINE,
            recipe
        };
    }

    private getDefaultManualCraft(itemId: string): INodeRecipe<RecipeType.MANUAL, IManualCraft> | null {
        const recipeId = this._defaultManualCraftMap[itemId];

        if (!recipeId) {
            return null;
        }

        const recipe = this._manualCraftSearcher.findRecipe(recipeId);

        if (!recipe) {
            return null;
        }

        return {
            type: RecipeType.MANUAL,
            recipe
        };
    }

    private getDefaultHubCraft(itemId: string): INodeRecipe<RecipeType.HUB, IManualCraft> | null {
        const recipeId = this._defaultHubCraftMap[itemId];

        if (!recipeId) {
            return null;
        }

        const recipe = this._hubCraftSearcher.findRecipe(recipeId);

        if (!recipe) {
            return null;
        }

        return {
            type: RecipeType.HUB,
            recipe
        };
    }

    private getFirstMachineCraft(itemId: string): INodeRecipe<RecipeType.MACHINE, IMachineCraft> | null {
        const result = this._machineCraftSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty) {
            return null;
        }

        return {
            type: RecipeType.MACHINE,
            recipe: result.list[0]
        };
    }

    private getFirstManualCraft(itemId: string): INodeRecipe<RecipeType.MANUAL, IManualCraft> | null {
        const result = this._manualCraftSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty) {
            return null;
        }

        return {
            type: RecipeType.MANUAL,
            recipe: result.list[0]
        };
    }

    private getFirstHubCraft(itemId: string): INodeRecipe<RecipeType.HUB, IManualCraft> | null {
        const result = this._hubCraftSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty) {
            return null;
        }

        return {
            type: RecipeType.HUB,
            recipe: result.list[0]
        };
    }

    private getFirstMinerRecipe(itemId: string): INodeRecipe<RecipeType.MINING, IMinerRecipe> | null {
        const result = this._minerRecipeSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty) {
            return null;
        }

        return {
            type: RecipeType.MINING,
            recipe: result.list[0]
        };
    }

    private getFirstGasMinerRecipe(itemId: string): INodeRecipe<RecipeType.GAS_MINING, IMinerRecipe> | null {
        const result = this._gasMinerRecipeSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty) {
            return null;
        }

        return {
            type: RecipeType.GAS_MINING,
            recipe: result.list[0]
        }
    }

    private getFirstPumpRecipe(itemId: string): INodeRecipe<RecipeType.PUMPING, IPumpRecipe> | null {
        const result = this._pumpRecipeSearcher.searchByItemAsOutcome(itemId);

        if (result.isEmpty) {
            return null;
        }

        return {
            type: RecipeType.PUMPING,
            recipe: result.list[0]
        };
    }

    private getStartNode(): IItemRecipeTreeNode {
        if (!this._startNode) {
            throw new Error("Start node is not defined");
        }

        return this._startNode;
    }
}