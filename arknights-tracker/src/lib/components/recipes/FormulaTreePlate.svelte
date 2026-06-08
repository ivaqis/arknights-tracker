<script>
    import { FormulaTree } from "$lib/classes/formulaTree/FormulaTree.js";
    import { Item } from "$lib/classes/items/Item.js";
    import DragPlate from "$lib/components/DragPlate.svelte";
    import ItemStackCard from "$lib/components/ItemStackCard.svelte";
    import BuildingTreeNode from "$lib/components/recipes/BuildingTreeNode.svelte";
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

    function getXpx(stage) {
        return 100 + stage * 600;
    }

    function getYpx(layer) {
        return 100 + layer * 200;
    }

    function getXBuildingNode(stage) {
        return getXpx(stage) + 200;
    }

    function getYBuildingNode(layer) {
        return getYpx(layer);
    }

    function forceTreeUpdate() {
        tree = tree;
    }

</script>

<DragPlate>
    <div class="relative shrink-0 bg-gray-600"
         style="width: {getXpx(tree.maxStage) + 200}px; height: {getYpx(tree.maxLayer) + 200}px;">

        {#each tree.getIterator() as node}

            <div class="absolute"
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
                    style="top: {getYBuildingNode(node.layer)}px; right: {getXBuildingNode(node.stage)}px"
                >

                    <button
                        class="rounded-md"
                        on:click|preventDefault|stopPropagation={() => selectBuildingNode(node)}
                    >

                        <BuildingTreeNode
                            formulaType={node.formula?.formulaType}
                            buildingId={node.formula?.crafterId || node.formula?.minerId || node.formula?.pumpId}
                            highlight={isBuildingNodeSelected(node)}
                        />

                    </button>

                </div>

            {/if}

            {#if node.childNodes.length === 0 && node.type === "itemNode"}

                <div
                    class="absolute flex items-center h-[110px]"
                    style="top: {getYBuildingNode(node.layer)}px; right: {getXBuildingNode(node.stage)}px"
                >

                    <button
                        class="rounded-full h-16 w-16 flex items-center justify-center bg-[#383838]"
                        on:click|preventDefault|stopPropagation={() => forceNodeContinuation(node)}
                    >
                        a
                    </button>

                </div>

            {/if}

        {/each}

    </div>
</DragPlate>