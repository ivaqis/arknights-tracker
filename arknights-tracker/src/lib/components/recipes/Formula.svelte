<script>
    import ItemStackCard from "$lib/components/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/recipes/ResourcePointCard.svelte";
    import Icons from "$lib/components/Icons.svelte";

    export let formula;
    export let highlightItemId = "";

    $: mode = formula.formulaType;

    let ingredients;
    let outcomes;
    let craftTimeMs;
    let resourceItemId;

    $: if (mode === "machineCraft") {
        craftTimeMs = formula.craftTimeMs;
    }

    $: if (mode === "machineCraft" || mode === "manualCraft" || mode === "hubCraft") {
        ingredients = formula.ingredients;
        outcomes = formula.outcomes;
    }

    $: if (mode === "miningFormula") {
        if (formula.hasConsumeItem()) {
            ingredients = [{
                count: formula.consumeItemCount,
                itemId: formula.consumeItemId
            }];
        } else {
            ingredients = [];
        }
        outcomes = [{
            count: 1,
            itemId: formula.miningItemId
        }];
        craftTimeMs = formula.miningTimeMs;
        resourceItemId = formula.miningItemId;
    }

    $: if (mode === "pumpingFormula") {
        ingredients = [];
        outcomes = [{
            count: 1,
            itemId: formula.pumpingLiquidId
        }];
        craftTimeMs = formula.pumpTimeMs;
        resourceItemId = formula.pumpingLiquidId;
    }
    
</script>

<div class="flex flex-row gap-3 h-[60px] w-full">

    <div class="flex flex-row gap-2">

        {#if (mode === "machineCraft" || mode === "manualCraft" || mode === "hubCraft")}

            {#each ingredients as {count, itemId}, index}
                {#if (index !== 0)}
                    <div class="flex items-center justify-center">
                        <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                            +
                        </span>
                    </div>
                {/if}

                <ItemStackCard
                    itemId={itemId}
                    amount={count}
                    size="micro"
                    highlight={highlightItemId === itemId}
                />
            {/each}

        {:else if (mode === "miningFormula")}
            <ResourcePointCard itemId={resourceItemId} resourcePoint="miner" size="micro"/>

            {#each ingredients as {count, itemId}}
                <div class="flex items-center justify-center">
                        <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                            +
                        </span>
                </div>

                <ItemStackCard
                    itemId={itemId}
                    amount={count}
                    size="micro"
                    highlight={highlightItemId === itemId}
                />
            {/each}
        {:else if (mode === "pumpingFormula")}
            <ResourcePointCard itemId={resourceItemId} resourcePoint="liquid" size="micro"/>

            {#each ingredients as {count, itemId}}
                <div class="flex items-center justify-center">
                        <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                            +
                        </span>
                </div>

                <ItemStackCard
                    itemId={itemId}
                    amount={count}
                    size="micro"
                    highlight={highlightItemId === itemId}
                />
            {/each}
        {/if}

    </div>

    <div class="flex flex-col gap-1 items-center justify-center w-6">
        {#if (craftTimeMs)}
            <span class="font-sdk text-xs text-[#21272C] dark:text-[#FDFDFD]">
                {`${craftTimeMs / 1000}s`}
            </span>
        {/if}
        <Icons name="doubleArrows" class="text-[#21272C] dark:text-[#FDFDFD] w-full"/>
    </div>

    <div class="flex flex-row gap-2">

        {#each outcomes as {count, itemId}, index}
            {#if (index !== 0)}
                <div class="flex items-center justify-center">
                        <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                            +
                        </span>
                </div>
            {/if}

            <ItemStackCard
                itemId={itemId}
                amount={count}
                size="micro"
                highlight={highlightItemId === itemId}
            />
        {/each}

    </div>

</div>