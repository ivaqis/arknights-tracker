<script lang="ts" generics="T extends string">
    import type { ITabSelectEvent } from "$lib/components/tabSelector/ITabSelectEvent";

    export let tabList: readonly T[];

    export let activeTab: T;

    export let getLocaleFn: (tab: T) => string = tab => tab;
    export let onTabSelect: ((event: ITabSelectEvent<T>) => void) | undefined = undefined;

    function selectTab(tab: T) {
        const currentTab = activeTab;

        if (currentTab !== tab) {
            activeTab = tab;
        }

        onTabSelect?.({
            selectedTab: tab,
            previousTab: currentTab,
        });
    }
</script>

<div class="flex gap-6">

    {#each tabList as tab}

        <button
            class="text-lg font-bold pb-2 border-b-2 transition-colors {
                activeTab === tab
                ? 'border-[#F9B90C] text-[#21272C] dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }"
            on:click={() => selectTab(tab)}
        >
            {getLocaleFn(tab)}
        </button>

    {/each}

</div>