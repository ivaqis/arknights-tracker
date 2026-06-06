<script>
    import ItemStackCard from "$lib/components/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/recipes/ResourcePointCard.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import FuelEnergyCard from "$lib/components/recipes/FuelEnergyCard.svelte";
    import {getRecipeTreeLinkParameters} from "$lib/utils/linkUtils.js";

    export let formula;
    export let highlightItemId = "";

    export let itemsAsLink = false;

    $: mode = formula.formulaType;

    let ingredients;
    let outcomes;
    let craftTimeMs;

    let resourceItemId;
    let powerProvide;

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

    $: if (mode === "powerFormula") {
        ingredients = [{
            count: 1,
            itemId: formula.fuelId
        }];
        outcomes = [];
        craftTimeMs = formula.powerTimeMs;
        powerProvide = formula.powerProvide;
    }
    
</script>

<div class="flex flex-row gap-3 h-[60px] w-full pl-1">

    <div class="flex flex-row gap-2">

        {#if (mode === "machineCraft" || mode === "manualCraft" || mode === "hubCraft" || mode === "powerFormula")}

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
                    showTooltip={true}
                    asLink={itemsAsLink}
                    url="/recipes/tree?{getRecipeTreeLinkParameters(itemId)}"
                />
            {/each}

        {:else if (mode === "miningFormula")}

            <ResourcePointCard
                itemId={resourceItemId}
                size="micro"
                showTooltip={true}
            />

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
                    showTooltip={true}
                    asLink={itemsAsLink}
                    url="/recipes/tree?{getRecipeTreeLinkParameters(itemId)}"
                />
            {/each}

        {:else if (mode === "pumpingFormula")}

            <ResourcePointCard
                itemId={resourceItemId}
                size="micro"
                showTooltip={true}
            />

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
                    showTooltip={true}
                    asLink={itemsAsLink}
                    url="/recipes/tree?{getRecipeTreeLinkParameters(itemId)}"
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
        <Icon
            name="doubleArrows"
            class="text-[#21272C] dark:text-[#FDFDFD] w-full"
        />
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
                showTooltip={true}
                asLink={itemsAsLink}
                url="/recipes/tree?{getRecipeTreeLinkParameters(itemId, formula)}"
            />
        {/each}

        {#if (mode === "powerFormula")}

            <FuelEnergyCard
                powerProvide={powerProvide}
            />

        {/if}

    </div>

</div>