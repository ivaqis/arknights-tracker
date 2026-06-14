<script>
    import { Item } from "$lib/classes/items/Item.js";
    import { ItemComparator } from "$lib/classes/items/ItemComparator.js";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import RecipesFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/RecipesFilterDropdown.svelte";
    import RecipesSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/RecipesSortDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import FormulaSidebar from "$lib/components/recipes/FormulaSidebar.svelte";
    import ItemCard from "$lib/components/recipes/ItemCard.svelte";
    import { craftableItemsList } from "$lib/data/crafts/craftableItemsList.js";
    import { t } from "$lib/i18n";
    import {
        getDefaultItemSortParams,
        itemFilters,
        itemGroupMode,
        itemSearch,
        itemSortParams
    } from "$lib/stores/filterStore.js";

    $: selectedFilters = $itemFilters;
    $: searchQuery = $itemSearch;
    $: isGrouped = $itemGroupMode || false;
    $: sortParams = $itemSortParams;

    $: allFilters = {
        rarity: sortParams.sortFieldParams.rarity,
        events: sortParams.sortFieldParams.events,
        itemGroups: sortParams.sortFieldParams.itemGroups,
        itemTypes: sortParams.sortFieldParams.itemTypes,
        itemMaterials: sortParams.sortFieldParams.itemMaterials
    };

    const allItems = craftableItemsList.map((itemId) => Item.getItem(itemId));

    const itemComparator = new ItemComparator();
    itemComparator.localeComparator.getLocaleFunc = (item) => $t(`itemNames.${item.id}`);

    let sortDirection = "asc";

    $: filteredItems = (() => {
        itemComparator.setComparatorsOrder(sortParams.sortFieldOrder);
        itemComparator.rarityComparator.setValueOrder(sortParams.sortFieldParams.rarity);
        itemComparator.groupComparator.setValueOrder(sortParams.sortFieldParams.itemGroups);
        itemComparator.typeComparator.setValueOrder(sortParams.sortFieldParams.itemTypes);
        itemComparator.materialComparator.setValueOrder(sortParams.sortFieldParams.itemMaterials);
        itemComparator.localeComparator.isReversed = sortParams.sortFieldParams.localeName !== "a-z";

        let items = [...allItems].filter((item) => {
            let rarity = itemCheck(selectedFilters.rarity, item.rarity);
            let group = itemCheck(selectedFilters.itemGroups, item.groupId);
            let type = itemCheck(selectedFilters.itemTypes, item.type);
            let material = itemCheck(selectedFilters.itemMaterials, item.material ?? "nonMaterial");
            let event = itemCheck(selectedFilters.events, item.getEventIds()?.[0] ?? "nonEvent");
            let query = !searchQuery
                || item.id.includes(searchQuery)
                || $t(`itemNames.${item.id}`).includes(searchQuery);

            return rarity && group && type && material && event && query;
        });

        return itemComparator.getSortedList(items, sortDirection === "desc");
    })();

    function itemCheck(filterParamsSet, value) {
        if (!filterParamsSet || filterParamsSet.size === 0) {
            return true;
        }

        return filterParamsSet.has(value);
    }

    function resetSortParams() {
        $itemSortParams = getDefaultItemSortParams();
    }

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters)
        .some((set) => set.size > 0);

    let selectedItemId = "";
    let isBottomSheetOpen = false;

    function selectItem(itemId) {
        if (selectedItemId === itemId) {
            selectedItemId = "";
            isBottomSheetOpen = false;
            return;
        }

        selectedItemId = itemId;
        isBottomSheetOpen = true;
    }

    $: isSelectedItem = (itemId) => {
        return selectedItemId === itemId;
    };

    $: groupedItems = filteredItems.reduce((groups, item) => {
        let groupId = item.groupId;

        if (!groups[groupId]) groups[groupId] = [];

        groups[groupId].push(item);

        return groups;
    }, {});

    $: groupedArray = Object.entries(groupedItems)
        .map(([groupId, items]) => ({ groupId, items }));

    let displayLimit = 2;
    let flatDisplayLimit = 40;

    $: {
        // const _trigger = [
        //     $itemSearch,
        //     $itemFilters,
        //     sortField,
        //     sortDirection,
        //     isGrouped
        // ];
        displayLimit = 2;
        flatDisplayLimit = 40;
        setTimeout(checkScroll, 50);
    }

    $: displayedGroups = groupedArray.slice(0, displayLimit);
    $: displayedItems = filteredItems.slice(0, flatDisplayLimit);

    function loadMore() {
        let changed = false;
        if (isGrouped && displayLimit < groupedArray.length) {
            displayLimit += 2;
            changed = true;
        } else if (!isGrouped && flatDisplayLimit < filteredItems.length) {
            flatDisplayLimit += 40;
            changed = true;
        }
        if (changed) {
            setTimeout(checkScroll, 50);
        }
    }

    function checkScroll() {
        if (typeof window === "undefined" || typeof document === "undefined")
            return;
        const currentScroll = window.innerHeight + window.scrollY;
        const totalHeight = document.body.offsetHeight;
        if (totalHeight - currentScroll < 1000) {
            loadMore();
        }
    }
</script>

<svelte:window on:scroll={checkScroll} on:resize={checkScroll} />

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full flex flex-col xl:flex-row">
    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">
        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.recipes") || "Recipes"}
            </h2>
            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {filteredItems.length}
            </span>
        </div>

        <div class="w-full xl:w-[70%] mb-4">
<!--            <DataToolbar-->
<!--                bind:sortField-->
<!--                bind:sortDirection-->
<!--                bind:filters={$itemFilters}-->
<!--                bind:searchQuery={$itemSearch}-->
<!--                bind:manualMode={$itemManual}-->
<!--                bind:groupMode={$itemGroupMode}-->
<!--                mode="items"-->
<!--            />-->

            <DataToolbar
                showSortDropdownButton={true}
                showSortDirectionButton={true}
                showFilterDropdownButton={true}
                showSearchInput={true}
                showGroupButton={true}
                isFilterActive={isFilterActive}
                bind:isGrouped={$itemGroupMode}
                bind:searchString={$itemSearch}
                bind:sortDirection={sortDirection}
            >

                <RecipesSortDropdown
                    slot="sortDropdown"
                    onSortReset={resetSortParams}
                    bind:sortParams={$itemSortParams}
                />

                <RecipesFilterDropdown
                    slot="filterDropdown"
                    filters={allFilters}
                    bind:selectedFilters={$itemFilters}
                />

            </DataToolbar>

        </div>

        <div class="w-full pb-8">

            {#if isGrouped}

                {#each displayedGroups as group}
                    <div class="flex flex-col gap-1 animate-fadeIn pb-5">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk pl-0.5">
                                {$t(`sort.itemGroups.${group.groupId}`)}
                            </h3>
                        </div>

                        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">
                            {#each group.items as item}

                                <button
                                    tabindex="0"
                                    class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                    on:click|preventDefault|stopPropagation={() => selectItem(item.id)}
                                >

                                    <ItemCard item={item} />

                                    {#if isSelectedItem(item.id)}
                                        <div
                                            class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                        ></div>
                                    {/if}

                                </button>

                            {/each}
                        </div>
                    </div>
                {/each}

            {:else}

                <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">
                    {#each displayedItems as item}
                        <button
                            tabindex="0"
                            class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                            on:click|preventDefault|stopPropagation={() => selectItem(item.id)}
                        >

                            <ItemCard item={item} />

                            {#if isSelectedItem(item.id)}
                                <div
                                    class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                ></div>
                            {/if}

                        </button>
                    {/each}
                </div>

            {/if}

            {#if (isGrouped && displayLimit < groupedArray.length) || (!isGrouped && flatDisplayLimit < filteredItems.length)}
                <div class="h-10 w-full mt-4 flex items-center justify-center opacity-50">
                    <div class="w-8 h-8 animate-spin dark:text-white">
                        <Icon name="loading" class="w-8 h-8 opacity-100" />
                    </div>
                </div>
            {/if}

        </div>
    </div>
        <BottomSheet
            bind:isOpen={isBottomSheetOpen}
        >
            <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8">
                <FormulaSidebar
                    currentItemId={selectedItemId}
                    mode="recipes"
                    itemsAsLink={true}
                />
            </div>
        </BottomSheet>
</div>

{#if !isBottomSheetOpen}
    {#if selectedItemId}
        <button
            type="button"
            class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
            on:click={() => (isBottomSheetOpen = true)}
            title="Results"
        >
            <Icon name="inbox" class="w-6 h-6 text-black" />
        </button>
    {/if}
{/if}