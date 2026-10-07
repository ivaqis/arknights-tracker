<script lang="ts">
    import { goto } from "$app/navigation";
    import { FoodComparator } from "$lib/classes/comparators/items/FoodComparator";
    import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
    import type { IFoodComparator } from "$lib/classes/comparators/items/IFoodComparator";
    import { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
    import type { IFilter } from "$lib/classes/filters/IFilter";
    import type { IReactiveFilterChain } from "$lib/classes/filters/IReactiveFilterChain";
    import type { ISearchFilter } from "$lib/classes/filters/ISearchFilter";
    import { ReactiveFilterChain } from "$lib/classes/filters/ReactiveFilterChain";
    import { SearchFilter } from "$lib/classes/filters/SearchFilter";
    import { SearchFilterMany } from "$lib/classes/filters/SearchFilterMany";
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import { FoodTabType } from "$lib/classes/tabs/food/FoodTabType";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import FoodFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/FoodFilterDropdown.svelte";
    import FoodSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/FoodSortDropdown.svelte";
    import FoodComparisonTable from "$lib/components/food/FoodComparisonTable.svelte";
    import FoodComparisonTableSelector from "$lib/components/food/FoodComparisonTableSelector.svelte";
    import FoodDetailView from "$lib/components/food/FoodDetailView.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import type { ITabSelectEvent } from "$lib/components/tabSelector/ITabSelectEvent";
    import TabSelector from "$lib/components/tabSelector/TabSelector.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";
    import { t } from "$lib/i18n";
    import type { FoodFilterGroup, FoodFilterValue } from "$lib/stores/filters/food/FoodFilterValueMap";
    import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";
    import { foodFilters2, foodSearch, foodSortParams, getDefaultFoodSortParams } from "$lib/stores/filterStore";
    import { splitEquipmentView } from "$lib/stores/settings";
    import { isListItemsEqual } from "$lib/utils/collectionUtils";
    import { filterCheck, filterCheckMany } from "$lib/utils/filterUtils";
    import { onMount } from "svelte";

    type CondType = EquipableItemConditionType | "null";

    export let data;

    onMount(() => {
        return splitEquipmentView.subscribe((isSplitView) => {
            if (data.itemId && !isSplitView) {
                goto(`/food/${data.itemId}`, {
                    replaceState: true,
                });
            }
        });
    });

    const defaultSortParams: FoodSortParams = getDefaultFoodSortParams();

    $: {
        let isSortParamsCorrect = $foodSortParams ? checkSortParams($foodSortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect food sort params");

            resetSort();
        }
    }

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

    let selectedItem: IFood | null = null;

    $: selectedItem = data.itemId ? foodStorage.byGameId.get(data.itemId) ?? null : null;

    const allItems: readonly IFood[] = getAllItems();

    function getAllItems(): readonly IFood[] {
        return foodStorage.list;
    }

    function selectItem(item: IItem) {
        const search = new URLSearchParams();

        search.set("tab", data.tab);

        if (data.itemId !== item.gameId) {
            search.set("itemId", item.gameId);

            isBottomSheetOpen = true;
        } else {
            isBottomSheetOpen = false;
        }

        const url = `/food?${search}`;

        goto(url, {
            replaceState: true
        });
    }

    let isBottomSheetOpen: boolean = false;


    /// OVERVIEW TAB

    const rarityFilter = foodFilters2[FoodFieldComparatorName.RARITY];
    const buffFilter = foodFilters2[FoodFieldComparatorName.BUFF];
    const equipCondFilter = foodFilters2[FoodFieldComparatorName.EQUIP_COND];
    const targetTypeFilter = foodFilters2[FoodFieldComparatorName.TARGET_TYPE];

    const nameFilter: ISearchFilter<IFood> = new SearchFilter(food => $t(food.i18nKey).toLowerCase());
    const idFilter: ISearchFilter<IFood> = new SearchFilter(food => food.gameId.toLowerCase());
    const buffNameFilter: ISearchFilter<IFood> = new SearchFilterMany(food => food.buffs.map(buff => $t(buff.i18nKey).toLowerCase()));
    const buffIdFilter: ISearchFilter<IFood> = new SearchFilterMany(food => food.buffs.map(buff => buff.buffId.toLowerCase()));

    $: {
        const searchLower = $foodSearch.toLowerCase();

        searchChain.beginManual();

        nameFilter.searchString = searchLower;
        idFilter.searchString = searchLower;
        buffNameFilter.searchString = searchLower;
        buffIdFilter.searchString = searchLower;

        searchChain.endManual();
    }

    $: {
        filterChain.beginManual();

        rarityFilter.paramList = $foodSortParams.sortFieldParams[FoodFieldComparatorName.RARITY];
        buffFilter.paramList = $foodSortParams.sortFieldParams[FoodFieldComparatorName.BUFF];
        equipCondFilter.paramList = $foodSortParams.sortFieldParams[FoodFieldComparatorName.EQUIP_COND];
        targetTypeFilter.paramList = $foodSortParams.sortFieldParams[FoodFieldComparatorName.TARGET_TYPE];

        filterChain.endManual();
    }

    const searchChain: IReactiveFilterChain<IFood> = new ReactiveFilterChain()
        .or(nameFilter)
        .or(idFilter)
        .or(buffNameFilter)
        .or(buffIdFilter);

    const filterChain: IReactiveFilterChain<IFood> = new ReactiveFilterChain()
        .and(rarityFilter)
        .and(buffFilter)
        .and(equipCondFilter)
        .and(targetTypeFilter)
        .and(searchChain);

    const comparator: IFoodComparator = new FoodComparator(item => $t(item.i18nKey));

    $: {
        comparator.setComparatorsOrder($foodSortParams.sortFieldOrder);
        comparator.rarityComparator.setValueOrder($foodSortParams.sortFieldParams.rarity);
        comparator.buffComparator.setValueOrder($foodSortParams.sortFieldParams.buff);
        comparator.equipCondComparator.setValueOrder($foodSortParams.sortFieldParams.equipCond);
        comparator.targetTypeComparator.setValueOrder($foodSortParams.sortFieldParams.targetType);
        comparator.localeComparator.isReversed = $foodSortParams.sortFieldParams.locale === LocaleOrder.Z_A;
    }

    let sortDirection: SortDirection = "asc";

    let filteredItems: IFood[];

    $: filteredItems = getFilteredItems(allItems, sortDirection, $filterChain);

    function getFilteredItems(items: readonly IFood[], sortDirection: SortDirection, filter: IFilter<IFood>) {
        const result: IFood[] = items.filter(item => filter.satisfies(item));

        const reverseMultiplier = sortDirection === "desc" ? -1 : 1;

        result.sort((a, b) => comparator.compare(a, b) * reverseMultiplier);

        return result;
    }

    function resetSort() {
        $foodSortParams = getDefaultFoodSortParams();
    }

    function resetFilters() {
        filterChain.beginManual();

        foodFilters2.buff.clear();
        foodFilters2.equipCond.clear();
        foodFilters2.targetType.clear();
        foodFilters2.rarity.clear();

        filterChain.endManual();
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
            if (!(key in current.sortFieldParams)) {
                return false;
            }

            const check = isListItemsEqual(current.sortFieldParams[key] as FoodFilterValue<typeof key>[], defaultParams.sortFieldParams[key] as FoodFilterValue<typeof key>[]);

            if (!check) {
                return false;
            }
        }

        return true;
    }



    let isFilterActive = false;

    $: isFilterActive = !$rarityFilter.isEmpty
        || !$buffFilter.isEmpty
        || !$targetTypeFilter.isEmpty
        || !$equipCondFilter.isEmpty;


    /// COMPARISON TAB

    let selectedCondTypeSet: Set<CondType> = new Set();
    let selectedBuffSet: Set<string> = new Set();
    let selectedTargetTypeSet: Set<UsableTargetType> = new Set();

    let selectedBuffList: string[];

    $: selectedBuffList = $foodSortParams.sortFieldParams.buff.filter(buff => selectedBuffSet.has(buff));

    let filteredTableItems: IFood[];

    $: filteredTableItems = getFilteredTableItems(allItems, selectedCondTypeSet, selectedBuffSet, selectedTargetTypeSet);

    let availableCondTypeFilters: CondType[];
    let availableBuffFilters: string[];
    let availableTargetTypeFilters: UsableTargetType[];

    $: availableCondTypeFilters = getAvailableCondTypeFilters(allItems, $foodSortParams.sortFieldParams.equipCond, selectedBuffSet, selectedTargetTypeSet);
    $: availableBuffFilters = getAvailableBuffFilters(allItems, $foodSortParams.sortFieldParams.buff, selectedCondTypeSet, selectedTargetTypeSet);
    $: availableTargetTypeFilters = getAvailableTargetTypeFilters(allItems, $foodSortParams.sortFieldParams.targetType, selectedCondTypeSet, selectedBuffSet);

    function getFilteredTableItems(allItems: readonly IFood[], selectedCondTypeSet: Set<CondType>, selectedBuffSet: Set<string>, selectedTargetTypeSet: Set<UsableTargetType>): IFood[] {
        return allItems.filter(item => {
            return filterCheck(selectedCondTypeSet, item.tactical?.condType ?? "null")
                && filterCheck(selectedTargetTypeSet, item.targetType)
                && filterCheckMany(selectedBuffSet, item.buffs.map(buff => buff.buffId));
        });
    }

    function getAvailableCondTypeFilters(allItems: readonly IFood[], allFilters: readonly CondType[], selectedBuffSet: Set<string>, selectedTargetTypeSet: Set<UsableTargetType>): CondType[] {
        const filteredItems = allItems.filter(item =>
            filterCheck(selectedTargetTypeSet, item.targetType)
            && filterCheckMany(selectedBuffSet, item.buffs.map(buff => buff.buffId))
        );

        return allFilters.filter(
            filter => filteredItems.some(item => (item.tactical?.condType ?? "null") === filter)
        );
    }

    function getAvailableBuffFilters(allItems: readonly IFood[], allFilters: readonly string[], selectedCondTypeSet: Set<CondType>, selectedTargetTypeSet: Set<UsableTargetType>): string[] {
        const filteredItems = allItems.filter(item =>
            filterCheck(selectedCondTypeSet, item.tactical?.condType ?? "null")
            && filterCheck(selectedTargetTypeSet, item.targetType)
        );

        return allFilters.filter(
            filter => filteredItems.some(item => item.hasBuff(filter))
        );
    }

    function getAvailableTargetTypeFilters(allItems: readonly IFood[], allFilters: readonly UsableTargetType[], selectedCondTypeSet: Set<CondType>, selectedBuffSet: Set<string>): UsableTargetType[] {
        const filteredItems = allItems.filter(item =>
            filterCheck(selectedCondTypeSet, item.tactical?.condType ?? "null")
            && filterCheckMany(selectedBuffSet, item.buffs.map(buff => buff.buffId))
        );

        return allFilters.filter(
            filter => filteredItems.some(item => item.targetType === filter)
        );
    }


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

    <div
        class="w-full xl:w-[calc(100%-max(470px,40%))] mr-6 flex flex-col"
        class:h-[calc(100vh-48px)]={data.tab === FoodTabType.COMPARISON}
    >

        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">

            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.food")}
            </h2>

            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {data.tab === "overview" ? filteredItems.length : filteredTableItems.length}
            </span>

        </div>

        <TabSelector
            tabList={tabList}
            activeTab={data.tab}
            onTabSelect={onTabSelect}
            getLocaleFn={(tab) => $t(`page.food.tabs.${tab}`)}
        />

        {#if data.tab === FoodTabType.OVERVIEW}

            <div class="mb-4 mt-4">

                <DataToolbar
                    showSortDropdownButton={true}
                    showSortDirectionButton={true}
                    showFilterDropdownButton={true}
                    showSearchInput={true}
                    isFilterActive={isFilterActive}
                    onFilterReset={resetFilters}
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
                        filters={foodFilters2}
                        onFilterReset={resetFilters}
                    />

                </DataToolbar>

            </div>

            <div class="w-full pb-8">

                <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                    {#each filteredItems as item}

                        {#if $splitEquipmentView}

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

                        {:else}

                            <ItemStackCard
                                item={item}
                                highlight={item.gameId === data.itemId}
                                url="/food/{item.gameId}"
                                showHoverEffect={true}
                            />

                        {/if}

                    {/each}

                </div>

            </div>

        {:else if data.tab === FoodTabType.COMPARISON}

            <div class="mt-4 w-full min-h-96 flex-1 rounded-xl overflow-scroll">

                <FoodComparisonTable
                    foodList={filteredTableItems}
                    condTypeOrderList={$foodSortParams.sortFieldParams.equipCond}
                    targetTypeOrderList={$foodSortParams.sortFieldParams.targetType}
                    selectedCondTypeSet={selectedCondTypeSet}
                    buffList={selectedBuffList}
                    selectItemFn={selectItem}
                    selectedItem={selectedItem}
                />

            </div>

        {/if}

    </div>

    {#if data.tab === FoodTabType.COMPARISON || $splitEquipmentView}

        <BottomSheet
            bind:isOpen={isBottomSheetOpen}
        >

            <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8 overflow-y-auto">

                {#if data.tab === FoodTabType.OVERVIEW && $splitEquipmentView && selectedItem}

                    <FoodDetailView
                        item={selectedItem}
                        inColumn={true}
                        showSelfLink={true}
                    />

                {:else if data.tab === FoodTabType.COMPARISON}

                    <div class="flex flex-col gap-8">

                        <div class="md:mt-[135px]">

                            <FoodComparisonTableSelector
                                condTypeList={availableCondTypeFilters}
                                buffList={availableBuffFilters}
                                targetTypeList={availableTargetTypeFilters}
                                bind:selectedCondTypeSet={selectedCondTypeSet}
                                bind:selectedBuffSet={selectedBuffSet}
                                bind:selectedTargetTypeSet={selectedTargetTypeSet}
                            />

                        </div>

                        {#if selectedItem}

                            <FoodDetailView
                                item={selectedItem}
                                inColumn={true}
                                showSelfLink={true}
                            />

                        {/if}

                    </div>

                {/if}

            </div>

        </BottomSheet>

    {/if}

</div>

{#if !isBottomSheetOpen && (data.itemId || data.tab === FoodTabType.COMPARISON)}

    <button
        type="button"
        class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
        on:click={() => (isBottomSheetOpen = true)}
        title="Results"
    >

        <Icon
            name="inbox"
            class="w-6 h-6 text-black"
        />

    </button>

{/if}