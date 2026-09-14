<script lang="ts">
    import type { IRecipeTree } from "$lib/classes/formulaTree/IRecipeTree";
    import type { IItemRecipeTreeNode } from "$lib/classes/formulaTree/nodes/IItemRecipeTreeNode";
    import type { NodeRecipeGeneric } from "$lib/classes/formulaTree/nodes/NodeRecipeGeneric";
    import { RecipeTreeNodeType } from "$lib/classes/formulaTree/nodes/RecipeTreeNodeType";
    import { RecipeTree } from "$lib/classes/formulaTree/RecipeTree";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { IMachineCraftSearcher } from "$lib/classes/searchers/recipes/IMachineCraftSearcher";
    import type { IManualCraftSearcher } from "$lib/classes/searchers/recipes/IManualCraftSearcher";
    import type { IMinerRecipeSearcher } from "$lib/classes/searchers/recipes/IMinerRecipeSearcher";
    import type { IPumpRecipeSearcher } from "$lib/classes/searchers/recipes/IPumpRecipeSearcher";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/cards/ResourcePointCard.svelte";
    import DragPlate from "$lib/components/dragPlate/DragPlate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import BuildingRecipeTreeNode from "$lib/components/recipes/tree/BuildingRecipeTreeNode.svelte";
    import ForceNodeContinuationButton from "$lib/components/recipes/tree/ForceNodeContinuationButton.svelte";

    export let machineCraftSearcher: IMachineCraftSearcher;
    export let manualCraftSearcher: IManualCraftSearcher;
    export let hubCraftSearcher: IManualCraftSearcher;
    export let minerRecipeSearcher: IMinerRecipeSearcher;
    export let gasMinerRecipeSearcher: IMinerRecipeSearcher;
    export let pumpRecipeSearcher: IPumpRecipeSearcher;

    export let startItem: IItem;
    export let startFormula: NodeRecipeGeneric | null = null;

    // bindable
    export let isBottomSheetOpen: boolean;
    export let selectedItemNode: IItemRecipeTreeNode | null = null;
    export let selectedBuildingNode: IItemRecipeTreeNode | null = null;

    export const changeRecipe: (node: IItemRecipeTreeNode, recipe: NodeRecipeGeneric) => void = setItemNodeRecipe;

    let tree: IRecipeTree = new RecipeTree(machineCraftSearcher, manualCraftSearcher, hubCraftSearcher, minerRecipeSearcher, gasMinerRecipeSearcher, pumpRecipeSearcher);

    function forceTreeUpdate() {
        tree = tree;
    }

    $: if (startItem
        && (startItem.gameId !== tree.startNode?.item.gameId
            || startFormula && !tree.startNode?.recipe)
    ) {
        tree.setStartNode(startItem, startFormula);
        forceTreeUpdate();
    }

    function selectItemNode(node: IItemRecipeTreeNode) {
        if (node === selectedItemNode) {
            selectedItemNode = null;
            isBottomSheetOpen = false;

            return;
        }

        selectedItemNode = node;
        selectedBuildingNode = null;
        isBottomSheetOpen = true;
    }

    function selectBuildingNode(node: IItemRecipeTreeNode) {
        if (node === selectedBuildingNode) {
            selectedBuildingNode = null;
            isBottomSheetOpen = false;

            return;
        }

        selectedBuildingNode = node;
        selectedItemNode = null;
        isBottomSheetOpen = true;
    }

    function continueNode(node: IItemRecipeTreeNode) {
        tree.updateNode(node);
        forceTreeUpdate();
    }

    function setItemNodeRecipe(node: IItemRecipeTreeNode, recipe: NodeRecipeGeneric) {
        selectedItemNode = tree.setRecipe(node, recipe);
        selectedBuildingNode = null;

        forceTreeUpdate();
    }

    const itemNodeWidthPx = 110;
    const itemNodeHeightPx = 110;

    const buildingNodeWidthPx = 350;

    const itemNode2BuildingNodeXDistancePx = 150;
    const buildingNode2ItemNodeXDistancePx = 150;

    const itemNode2ItemNodeXDistancePx = itemNode2BuildingNodeXDistancePx + buildingNodeWidthPx + buildingNode2ItemNodeXDistancePx;
    const itemNode2ItemNodeYDistancePx = 100;

    const itemNode2ForceNodeContinuationButtonXDistancePx = 50;

    const node2PointXDistancePx = 25;
    const pointYByNodeHeightPx = itemNodeHeightPx / 2;

    const pointRadiusPx = 6;
    const lineWidthPx = 4;

    function getXpx(stage: number): number {
        return 100 + stage * (itemNodeWidthPx + itemNode2ItemNodeXDistancePx);
    }

    function getYpx(layer: number): number {
        return 100 + layer * (itemNodeHeightPx + itemNode2ItemNodeYDistancePx);
    }

    function getXBuildingNode(stage: number): number {
        return getXpx(stage) + itemNodeWidthPx + itemNode2BuildingNodeXDistancePx;
    }

    function getXForceNodeContinuationButton(stage: number): number {
        return getXpx(stage) + itemNodeWidthPx + itemNode2ForceNodeContinuationButtonXDistancePx;
    }

    function getPointXItemNodeLeft(stage: number): number {
        let nodeX = getXpx(stage);

        return nodeX + itemNodeWidthPx + node2PointXDistancePx;
    }

    function getPointXItemNodeRight(stage: number): number {
        let nodeX = getXpx(stage);

        return nodeX - node2PointXDistancePx;
    }

    function getPointXBuildingNodeLeft(stage: number): number {
        let nodeX = getXBuildingNode(stage);

        return nodeX + buildingNodeWidthPx + node2PointXDistancePx;
    }

    function getPointXBuildingNodeRight(stage: number): number {
        let nodeX = getXBuildingNode(stage);

        return nodeX - node2PointXDistancePx;
    }

    function getPointYNode(layer: number): number {
        return getYpx(layer) + pointYByNodeHeightPx;
    }

    function getLinePath(x1: number, y1: number, x2: number, y2: number): string {
        let dx = x2 - x1;
        let dy = y2 - y1;

        if (dy === 0) {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        return `M ${x1} ${y1} `
            + `Q ${x1 + dx / 2} ${y1}, ${x1 + dx / 2} ${y1 + dx / 2} `
            + `L ${x1 + dx / 2} ${y2 - dx / 2} `
            + `Q ${x1 + dx / 2} ${y2}, ${x2} ${y2}`;
    }

</script>

<DragPlate>

    <div
        class="relative shrink-0"
        style="width: 500px; height: 500px;"
    >

        {#if tree.startNode}

            <div
                class="absolute right-0 top-0 text-[#21272C] dark:text-[#FDFDFD]"
                style:width="{getXpx(tree.maxStage) + 500}px"
                style:height="{getYpx(tree.maxLayer) + 500}px"
            >

                <svg
                    width="{getXpx(tree.maxStage) + 500}"
                    height="{getYpx(tree.maxLayer) + 500}"
                    viewBox="0 0 {getXpx(tree.maxStage) + 500} {getYpx(tree.maxLayer) + 500}"
                >

                    <g transform="translate({getXpx(tree.maxStage) + 500}, 0) scale(-1, 1)">

                        {#each tree.getIterator() as node}

                            {#if node.type === RecipeTreeNodeType.ITEM && node.recipe !== null}

                                <circle
                                    cx="{getPointXItemNodeLeft(node.stage)}"
                                    cy="{getPointYNode(node.layer)}"
                                    r="{pointRadiusPx}"
                                    fill="currentColor"
                                />

                            {/if}

                            {#if node.parent !== null}

                                <circle
                                    cx="{getPointXItemNodeRight(node.stage)}"
                                    cy="{getPointYNode(node.layer)}"
                                    r="{pointRadiusPx}"
                                    fill="currentColor"
                                />

                            {/if}

                            {#if node.children.length !== 0}

                                <circle
                                    cx="{getPointXBuildingNodeLeft(node.stage)}"
                                    cy="{getPointYNode(node.layer)}"
                                    r="{pointRadiusPx}"
                                    fill="currentColor"
                                />

                                <circle
                                    cx="{getPointXBuildingNodeRight(node.stage)}"
                                    cy="{getPointYNode(node.layer)}"
                                    r="{pointRadiusPx}"
                                    fill="currentColor"
                                />

                                <path
                                    d="{getLinePath(getPointXItemNodeLeft(node.stage), getPointYNode(node.layer),
                                    getPointXBuildingNodeRight(node.stage), getPointYNode(node.layer))}"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-width="{lineWidthPx}"
                                />

                            {/if}

                            {#each node.children as child}

                                <path
                                    d="{getLinePath(getPointXBuildingNodeLeft(node.stage), getPointYNode(node.layer),
                                    getPointXItemNodeRight(child.stage), getPointYNode(child.layer))}"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-width="{lineWidthPx}"
                                />

                            {/each}

                        {/each}

                    </g>

                </svg>

            </div>

            {#each tree.getIterator() as node}

                <div
                    class="absolute"
                    style:top="{getYpx(node.layer)}px"
                    style:right="{getXpx(node.stage)}px"
                >

                    {#if node.type === RecipeTreeNodeType.ITEM}

                        <button
                            tabindex="0"
                            class="w-[110px] h-[110px] rounded-[6px] cursor-pointer aspect-square transition-all duration-300"
                            on:click|preventDefault|stopPropagation={() => selectItemNode(node)}
                        >

                            <ItemStackCard
                                item={node.item}
                                highlight={node === selectedItemNode}
                                interactiveImages={false}
                                showHoverEffect={true}
                            />

                        </button>

                    {:else if node.type === RecipeTreeNodeType.RESOURCE_POINT}

                        <ResourcePointCard
                            resourcePoint={node.resourcePoint}
                            interactiveImages={false}
                        />

                    {/if}

                </div>

                {#if node.type === RecipeTreeNodeType.ITEM && node.children.length !== 0}

                    <div
                        class="absolute flex items-center h-[110px]"
                        style:top="{getYpx(node.layer)}px"
                        style:right="{getXBuildingNode(node.stage)}px"
                    >

                        <button
                            class="rounded-md"
                            on:click|preventDefault|stopPropagation={() => selectBuildingNode(node)}
                        >

                            <BuildingRecipeTreeNode
                                node={node}
                                highlight={node === selectedBuildingNode}
                            />

                        </button>

                    </div>

                {/if}

                {#if node.type === RecipeTreeNodeType.ITEM && node.children.length === 0}

                    <div
                        class="absolute flex items-center h-[110px]"
                        style:top="{getYpx(node.layer)}px"
                        style:right="{getXForceNodeContinuationButton(node.stage)}px"
                    >

                        <button
                            class="rounded-full h-16 w-16"
                            on:click|preventDefault|stopPropagation={() => continueNode(node)}
                        >

                            <ForceNodeContinuationButton/>

                        </button>

                    </div>

                {/if}

            {/each}

        {:else}

            <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">

                <Icon
                    name="noData"
                    class="h-16 w-16"
                />

            </div>

        {/if}

    </div>

</DragPlate>