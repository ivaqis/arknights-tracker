<script module lang="ts">
    import type { FoodFilters } from "$lib/stores/filters/food/FoodFilters";
    import { getFoodFilters } from "$lib/stores/filterStore";

    const foodFilters: FoodFilters = getFoodFilters();
</script>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { FieldManyValuesComparator } from "$lib/classes/comparators/FieldManyValuesComparator";
    import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator";
    import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
    import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
    import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
    import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
    import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator";
    import { ReactiveNamedComparatorChain } from "$lib/classes/comparators/ReactiveNamedComparatorChain";
    import { FilterSelector } from "$lib/classes/filters/FilterSelector";
    import { FilterSelectorMany } from "$lib/classes/filters/FilterSelectorMany";
    import type { IFilter } from "$lib/classes/filters/IFilter";
    import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
    import type { IReactiveFilterChain } from "$lib/classes/filters/IReactiveFilterChain";
    import type { ISearchFilter } from "$lib/classes/filters/ISearchFilter";
    import { ReactiveFilterChain } from "$lib/classes/filters/ReactiveFilterChain";
    import { SearchFilter } from "$lib/classes/filters/SearchFilter";
    import { SearchFilterMany } from "$lib/classes/filters/SearchFilterMany";
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
    import type { NamedGroupEntry } from "$lib/classes/NamedGroupEntry";
    import type { Rarity } from "$lib/classes/Rarity";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import { FoodTabType } from "$lib/classes/tabs/food/FoodTabType";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import FoodFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/FoodFilterDropdown.svelte";
    import FoodSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/FoodSortDropdown.svelte";
    import SortSelectorDropdown from "$lib/components/dataToolbarV2/sortDropdowns/SortSelectorDropdown.svelte";
    import FoodComparisonTable from "$lib/components/food/FoodComparisonTable.svelte";
    import FoodComparisonTableSelector from "$lib/components/food/FoodComparisonTableSelector.svelte";
    import FoodDetailView from "$lib/components/food/FoodDetailView.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import type { ITabSelectEvent } from "$lib/components/tabSelector/ITabSelectEvent";
    import TabSelector from "$lib/components/tabSelector/TabSelector.svelte";
    import { foodStorage } from "$lib/dataStorages/items/foodStorage";
    import { t } from "$lib/i18n";
    import type { FoodFilterGroup, FoodFilterValue } from "$lib/stores/filters/food/FoodFilterValueMap";
    import type { FoodGroupField, FoodGroupOption } from "$lib/stores/filters/food/FoodGroupField";
    import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";
    import {
        foodGroupMode,
        foodGroupOption,
        foodSearch,
        foodSortParams,
        getDefaultFoodSortParams
    } from "$lib/stores/filterStore";
    import { splitEquipmentView } from "$lib/stores/settings";
    import {
        getMapByList,
        groupManyCustomOrder,
        groupManyPreservingOrder, groupPreservingOrderAndName,
        isListItemsEqual,
        nameGroups
    } from "$lib/utils/collectionUtils";
    import { onMount } from "svelte";
    import { currentLocale, normalizeLocale } from "$lib/stores/locale.js";

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
            replaceState: true,
            noScroll: true,
        });
    }

    let isBottomSheetOpen: boolean = false;


    /// OVERVIEW TAB

    const rarityFilter = foodFilters[FoodFieldComparatorName.RARITY];
    const buffFilter = foodFilters[FoodFieldComparatorName.BUFF];
    const equipCondFilter = foodFilters[FoodFieldComparatorName.EQUIP_COND];
    const targetTypeFilter = foodFilters[FoodFieldComparatorName.TARGET_TYPE];

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

    const rarityComparator: IFieldValueComparator<IFood, Rarity> = new FieldValueComparator(food => food.rarity);
    const buffComparator: IFieldValueComparator<IFood> = new FieldManyValuesComparator(food => food.buffs.map(buff => buff.buffId));
    const equipCondComparator: IFieldValueComparator<IFood, EquipableItemConditionType | "null"> = new FieldValueComparator(food => food.tactical?.condType ?? "null");
    const targetTypeComparator: IFieldValueComparator<IFood, UsableTargetType> = new FieldValueComparator(food => food.targetType);
    const nameComparator: ILocaleComparator<IFood> = new LocaleComparator(food => $t(food.i18nKey));

    const comparator = new ReactiveNamedComparatorChain<IFood, FoodFieldComparatorName>(getComparator);

    $: {
        comparator.beginManual();

        comparator.setOrderAliased($foodSortParams.sortFieldOrder);
        rarityComparator.setValueOrder($foodSortParams.sortFieldParams.rarity);
        buffComparator.setValueOrder($foodSortParams.sortFieldParams.buff);
        equipCondComparator.setValueOrder($foodSortParams.sortFieldParams.equipCond);
        targetTypeComparator.setValueOrder($foodSortParams.sortFieldParams.targetType);
        nameComparator.order = $foodSortParams.sortFieldParams.locale;

        comparator.endManual();
    }

    $: nameComparator.locale = normalizeLocale($currentLocale);

    function getComparator(name: FoodFieldComparatorName): IReactiveComparator<IFood> {
        switch (name) {
            case FoodFieldComparatorName.RARITY:
                return rarityComparator;
            case FoodFieldComparatorName.BUFF:
                return buffComparator;
            case FoodFieldComparatorName.EQUIP_COND:
                return equipCondComparator;
            case FoodFieldComparatorName.TARGET_TYPE:
                return targetTypeComparator;
            case FoodFieldComparatorName.LOCALE:
                return nameComparator;
        }
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

        foodFilters.buff.clear();
        foodFilters.equipCond.clear();
        foodFilters.targetType.clear();
        foodFilters.rarity.clear();

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

    const groupOptions: readonly FoodGroupOption[] = [
        "inherit_sort",
        "rarity",
        "targetType",
        "equipCond",
        "buff",
        "locale"
    ];

    function getGroupOptionTitle(option: FoodGroupOption): string {
        switch (option) {
            case FoodFieldComparatorName.RARITY:
                return $t("sort.rarity");
            case FoodFieldComparatorName.LOCALE:
                return $t("sort.localeNameTitle");
            case FoodFieldComparatorName.BUFF:
                return $t("sort.buffTitle");
            case FoodFieldComparatorName.EQUIP_COND:
                return $t("sort.equipCondTitle");
            case FoodFieldComparatorName.TARGET_TYPE:
                return $t("sort.targetType");
        }

        return $t(`sort.${option}`);
    }

    let groupField: FoodGroupField;
    let isInheritSortBuff: boolean;

    $: if ($foodGroupOption === "inherit_sort") {
        groupField = $foodSortParams.sortFieldOrder[0];
    } else {
        groupField = $foodGroupOption;
    }

    $: isInheritSortBuff = $foodGroupOption === "inherit_sort" && groupField === "buff";

    let groupedItems: NamedGroupEntry<IFood, string | Rarity>[];

    $: groupedItems = groupItems(filteredItems, groupField, isInheritSortBuff);

    function groupItems(items: Iterable<IFood>, field: FoodGroupField, isInheritSortBuff: boolean) {
        if (isInheritSortBuff) {
            return nameGroups(
                groupManyCustomOrder(items, item => item.buffs.map(buff => buff.buffId), $foodSortParams.sortFieldParams.buff),
                key => $t(`buffNames.${key}`)
            );
        }

        switch (field) {
            case "buff":
                return nameGroups(
                    groupManyPreservingOrder(items, item => item.buffs.map(buff => buff.buffId)),
                    key => $t(`buffNames.${key}`)
                );
            case "rarity":
                return groupPreservingOrderAndName(items, item => item.rarity, key => String(key));
            case "equipCond":
                return groupPreservingOrderAndName(items, item => item.tactical?.condType ?? "null", key => $t(EquipableItemConditionType.getI18nKey(key)));
            case "targetType":
                return groupPreservingOrderAndName(items, item => item.targetType, key => $t(UsableTargetType.getI18nKey(key)));
            case "locale":
                return groupPreservingOrderAndName(items, item => $t(item.i18nKey).at(0)!.toUpperCase(), key => key);
        }
    }


    /// COMPARISON TAB

    const tableCondTypeFilter: IFilterSelector<IFood, CondType> = new FilterSelector($foodSortParams.sortFieldParams.equipCond, food => food.tactical?.condType ?? "null");
    const tableBuffFilter: IFilterSelector<IFood> = new FilterSelectorMany($foodSortParams.sortFieldParams.buff, food => food.buffs.map(buff => buff.buffId));
    const tableTargetTypeFilter: IFilterSelector<IFood, UsableTargetType> = new FilterSelector($foodSortParams.sortFieldParams.targetType, food => food.targetType);

    const tableGeneralFilter: IReactiveFilterChain<IFood> = new ReactiveFilterChain()
        .and(tableCondTypeFilter)
        .and(tableBuffFilter)
        .and(tableTargetTypeFilter);

    const excludeCondTypeFilter: IReactiveFilterChain<IFood> = new ReactiveFilterChain()
        .and(tableBuffFilter)
        .and(tableTargetTypeFilter);
    const excludeBuffFilter: IReactiveFilterChain<IFood> = new ReactiveFilterChain()
        .and(tableCondTypeFilter)
        .and(tableTargetTypeFilter);
    const excludeTargetTypeFilter: IReactiveFilterChain<IFood> = new ReactiveFilterChain()
        .and(tableCondTypeFilter)
        .and(tableBuffFilter);

    let selectedBuffList: string[];

    $: selectedBuffList = $foodSortParams.sortFieldParams.buff.filter(buff => $tableBuffFilter.isSelected(buff));

    let filteredTableItems: IFood[];

    $: filteredTableItems = getFilteredTableItems(allItems, $tableGeneralFilter);

    $: tableCondTypeFilter.paramList = getAvailableCondTypeFilters(allItems, $foodSortParams.sortFieldParams.equipCond, $excludeCondTypeFilter);
    $: tableBuffFilter.paramList = getAvailableBuffFilters(allItems, $foodSortParams.sortFieldParams.buff, $excludeBuffFilter);
    $: tableTargetTypeFilter.paramList = getAvailableTargetTypeFilters(allItems, $foodSortParams.sortFieldParams.targetType, $excludeTargetTypeFilter);

    function getFilteredTableItems(allItems: readonly IFood[], filter: IFilter<IFood>): IFood[] {
        return allItems.filter(item => filter.satisfies(item));
    }

    function getAvailableCondTypeFilters(allItems: readonly IFood[], allFilters: CondType[], filter: IFilter<IFood>): CondType[] {
        const filteredItems = allItems.filter(item => filter.satisfies(item));

        const map = Map.groupBy(filteredItems, item => item.tactical?.condType ?? "null");

        return allFilters.filter(filter => map.has(filter));
    }

    function getAvailableBuffFilters(allItems: readonly IFood[], allFilters: readonly string[], filter: IFilter<IFood>): string[] {
        const filteredItems = allItems.filter(item => filter.satisfies(item));

        const map = getMapByList(filteredItems, item => item.buffs.map(buff => buff.buffId));

        return allFilters.filter(filter => map.has(filter));
    }

    function getAvailableTargetTypeFilters(allItems: readonly IFood[], allFilters: readonly UsableTargetType[], filter: IFilter<IFood>): UsableTargetType[] {
        const filteredItems = allItems.filter(item => filter.satisfies(item));

        const map = Map.groupBy(filteredItems, item => item.targetType);

        return allFilters.filter(filter => map.has(filter));
    }


</script>

<svelte:head>
    <title>{$t("pages.food")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.food")} />
    <meta property="og:title" content={`${$t("pages.food")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.food")} />
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
                    showGroupDropdownButton={true}
                    isFilterActive={isFilterActive}
                    onFilterReset={resetFilters}
                    bind:isGrouped={$foodGroupMode}
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
                        filters={foodFilters}
                        onFilterReset={resetFilters}
                    />

                    <SortSelectorDropdown
                        slot="groupDropdown"
                        optionList={groupOptions}
                        getLocaleFunc={getGroupOptionTitle}
                        bind:selectedOption={$foodGroupOption}
                    />

                </DataToolbar>

            </div>

            <div class="w-full pb-8">

                {#if $foodGroupMode}

                    {#each groupedItems as group (group.key)}

                        <div class="flex flex-col gap-1 animate-fadeIn pb-5">

                            <div class="flex items-center gap-2 mb-2">

                                <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk pl-0.5">
                                    {group.title}
                                </h3>

                                {#if groupField === "rarity"}

                                    <Icon
                                        name="star"
                                        class="h-5 w-5 text-[#21272C] dark:text-[#E4E4E4]"
                                    />

                                {/if}

                            </div>

                            <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                                {#each group.list as item (item.gameId)}

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

                    {/each}

                {:else}

                    <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                        {#each filteredItems as item (item.gameId)}

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

                {/if}

            </div>

        {:else if data.tab === FoodTabType.COMPARISON}

            <div class="mt-4 w-full min-h-96 flex-1 rounded-xl overflow-scroll">

                <FoodComparisonTable
                    foodList={filteredTableItems}
                    condTypeOrderList={$foodSortParams.sortFieldParams.equipCond}
                    targetTypeOrderList={$foodSortParams.sortFieldParams.targetType}
                    condTypeSelector={tableCondTypeFilter}
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
                                condTypeSelector={tableCondTypeFilter}
                                buffSelector={tableBuffFilter}
                                targetTypeSelector={tableTargetTypeFilter}
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