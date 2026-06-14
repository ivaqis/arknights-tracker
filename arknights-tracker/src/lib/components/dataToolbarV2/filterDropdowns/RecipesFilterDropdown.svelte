<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let filters = {};

    export let selectedFilters = {};

    export let onFilterReset = () => {selectedFilters = {}};

    function toggleFilterGroup(groupName) {
        if (!selectedFilters[groupName]) {
            selectedFilters[groupName] = new Set();
        }

        selectedFilters[groupName].clear();

        forceFiltersUpdate();
    }

    function toggleFilter(filterName, groupName) {
        if (!selectedFilters[groupName]) {
            selectedFilters[groupName] = new Set();
        }

        let selectedFiltersSet = selectedFilters[groupName];

        if (selectedFiltersSet.has(filterName)) {
            selectedFiltersSet.delete(filterName);
        } else {
            selectedFiltersSet.add(filterName);
        }

        forceFiltersUpdate();
    }

    function forceFiltersUpdate() {
        selectedFilters = selectedFilters;
    }

    $: isGroupManualMode = (groupName) => {
        return selectedFilters[groupName] && selectedFilters[groupName].size > 0;
    };

    $: isFilterSelected = (filterName, groupName) => {
        return selectedFilters[groupName]?.has(filterName) ?? false;
    };

    $: getFilterClass = (filterName, groupName) => {
        if (!isGroupManualMode(groupName)) {
            return "bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a]";
        }

        if (isFilterSelected(filterName, groupName)) {
            return "bg-[#F9B90C]/20 border-[#F9B90C] text-gray-900 dark:text-[#E0E0E0] dark:bg-[#FFB200]/50 dark:border-[#FFB200]";
        }

        return "bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878] hover:opacity-100 hover:bg-gray-50 hover:dark:bg-[#424242]";
    };
</script>

<div
    class="z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[350px] max-h-[85vh] sm:relative sm:w-[500px] sm:max-w-[calc(100vw-2rem)] sm:transform-none sm:left-0 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-3 outline-none overflow-y-auto"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|stopPropagation
    on:keydown|stopPropagation
>

    <div class="flex justify-start">

        <button
            class="text-xs font-bold text-gray-500 mb-2 dark:text-gray-400 border border-gray-300 dark:border-[#444444] rounded-full px-4 py-1.5 hover:text-[#F9B90C] hover:border-[#F9B90C] hover:bg-white hover:dark:bg-[#FFB200]/80 hover:dark:border-[#FFB200] hover:dark:text-[#E0E0E0] transition-all uppercase tracking-wider"
            on:click={onFilterReset}
        >
            {$t("sort.reset")}
        </button>

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("rarity")}}
        >
            {$t("sort.rarity")}
        </button>

        <div class="flex flex-wrap gap-2">

            {#each filters.rarity as rarity}

                <button
                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(rarity, 'rarity')}"
                    on:click={() => {toggleFilter(rarity, "rarity")}}
                >

                    <span class="font-bold pointer-events-none">
                        {rarity}
                    </span>

                    <Icon
                        name="star"
                        class="w-3 h-3 text-current pointer-events-none"
                    />

                </button>

            {/each}

        </div>

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("events")}}
        >
            {$t("sort.eventsTitle")}
        </button>

        <div class="flex flex-wrap gap-2">

            {#each filters.events as filterName}

                <button
                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(filterName, 'events')}"
                    on:click={() => {toggleFilter(filterName, "events")}}
                >

                    <span class="text-xs capitalize font-bold pointer-events-none">
                        {$t(FactoryEvent.getEvent(filterName)?.title ?? "sort.events.nonEvent")}
                    </span>

                </button>

            {/each}

        </div>

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("itemGroups")}}
        >
            {$t("sort.itemGroup")}
        </button>

        <div class="flex flex-wrap gap-2">

            {#each filters.itemGroups as filterName}

                <button
                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(filterName, 'itemGroups')}"
                    on:click={() => {toggleFilter(filterName, "itemGroups")}}
                >

                    <span class="text-xs capitalize font-bold pointer-events-none">
                        {$t(`sort.itemGroups.${filterName}`)}
                    </span>

                </button>

            {/each}

        </div>

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("itemTypes")}}
        >
            {$t("sort.itemTypesTitle")}
        </button>

        <div class="flex flex-wrap gap-2">

            {#each filters.itemTypes as filterName}

                <button
                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(filterName, 'itemTypes')}"
                    on:click={() => {toggleFilter(filterName, "itemTypes")}}
                >

                    <span class="text-xs capitalize font-bold pointer-events-none">
                        {$t(`sort.itemTypes.${filterName}`)}
                    </span>

                </button>

            {/each}

        </div>

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("itemMaterials")}}
        >
            {$t("sort.itemMaterialsTitle")}
        </button>

        <div class="flex flex-wrap gap-2">

            {#each filters.itemMaterials as filterName}

                <button
                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(filterName, 'itemMaterials')}"
                    on:click={() => {toggleFilter(filterName, "itemMaterials")}}
                >

                    <span class="text-xs capitalize font-bold pointer-events-none">
                        {$t(`sort.itemMaterials.${filterName}`)}
                    </span>

                </button>

            {/each}

        </div>

    </div>

</div>