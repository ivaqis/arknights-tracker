<script lang="ts">
    import { goto } from "$app/navigation";
    import { FoodComparator } from "$lib/classes/comparators/items/FoodComparator";
    import type { IFoodComparator } from "$lib/classes/comparators/items/IFoodComparator";
    import { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import { FoodTabType } from "$lib/classes/tabs/food/FoodTabType";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import FoodFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/FoodFilterDropdown.svelte";
    import FoodSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/FoodSortDropdown.svelte";
    import type { ITabSelectEvent } from "$lib/components/tabSelector/ITabSelectEvent";
    import TabSelector from "$lib/components/tabSelector/TabSelector.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";
    import { t } from "$lib/i18n";
    import type { FoodFilterGroup, FoodFilterValue } from "$lib/stores/filters/food/FoodFilterValueMap";
    import type { FoodSelectedFilterMap } from "$lib/stores/filters/food/FoodSelectedFilterMap";
    import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";
    import { foodFilters, foodSearch, foodSortParams, getDefaultFoodSortParams } from "$lib/stores/filterStore";
    import { isListItemsEqual } from "$lib/utils/collectionUtils";
    import { filterCheck, filterCheckMany } from "$lib/utils/filterUtils";

    export let data;

    const tabList: readonly FoodTabType[] = [FoodTabType.OVERVIEW, FoodTabType.COMPARISON];

    function onTabSelect(event: ITabSelectEvent<FoodTabType>) {
        if (event.selectedTab !== data.tab) {
            const search = new URLSearchParams();

            search.set("tab", event.selectedTab);

            if (data.itemId) {
                search.set("itemId", data.itemId);
            }

            const url = `/food?${search}`;

            goto(url, {
                replaceState: true,
            });
        }
    }

    const allItems: readonly IFood[] = getAllItems();

    function getAllItems(): readonly IFood[] {
        return foodStorage.list;
    }

    function selectItem(item: IItem) {
        const search = new URLSearchParams();

        search.set("tab", data.tab);

        if (data.itemId !== item.gameId) {
            search.set("itemId", item.gameId);
        }

        const url = `/food?${search}`;

        goto(url, {
            replaceState: true
        });
    }


    /// OVERVIEW TAB

    const comparator: IFoodComparator = new FoodComparator(item => $t(item.i18nKey));

    let sortDirection: SortDirection = "asc";

    let filteredItems: IFood[];

    $: filteredItems = getFilteredItems(allItems, $foodSortParams, sortDirection, $foodFilters, $foodSearch);

    function getFilteredItems(items: readonly IFood[], sortParams: FoodSortParams, sortDirection: SortDirection, filters: FoodSelectedFilterMap, searchQuery: string) {
        comparator.setComparatorsOrder(sortParams.sortFieldOrder);
        comparator.rarityComparator.setValueOrder(sortParams.sortFieldParams.rarity);
        comparator.buffComparator.setValueOrder(sortParams.sortFieldParams.buff);
        comparator.equipCondComparator.setValueOrder(sortParams.sortFieldParams.equipCond);
        comparator.localeComparator.isReversed = sortParams.sortFieldParams.locale === LocaleOrder.Z_A;

        const result: IFood[] = items.filter(item => {
            return filterCheck(filters.rarity, item.rarity)
                && filterCheck(filters.equipCond, item.tactical?.condType ?? "null")
                && filterCheckMany(filters.buff, item.buffs.map(buff => buff.buffId))
                && (!searchQuery
                    || item.gameId.includes(searchQuery)
                    || $t(item.i18nKey).includes(searchQuery)
                );
        });

        const reverseMultiplier = sortDirection === "desc" ? -1 : 1;

        result.sort((a, b) => comparator.compare(a, b) * reverseMultiplier);

        return result;
    }

    function resetSort() {
        $foodSortParams = getDefaultFoodSortParams();
    }

    function checkSortParams(current: FoodSortParams, defaultParams: FoodSortParams): boolean {
        if (!current || !current.sortFieldParams || !current.sortFieldOrder) {
            return false;
        }

        const fieldOrder = isListItemsEqual(current.sortFieldOrder, defaultParams.sortFieldOrder);

        if (!fieldOrder) {
            return false;
        }

        const { locale, ...rest } = defaultParams.sortFieldParams;
        const keys = Object.keys(rest) as FoodFilterGroup[];

        for (const key of keys) {
            const check = isListItemsEqual(current.sortFieldParams[key] as FoodFilterValue<typeof key>[], defaultParams.sortFieldParams[key] as FoodFilterValue<typeof key>[]);

            if (!check) {
                return false;
            }
        }

        return true;
    }

    const defaultSortParams: FoodSortParams = getDefaultFoodSortParams();

    $: {
        let isSortParamsCorrect = $foodSortParams ? checkSortParams($foodSortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect food sort params");

            resetSort();
        }
    }

    let isFilterActive = false;

    $: isFilterActive = Object.values($foodFilters)
        .some((set) => set.size > 0);


    /// COMPARISON TAB

</script>

<svelte:head>

    <title>
        {$t("pages.food")} - Goyfield
    </title>

    <meta
        property="og:title"
        content={`${$t("pages.food")} - Goyfield`}
    />

</svelte:head>

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full flex flex-col xl:flex-row">

    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">

        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">

            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.food")}
            </h2>

            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / s
            </span>

        </div>

        <TabSelector
            tabList={tabList}
            activeTab={data.tab}
            onTabSelect={onTabSelect}
        />

        {#if data.tab === FoodTabType.OVERVIEW}

            <div class="mb-4 mt-4">

                <DataToolbar
                    showSortDropdownButton={true}
                    showSortDirectionButton={true}
                    showFilterDropdownButton={true}
                    showSearchInput={true}
                    isFilterActive={isFilterActive}
                    onFilterReset={() => $foodFilters = {}}
                    bind:sortDirection={sortDirection}
                    bind:searchString={$foodSearch}
                >

                    <FoodSortDropdown
                        slot="sortDropdown"
                        onSortReset={resetSort}
                        bind:sortParams={$foodSortParams}
                    />

                    <FoodFilterDropdown
                        slot="filterDropdown"
                        filters={$foodSortParams.sortFieldParams}
                        onFilterReset={() => $foodFilters = {}}
                        bind:selectedFilters={$foodFilters}
                    />

                </DataToolbar>

            </div>

            <div class="w-full pb-8">

                <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                    {#each filteredItems as item}

                        <button
                            tabindex="0"
                            class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                            on:click|preventDefault|stopPropagation={() => selectItem(item)}
                        >

                            <ItemStackCard
                                item={item}
                                highlight={item.gameId === data.itemId}
                                showHoverEffect={true}
                            />

                        </button>

                    {/each}

                </div>

            </div>

        {:else if data.tab === FoodTabType.COMPARISON}

        {/if}

    </div>



</div>