<script>
    import { FormulaTree } from "$lib/classes/formulaTree/FormulaTree.js";
    import { Item } from "$lib/classes/items/Item.js";
    import DragPlate from "$lib/components/DragPlate.svelte";
    import ItemStackCard from "$lib/components/ItemStackCard.svelte";
    import BuildingTreeNode from "$lib/components/recipes/BuildingTreeNode.svelte";
    import ForceNodeContinuationButton from "$lib/components/recipes/ForceNodeContinuationButton.svelte";
    import ResourcePointCard from "$lib/components/recipes/ResourcePointCard.svelte";

    export let startItemId = "item_activity_xiranite_enr_hulu";
    export let startFormula;

    export let isBottomSheetOpen;

    export let selectedItemNode;
    export let selectedBuildingNode;
    export let selectedFormula;

    let tree = new FormulaTree();

    let startItem;
    let nodes = [];

    $: startItem = Item.getItem(startItemId);

    $: if (
        startItem
        && (startItem.id !== tree.startNode?.itemId
            || startFormula && !tree.startNode?.formula)
    ) {
        tree.setStartNode(startItem.id, startFormula);
        forceTreeUpdate();
    }

    $: nodes = [...tree.getIterator()];

    $: if (selectedFormula) {
        console.log(selectedItemNode.itemId);
        selectedItemNode.formula = selectedFormula;
        console.log(selectedItemNode.formula?.id);
        selectedFormula = null;
        tree.updateNode(selectedItemNode);
        tree.updateNodePositions();

        forceTreeUpdate();
    }

    function selectNode(node) {
        if (node === selectedItemNode) {
            selectedItemNode = null;
            isBottomSheetOpen = false;
            return;
        }

        selectedItemNode = node;
        selectedBuildingNode = null;
        isBottomSheetOpen = true;
    }

    $: isNodeSelected = (node) => {
        return selectedItemNode === node;
    };

    function selectBuildingNode(node) {
        if (node === selectedBuildingNode) {
            selectedBuildingNode = null;
            isBottomSheetOpen = false;
            return;
        }

        selectedBuildingNode = node;
        selectedItemNode = null;
        isBottomSheetOpen = true;
    }

    function forceNodeContinuation(node) {
        tree.updateNode(node);
        forceTreeUpdate();
    }

    $: isBuildingNodeSelected = (node) => {
        return selectedBuildingNode === node;
    };

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

    function getXpx(stage) {
        return 100 + stage * (itemNodeWidthPx + itemNode2ItemNodeXDistancePx);
    }

    function getYpx(layer) {
        return 100 + layer * (itemNodeHeightPx + itemNode2ItemNodeYDistancePx);
    }

    function getXBuildingNode(stage) {
        return getXpx(stage) + itemNodeWidthPx + itemNode2BuildingNodeXDistancePx;
    }

    function getXForceNodeContinuationButton(stage) {
        return getXpx(stage) + itemNodeWidthPx + itemNode2ForceNodeContinuationButtonXDistancePx;
    }

    function getPointXItemNodeLeft(stage) {
        let nodeX = getXpx(stage);

        return nodeX + itemNodeWidthPx + node2PointXDistancePx;
    }

    function getPointXItemNodeRight(stage) {
        let nodeX = getXpx(stage);

        return nodeX - node2PointXDistancePx;
    }

    function getPointXBuildingNodeLeft(stage) {
        let nodeX = getXBuildingNode(stage);

        return nodeX + buildingNodeWidthPx + node2PointXDistancePx;
    }

    function getPointXBuildingNodeRight(stage) {
        let nodeX = getXBuildingNode(stage);

        return nodeX - node2PointXDistancePx;
    }

    function getPointYNode(layer) {
        return getYpx(layer) + pointYByNodeHeightPx;
    }

    function getLinePath(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;

        if (dy === 0) {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        return`M ${x1} ${y1} `
        + `Q ${x1 + dx / 2} ${y1}, ${x1 + dx / 2} ${y1 + dx / 2} `
        + `L ${x1 + dx / 2} ${y2 - dx / 2} `
        + `Q ${x1 + dx / 2} ${y2}, ${x2} ${y2}`;
    }

    function forceTreeUpdate() {
        tree = tree;
    }

</script>

<DragPlate>
    <div
        class="relative shrink-0"
        style="width: 500px; height: 500px;"
    >

        <div
            class="absolute right-0 top-0 text-[#21272C] dark:text-[#FDFDFD]"
            style="width: {getXpx(tree.maxStage) + 500}px; height: {getYpx(tree.maxLayer) + 500}px;"
        >

            <svg
                width="{getXpx(tree.maxStage) + 500}"
                height="{getYpx(tree.maxLayer) + 500}"
                viewBox="{getXpx(tree.maxStage) + 500} {getYpx(tree.maxLayer) + 500}"
            >

                <g transform="translate({getXpx(tree.maxStage) + 500}, 0) scale(-1, 1)">

                    {#each tree.getIterator() as node}

                        {#if node.formula}
                            <circle
                                cx="{getPointXItemNodeLeft(node.stage)}"
                                cy="{getPointYNode(node.layer)}"
                                r="{pointRadiusPx}"
                                fill="currentColor"
                            />
                        {/if}

                        {#if node.parentNode}
                            <circle
                                cx="{getPointXItemNodeRight(node.stage)}"
                                cy="{getPointYNode(node.layer)}"
                                r="{pointRadiusPx}"
                                fill="currentColor"
                            />
                        {/if}

                        {#if node.childNodes.length !== 0}
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

                        {#each node.childNodes as childNode}

                            <path
                                d="{getLinePath(getPointXBuildingNodeLeft(node.stage), getPointYNode(node.layer),
                                getPointXItemNodeRight(childNode.stage), getPointYNode(childNode.layer))}"
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
                style="top: {getYpx(node.layer)}px; right: {getXpx(node.stage)}px"
            >
                {#if node.type === "itemNode"}

                    <button
                        tabindex="0"
                        class="w-[110px] h-[110px] rounded-[6px] cursor-pointer aspect-square transition-all duration-300"
                        on:click|preventDefault|stopPropagation={() => selectNode(node)}
                    >

                        <ItemStackCard
                            itemId={node.itemId}
                            highlight={isNodeSelected(node)}
                            highlightRingSize="4"
                            showAmount={false}
                            interactiveImages={false}
                        />

                    </button>

                {:else if node.type === "resourcePointNode"}

                    <ResourcePointCard
                        itemId={node.itemId}
                    />

                {/if}
            </div>

            {#if node.childNodes.length !== 0}

                <div
                    class="absolute flex items-center h-[110px]"
                    style="top: {getYpx(node.layer)}px; right: {getXBuildingNode(node.stage)}px"
                >

                    <button
                        class="rounded-md"
                        on:click|preventDefault|stopPropagation={() => selectBuildingNode(node)}
                    >

                        <BuildingTreeNode
                            formulaType={node.formula?.formulaType}
                            buildingId={node.formula?.crafterId || node.formula?.minerId || node.formula?.pumpId}
                            highlight={isBuildingNodeSelected(node)}
                            craftTimeMs={node.formula?.craftTimeMs || node.formula?.miningTimeMs || node.formula?.pumpTimeMs}
                        />

                    </button>

                </div>

            {/if}

            {#if node.childNodes.length === 0 && node.formula && node.type === "itemNode"}

                <div
                    class="absolute flex items-center h-[110px]"
                    style="top: {getYpx(node.layer)}px; right: {getXForceNodeContinuationButton(node.stage)}px"
                >

                    <button
                        class="rounded-full h-16 w-16"
                        on:click|preventDefault|stopPropagation={() => forceNodeContinuation(node)}
                    >

                        <ForceNodeContinuationButton />

                    </button>

                </div>

            {/if}

        {/each}

    </div>
</DragPlate>