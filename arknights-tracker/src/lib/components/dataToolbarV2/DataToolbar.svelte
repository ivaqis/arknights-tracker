<script>
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let showSortDropdownButton = false;
    export let showSortDirectionButton = false;
    export let showFilterDropdownButton = false;
    export let showSearchInput = false;
    export let showGroupButton = false;
    export let showExportExcelButton = false;

    export let sortDirection = "desc"; // "desc | "asc"
    export let searchString = "";
    export let isGrouped = false;

    export let isFilterActive = false;
    export let onFilterReset = () => {};
    export let onExportExcel = () => {};

    let isFilterDropdownOpen = false;
    let isSortDropdownOpen = false;

    function toggleFilterDropdown() {
        isFilterDropdownOpen = !isFilterDropdownOpen;

        if (isFilterDropdownOpen) {
            isSortDropdownOpen = false;
        }
    }

    function toggleSortDropdown() {
        isSortDropdownOpen = !isSortDropdownOpen;

        if (isSortDropdownOpen) {
            isFilterDropdownOpen = false;
        }
    }

    function closeAllDropdown() {
        isFilterDropdownOpen = false;
        isSortDropdownOpen = false;
    }

    function toggleSortDirection() {
        sortDirection = sortDirection === "desc" ? "asc" : "desc";
    }

    function toggleGrouping() {
        isGrouped = !isGrouped;
    }

    function clearSearchString() {
        searchString = "";
    }

</script>

<svelte:window on:click={closeAllDropdown}/>

<div class="flex flex-wrap gap-3 items-center w-full mb-6 {isFilterDropdownOpen || isSortDropdownOpen ? 'z-60' : 'z-40'}">

    {#if showSortDropdownButton}

        <div class="relative">

            <button
                class="h-[40px] dark:bg-[#383838] dark:border dark:border-[#444444] hover:dark:bg-[#373737] px-4 bg-gray-200 hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors min-w-[140px] justify-between cursor-pointer select-none"
                on:click|stopPropagation={toggleSortDropdown}
            >

                <span class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 capitalize pointer-events-none">
                    {$t("sort.title")}
                </span>

                <Icon
                    name="arrowDown"
                    class="w-3 h-3 text-gray-500 transition-transform {isSortDropdownOpen ? 'rotate-180' : ''}"
                />

            </button>

            {#if isSortDropdownOpen}

                <div class="absolute top-12 left-0 min-w-full z-[60]">

                    <slot name="sortDropdown"/>

                </div>

            {/if}

        </div>

    {/if}

    {#if showSortDirectionButton}

        <button
            class="h-[40px] px-4 bg-gray-200 dark:border dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
            on:click={toggleSortDirection}
        >

            <span class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 pointer-events-none">
                {$t(`sort.${sortDirection}`)}
            </span>

            {#if sortDirection === "desc"}

                <Icon
                    name="desc"
                    class="w-3 h-4 text-current pointer-events-none dark:text-[#E0E0E0]"
                />

            {:else if sortDirection === "asc"}

                <Icon
                    name="asc"
                    class="w-3 h-4 text-current pointer-events-none dark:text-[#E0E0E0]"
                />

            {/if}

        </button>

    {/if}

    {#if showFilterDropdownButton}

        <div class="relative">

            <div
                class="flex items-center h-[40px] rounded-full transition-colors {
                    isFilterActive
                        ? 'bg-[#F9B90C] text-black dark:bg-[#F9B90C] dark:text-black shadow-sm'
                        : 'bg-gray-200 text-gray-800 dark:bg-[#383838] dark:text-[#E0E0E0] dark:border-[#444444] dark:border'
                }"
            >

                <button
                    aria-label="Filter"
                    class="flex items-center gap-2 h-full pl-4 {
                        isFilterActive
                            ? 'pr-3 rounded-l-full hover:bg-[#E5AA0B] dark:hover:bg-[#E5AA0B]'
                            : 'pr-4 rounded-full hover:bg-gray-300 hover:dark:bg-[#373737]'
                    }"
                    on:click|stopPropagation={toggleFilterDropdown}
                >

                    <Icon
                        name="filter"
                        class="w-4 h-4 text-current pointer-events-none"
                    />

                    <span class="text-sm pointer-events-none">
                        {$t("sort.filters")}
                    </span>

                </button>

                {#if isFilterActive}

                    <div
                        class="w-[1px] h-4 bg-black/20 shrink-0 pointer-events-none"
                    ></div>

                    <div class="flex items-center justify-center px-2 h-full rounded-r-full">

                        <button
                            aria-label="Clear filters"
                            class="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-black/10 hover:bg-black/25 dark:bg-black/15 dark:hover:bg-black/30 transition-colors cursor-pointer"
                            on:click|stopPropagation={onFilterReset}
                            title={$t("sort.reset")}
                        >

                            <Icon
                                name="close"
                                class="w-[16px] h-[16px] text-black/80"
                            />

                        </button>

                    </div>

                {/if}

            </div>

            {#if isFilterDropdownOpen}

                <div class="absolute top-12 left-0">

                    <slot name="filterDropdown"/>

                </div>

            {/if}

        </div>

    {/if}

    {#if showSearchInput}

        <div class="relative flex-grow max-w-[400px]">

            <div class="absolute left-3 top-1/2 -translate-y-1/2 dark:text-[#E0E0E0] text-gray-500 pointer-events-none">

                <Icon
                    name="search"
                    class="w-4 h-4"
                />

            </div>

            <input
                type="text"
                bind:value={searchString}
                class="w-full h-[40px] dark:border dark:text-[#E0E0E0] dark:placeholder-[#E0E0E0] pl-10 pr-8 bg-gray-200 dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all placeholder-gray-500 text-gray-900"
                placeholder={$t("sort.search")}
            />

            {#if searchString}

                <button
                    aria-label="Clear search"
                    class="absolute right-3 top-1/2 -translate-y-1/2 dark:bg-[#E0E0E0] bg-gray-500 rounded-full text-gray-300 dark:text-[#444444] cursor-pointer"
                    on:click={clearSearchString}
                >

                    <Icon
                        name="close"
                        class="w-4 h-4 p-0.5 pointer-events-none"
                    />

                </button>

            {/if}

        </div>

    {/if}

    {#if showGroupButton}

        <button
            class="h-[40px] w-[40px] flex shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer {
                isGrouped
                    ? 'bg-[#F9B90C] text-black hover:bg-[#E5AA0B] dark:bg-[#F9B90C] dark:text-black dark:hover:bg-[#E5AA0B]'
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-[#383838] dark:text-[#787878] dark:border-[#444444] dark:border hover:dark:bg-[#373737]'
            }"
            on:click={toggleGrouping}
            title="Toggle Grouping"
        >

            <Icon
                name="list"
                class="w-5 h-5 pointer-events-none"
            />

        </button>

    {/if}

    {#if showExportExcelButton}

        <button
            class="h-[40px] px-4 rounded-full border border-gray-200 dark:border-[#444] dark:bg-[#383838] hover:dark:bg-[#444] text-gray-700 dark:text-[#E0E0E0] hover:text-[#1D6F42] hover:border-[#1D6F42] dark:hover:text-green-400 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            on:click={onExportExcel}
        >

            <Icon
                name="export"
                class="w-5 h-5 pointer-events-none"
            />

            <span>
                {$t("page.recordsSettings.exportXLSX")}
            </span>

        </button>

    {/if}

</div>