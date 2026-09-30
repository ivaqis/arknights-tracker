<script lang="ts">
    import type { SortDirection } from "$lib/classes/SortDirection";
    import Icon from "$lib/components/Icon.svelte";

    export let sortDirection: SortDirection | null;

    export let onClick: ((currentSortDirection: SortDirection | null) => void) | undefined = undefined;

    function handleClick() {
        onClick?.(sortDirection)
    }
</script>

<button
    class="flex flex-row gap-2 px-4 py-2 items-center justify-center h-full w-full box-border hover:bg-gray-100 dark:hover:bg-[#484848] cursor-pointer"
    on:click={handleClick}
>

    <slot/>

    {#if sortDirection}

        <Icon
            name="arrowDown"
            class="h-4 w-4 transition-transform {sortDirection === 'asc' ? 'rotate-180' : ''}"
        />

    {/if}

</button>