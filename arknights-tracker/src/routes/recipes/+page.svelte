<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
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
        itemComparator.eventComparator.setValueOrder(sortParams.sortFieldParams.events);
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

    function checkSortParams(currentSortParams, defaultSortParams) {
        if (!currentSortParams || !currentSortParams.sortFieldOrder || !currentSortParams.sortFieldParams) {
            return false;
        }

        let fieldOrder = checkList(currentSortParams.sortFieldOrder, defaultSortParams.sortFieldOrder);

        if (!fieldOrder) {
            return false;
        }

        let { localeName, ...rest } = defaultSortParams.sortFieldParams;

        for (let key of Object.keys(rest)) {
            let check = checkList(currentSortParams.sortFieldParams[key], defaultSortParams.sortFieldParams[key]);

            if (!check) {
                return false;
            }
        }

        return true;
    }

    function checkList(currentList, defaultList) {
        if (!currentList) {
            return false;
        }

        let set = new Set(defaultList);

        for (let item of currentList) {
            let isDeleted = set.delete(item);

            if (!isDeleted) {
                return false;
            }
        }

        return set.size === 0;
    }

    let defaultSortParams = getDefaultItemSortParams();
    $: {
        let isSortParamsCorrect = $itemSortParams ? checkSortParams($itemSortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect item sort params");
            $itemSortParams = getDefaultItemSortParams();
        }
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

    $: sortFieldName = (() => {
        let sortFieldName = sortParams.sortFieldOrder[0];
        if (sortFieldName === "localeName") {
            sortFieldName = sortParams.sortFieldOrder[1];
        }

        return sortFieldName;
    })();

    $: groupFieldName = (() => {
        switch (sortFieldName) {
            case "itemGroups": return "groupId";
            case "itemTypes": return "type";
            case "itemMaterials": return "material";
            case "rarity": return "rarity";
            case "events": return "events";
        }

        return null;
    })();

    $: groupedItems = filteredItems.reduce((groups, item) => {
        let groupId = groupFieldName === "events"
            ? (item.getEventIds()?.[0] ?? "nonEvent")
            : item[groupFieldName];

        groupId = groupId.toString();

        if (!groups.groupLists[groupId]) {
            groups.order.push(groupId);
            groups.groupLists[groupId] = [];
        }

        groups.groupLists[groupId].push(item);

        return groups;
    }, { order: [], groupLists: {} });

    $: groupedArray = groupedItems.order
        .map((groupId) => ({ groupId, items: groupedItems.groupLists[groupId] }));

    let displayLimit = 2;
    let flatDisplayLimit = 40;

    $: {
        const _trigger = [
            $itemSearch,
            $itemFilters,
            $itemSortParams,
            sortDirection,
            isGrouped
        ];
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

    function getFilterNameLocale(sortFieldName, filterName) {
        if (sortFieldName === "rarity") {
            return filterName;
        }

        if (sortFieldName === "events") {
            if (filterName === "nonEvent") {
                return $t("sort.events.nonEvent");
            }

            return $t(FactoryEvent.getEvent(filterName)?.title);
        }

        return $t(`sort.${sortFieldName}.${filterName}`);
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

            <DataToolbar
                showSortDropdownButton={true}
                showSortDirectionButton={true}
                showFilterDropdownButton={true}
                showSearchInput={true}
                showGroupButton={true}
                isFilterActive={isFilterActive}
                onFilterReset={() => $itemFilters = {}}
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
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk pl-0.5">
                                {getFilterNameLocale(sortFieldName, group.groupId)}
                            </h3>

                            {#if sortFieldName === "rarity"}

                                <Icon
                                    name="star"
                                    class="h-5 w-5 text-[#21272C] dark:text-[#E4E4E4]"
                                />

                            {/if}
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