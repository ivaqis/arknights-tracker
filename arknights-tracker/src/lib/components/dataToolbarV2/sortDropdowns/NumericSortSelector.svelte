<script lang="ts">
    import type { SortDirection } from "$lib/classes/SortDirection";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let selectedDirection: SortDirection;

    function switchDirection() {
        selectedDirection = selectedDirection === "asc" ? "desc" : "asc";
    }
</script>

<button
    class="flex flex-row justify-between gap-2 px-2 min-w-full rounded-md h-8 bg-gray-300 dark:bg-[#2a2a2a] border border-gray-400 dark:border-[#444444]"
    on:click={switchDirection}
>

    <span class="font-bold text-xs text-gray-800 dark:text-gray-300 pl-2 pt-1.5 pointer-events-none">
        {$t(`sort.${selectedDirection}`)}
    </span>

    <div class="relative flex flex-col h-full w-4 items-center justify-center">

        <Icon
            name="arrowDown"
            class="absolute top-1/2 -translate-y-[85%] w-3 h-3 text-gray-500 rotate-180"
        />

        <Icon
            name="arrowDown"
            class="absolute top-1/2 -translate-y-[15%] w-3 h-3 text-gray-500"
        />

    </div>

</button>