<script lang="ts">
    import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
    import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
    import { CardSize } from "$lib/components/cards/CardSize";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/cards/ResourcePointCard.svelte";

    export let items: readonly IItemStack[];
    export let resourcePoint: IResourcePoint | null = null;

    export let getItemUrlFn: (itemStack: IItemStack) => string | null = () => null;
    export let getResourcePointUrlFn: (resourcePoint: IResourcePoint) => string | null = () => null;
    export let highlightItemFn: (itemStack: IItemStack) => boolean = () => false;

</script>

<div class="flex flex-row gap-2">

    {#if resourcePoint}

        <ResourcePointCard
            resourcePoint={resourcePoint}
            url={getResourcePointUrlFn(resourcePoint)}
            showTooltip={true}
            size={CardSize.MICRO}
        />

    {/if}

    {#each items as itemStack, i}

        {#if i !== 0 || resourcePoint !== null}

            <div class="flex items-center justify-center">
                <span class="font-sdk text-xl text-[#21272C] dark:text-[#FDFDFD]">
                    +
                </span>
            </div>

        {/if}

        <ItemStackCard
            item={itemStack.item}
            amount={itemStack.count}
            url={getItemUrlFn(itemStack)}
            highlight={highlightItemFn(itemStack)}
            showTooltip={true}
            size={CardSize.MICRO}
        />

    {/each}

</div>