<script lang="ts">
    import { goto } from "$app/navigation";
    import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator";
    import type { IComparator } from "$lib/classes/comparators/IComparator";
    import type { IFieldValueComparator } from "$lib/classes/comparators/IFieldValueComparator";
    import type { ILocaleComparator } from "$lib/classes/comparators/ILocaleComparator";
    import type { IReactiveComparator } from "$lib/classes/comparators/IReactiveComparator";
    import type { IReactiveNamedComparatorChain } from "$lib/classes/comparators/IReactiveNamedComparatorChain";
    import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
    import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator";
    import { ReactiveNamedComparatorChain } from "$lib/classes/comparators/ReactiveNamedComparatorChain";
    import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
    import type { IMachineCraftFactory } from "$lib/classes/factories/recipes/IMachineCraftFactory";
    import type { IManualCraftFactory } from "$lib/classes/factories/recipes/IManualCraftFactory";
    import { MachineCraftFactory } from "$lib/classes/factories/recipes/MachineCraftFactory";
    import { ManualCraftFactory } from "$lib/classes/factories/recipes/ManualCraftFactory";
    import type { IFilter } from "$lib/classes/filters/IFilter";
    import type { IFilterSelector } from "$lib/classes/filters/IFilterSelector";
    import type { IReactiveFilterChain } from "$lib/classes/filters/IReactiveFilterChain";
    import type { ISearchFilter } from "$lib/classes/filters/ISearchFilter";
    import { ReactiveFilterChain } from "$lib/classes/filters/ReactiveFilterChain";
    import { SearchFilter } from "$lib/classes/filters/SearchFilter";
    import { CrafterModeName } from "$lib/classes/gameData/buildings/crafters/CrafterModeName";
    import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
    import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
    import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
    import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
    import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
    import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
    import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
    import type { ItemType } from "$lib/classes/gameData/items/ItemType";
    import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";
    import { RecipeSource } from "$lib/classes/gameData/recipes/sources/RecipeSource";
    import type { Rarity } from "$lib/classes/Rarity";
    import { GasEnvRecipeSearcher } from "$lib/classes/searchers/recipes/GasEnvRecipeSearcher";
    import type { IGasEnvRecipeSearcher } from "$lib/classes/searchers/recipes/IGasEnvRecipeSearcher";
    import type { IMachineCraftSearcher } from "$lib/classes/searchers/recipes/IMachineCraftSearcher";
    import type { IManualCraftSearcher } from "$lib/classes/searchers/recipes/IManualCraftSearcher";
    import type { IMinerRecipeSearcher } from "$lib/classes/searchers/recipes/IMinerRecipeSearcher";
    import type { IPowerRecipeSearcher } from "$lib/classes/searchers/recipes/IPowerRecipeSearcher";
    import type { IPumpRecipeSearcher } from "$lib/classes/searchers/recipes/IPumpRecipeSearcher";
    import { MachineCraftSearcher } from "$lib/classes/searchers/recipes/MachineCraftSearcher";
    import { ManualCraftSearcher } from "$lib/classes/searchers/recipes/ManualCraftSearcher";
    import { MinerRecipeSearcher } from "$lib/classes/searchers/recipes/MinerRecipeSearcher";
    import { PowerRecipeSearcher } from "$lib/classes/searchers/recipes/PowerRecipeSearcher";
    import { PumpRecipeSearcher } from "$lib/classes/searchers/recipes/PumpRecipeSearcher";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import { BuildingRecipeDataStorage } from "$lib/classes/storages/recipes/BuildingRecipeDataStorage";
    import { RecipeDataStorage } from "$lib/classes/storages/recipes/RecipeDataStorage";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import { CardSize } from "$lib/components/cards/CardSize";
    import GasEnvCard from "$lib/components/cards/GasEnvCard.svelte";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import RecipesFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/RecipesFilterDropdown.svelte";
    import RecipesSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/RecipesSortDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import BuildingRecipeGroup from "$lib/components/recipes/formulas/BuildingRecipeGroup.svelte";
    import CrafterModeRecipeGroup from "$lib/components/recipes/formulas/CrafterModeRecipeGroup.svelte";
    import RecipeFormula from "$lib/components/recipes/formulas/RecipeFormula.svelte";
    import RecipeItemChain from "$lib/components/recipes/formulas/RecipeItemChain.svelte";
    import SourceRecipeGroup from "$lib/components/recipes/formulas/SourceRecipeGroup.svelte";
    import FuelEnergyCard from "$lib/components/recipes/FuelEnergyCard.svelte";
    import RecipeSidebar from "$lib/components/recipes/sidebar/RecipeSidebar.svelte";
    import RecipeSidebarSector from "$lib/components/recipes/sidebar/RecipeSidebarSector.svelte";
    import { craftableItemsList } from "$lib/data/crafts/craftableItemsList";
    import { crafterStorage } from "$lib/dataStorages/buildings/crafterStorage";
    import { gasMinerStorage } from "$lib/dataStorages/buildings/gasMinerStorage";
    import { minerStorage } from "$lib/dataStorages/buildings/minerStorage";
    import { powerStationStorage } from "$lib/dataStorages/buildings/powerStationStorage";
    import { pumpStorage } from "$lib/dataStorages/buildings/pumpStorage";
    import { vaporizerStorage } from "$lib/dataStorages/buildings/vaporizerStorage";
    import { hubCraftDataStorage } from "$lib/dataStorages/crafts/hubCraftDataStorage";
    import { machineCraftDataStorage } from "$lib/dataStorages/crafts/machineCraftDataStorage";
    import { manualCraftDataStorage } from "$lib/dataStorages/crafts/manualCraftDataStorage";
    import { factoryEventStorage } from "$lib/dataStorages/events/factoryEventStorage";
    import { gasEnvStorage } from "$lib/dataStorages/gasEnv/gasEnvStorage";
    import { itemStorage } from "$lib/dataStorages/items/itemStorage";
    import { t } from "$lib/i18n";
    import type { RecipeFilterGroup, RecipeFilterValue } from "$lib/stores/filters/recipes/RecipeFilterValueMap";
    import type { RecipeGroupField } from "$lib/stores/filters/recipes/RecipeGroupField";
    import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
    import {
        getDefaultItemSortParams,
        itemFilters,
        itemGroupMode,
        itemGroupOption,
        itemSearch,
        itemSortParams
    } from "$lib/stores/filterStore";
    import { currentLocale, normalizeLocale } from "$lib/stores/locale";
    import { getMapByList } from "$lib/utils/collectionUtils";
    import { getRecipeTreeUrlBuilding, getRecipeTreeUrlCraft, getRecipeTreeUrlItem } from "$lib/utils/linkUtils";

    export let data;

    let selectedItem: IItem | null;

    $: selectedItem = data.itemId ? itemStorage.byGameId.getOrThrow(data.itemId) : null;

    const craftableItems: readonly IItem[] = craftableItemsList.values()
        .map(itemId => itemStorage.byGameId.get(itemId))
        .filter(item => item !== undefined)
        .toArray();

    const itemEventMap = getEventByItemIdMap(factoryEventStorage.list);

    const rarityFilter: IFilterSelector<IItem, Rarity> = itemFilters[ItemFieldComparatorName.RARITY];
    const eventFilter: IFilterSelector<IItem, string | "nonEvent"> = itemFilters[ItemFieldComparatorName.EVENT];
    const groupFilter: IFilterSelector<IItem, ItemGroup> = itemFilters[ItemFieldComparatorName.ITEM_GROUP];
    const typeFilter: IFilterSelector<IItem, ItemType> = itemFilters[ItemFieldComparatorName.ITEM_TYPE];
    const materialFilter: IFilterSelector<IItem, ItemMaterial | "nonMaterial"> = itemFilters[ItemFieldComparatorName.ITEM_MATERIAL];

    const nameFilter: ISearchFilter<IItem> = new SearchFilter(item => $t(item.i18nKey));
    const idFilter: ISearchFilter<IItem> = new SearchFilter(item => item.gameId);

    const searchChain: IReactiveFilterChain<IItem> = new ReactiveFilterChain()
        .or(nameFilter)
        .or(idFilter);

    const filterChain: IReactiveFilterChain<IItem> = new ReactiveFilterChain()
        .and(searchChain)
        .and(rarityFilter)
        .and(groupFilter)
        .and(typeFilter)
        .and(materialFilter)
        .and(eventFilter);

    $: {
        searchChain.beginManual();

        nameFilter.searchString = $itemSearch;
        idFilter.searchString = $itemSearch;

        searchChain.endManual();
    }

    $: {
        filterChain.beginManual();

        rarityFilter.paramList = $itemSortParams.sortFieldParams.rarity;
        eventFilter.paramList = $itemSortParams.sortFieldParams.events;
        groupFilter.paramList = $itemSortParams.sortFieldParams.itemGroups;
        typeFilter.paramList = $itemSortParams.sortFieldParams.itemTypes;
        materialFilter.paramList = $itemSortParams.sortFieldParams.itemMaterials;

        filterChain.endManual();
    }

    const rarityComparator: IFieldValueComparator<IItem, Rarity> = new FieldValueComparator(item => item.rarity);
    const eventComparator: IFieldValueComparator<IItem, string | "nonEvent"> = new FieldValueComparator(item => itemEventMap.get(item.gameId)?.id ?? "nonEvent");
    const groupComparator: IFieldValueComparator<IItem, ItemGroup> = new FieldValueComparator(item => item.groupId);
    const typeComparator: IFieldValueComparator<IItem, ItemType> = new FieldValueComparator(item => item.type);
    const materialComparator: IFieldValueComparator<IItem, ItemMaterial | "nonMaterial"> = new FieldValueComparator(item => item.material ?? "nonMaterial");
    const nameComparator: ILocaleComparator<IItem> = new LocaleComparator(item => $t(item.i18nKey), normalizeLocale($currentLocale));

    const comparatorChain: IReactiveNamedComparatorChain<IItem, ItemFieldComparatorName> = new ReactiveNamedComparatorChain(getComparator);

    $: {
        comparatorChain.beginManual();

        comparatorChain.setOrderAliased($itemSortParams.sortFieldOrder);
        rarityComparator.setValueOrder($itemSortParams.sortFieldParams.rarity);
        eventComparator.setValueOrder($itemSortParams.sortFieldParams.events);
        groupComparator.setValueOrder($itemSortParams.sortFieldParams.itemGroups);
        typeComparator.setValueOrder($itemSortParams.sortFieldParams.itemTypes);
        materialComparator.setValueOrder($itemSortParams.sortFieldParams.itemMaterials);
        nameComparator.order = $itemSortParams.sortFieldParams.localeName;

        comparatorChain.endManual();
    }

    $: {
        const normalized = normalizeLocale($currentLocale);

        nameComparator.locale = normalized;
        groupLocaleComparator.locale = normalized;
    }

    let sortDirection: SortDirection = "asc";
    let reverseMultiplier: number = 1;

    $: reverseMultiplier = sortDirection === "desc" ? -1 : 1;

    let filteredItems: IItem[];

    $: filteredItems = getFilteredItems(craftableItems, $comparatorChain, reverseMultiplier, $filterChain);

    function getFilteredItems(items: readonly IItem[], comparator: IComparator<IItem>, reverseMultiplier: number, filter: IFilter<IItem>): IItem[] {
        const result: IItem[] = items.filter(item => filter.satisfies(item));

        result.sort((a, b) => comparator.compare(a, b) * reverseMultiplier);

        return result;
    }

    function getComparator(name: ItemFieldComparatorName): IReactiveComparator<IItem> {
        switch (name) {
            case ItemFieldComparatorName.RARITY:
                return rarityComparator;
            case ItemFieldComparatorName.EVENT:
                return eventComparator;
            case ItemFieldComparatorName.ITEM_GROUP:
                return groupComparator;
            case ItemFieldComparatorName.ITEM_TYPE:
                return typeComparator;
            case ItemFieldComparatorName.ITEM_MATERIAL:
                return materialComparator;
            case ItemFieldComparatorName.LOCALE_NAME:
                return nameComparator;
        }
    }

    function getEventByItemIdMap(events: Iterable<IFactoryEvent>): Map<string, IFactoryEvent> {
        return getMapByList(events, event => event.eventItemIds);
    }

    function resetSort() {
        $itemSortParams = getDefaultItemSortParams();
    }

    function resetFilters() {
        filterChain.beginManual();

        rarityFilter.clear();
        eventFilter.clear();
        groupFilter.clear();
        typeFilter.clear();
        materialFilter.clear();

        filterChain.endManual();
    }

    function checkSortParams(currentSortParams: RecipeSortParams, defaultSortParams: RecipeSortParams) {
        if (!currentSortParams || !currentSortParams.sortFieldOrder || !currentSortParams.sortFieldParams) {
            return false;
        }

        const fieldOrder = checkList(currentSortParams.sortFieldOrder, defaultSortParams.sortFieldOrder);

        if (!fieldOrder) {
            return false;
        }

        const { localeName, ...rest } = defaultSortParams.sortFieldParams;
        const keys = Object.keys(rest) as RecipeFilterGroup[];

        for (const key of keys) {
            const check = checkList(currentSortParams.sortFieldParams[key] as RecipeFilterValue<typeof key>[], defaultSortParams.sortFieldParams[key] as RecipeFilterValue<typeof key>[]);

            if (!check) {
                return false;
            }
        }

        return true;
    }

    function checkList<T>(currentList: readonly T[], defaultList: readonly T[]): boolean {
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

    const defaultSortParams = getDefaultItemSortParams();
    $: {
        let isSortParamsCorrect = $itemSortParams ? checkSortParams($itemSortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect item sort params");
            resetSort();
        }
    }

    let isFilterActive = false;
    $: isFilterActive = !rarityFilter.isEmpty
        || !eventFilter.isEmpty
        || !groupFilter.isEmpty
        || !typeFilter.isEmpty
        || !materialFilter.isEmpty;

    let groupField: RecipeGroupField;

    $: if ($itemGroupOption === "inherit_sort") {
        groupField = $itemSortParams.sortFieldOrder[0];
    } else {
        groupField = $itemGroupOption;
    }

    const groupRarityComparator = new FieldValueComparator<[Rarity, unknown], Rarity>(([a, b]) => a);
    const groupEventComparator = new FieldValueComparator<[string, unknown]>(([a, b]) => a);
    const groupGroupComparator = new FieldValueComparator<[ItemGroup, unknown], ItemGroup>(([a, b]) => a);
    const groupTypeComparator = new FieldValueComparator<[ItemType, unknown], ItemType>(([a, b]) => a);
    const groupMaterialComparator = new FieldValueComparator<[ItemMaterial | "nonMaterial", unknown], ItemMaterial | "nonMaterial">(([a, b]) => a);
    const groupLocaleComparator = new LocaleComparator<[string, unknown]>(([a, b]) => a, normalizeLocale($currentLocale));

    $: {
        groupRarityComparator.setValueOrder($itemSortParams.sortFieldParams.rarity);
        groupEventComparator.setValueOrder($itemSortParams.sortFieldParams.events);
        groupGroupComparator.setValueOrder($itemSortParams.sortFieldParams.itemGroups);
        groupTypeComparator.setValueOrder($itemSortParams.sortFieldParams.itemTypes);
        groupMaterialComparator.setValueOrder($itemSortParams.sortFieldParams.itemMaterials);
        groupLocaleComparator.order = $itemSortParams.sortFieldParams.localeName;
    }

    let groupedItems: DisplayedItemGroup[] = [];

    $: groupedItems = groupItems(filteredItems, reverseMultiplier, groupField);

    interface DisplayedItemGroup {
        title: string;
        list: IItem[];
    }

    function groupItems(items: Iterable<IItem>, reverseMultiplier: number, field: RecipeGroupField): DisplayedItemGroup[] {
        switch (field) {
            case "rarity": return groupByRarity(items, reverseMultiplier);
            case "events": return groupByEvent(items, reverseMultiplier);
            case "itemGroups": return groupByGroup(items, reverseMultiplier);
            case "itemTypes": return groupByType(items, reverseMultiplier);
            case "itemMaterials": return groupByMaterial(items, reverseMultiplier);
            case "localeName": return groupByName(items, reverseMultiplier);
        }
    }

    function groupByRarity(items: Iterable<IItem>, reverseMultiplier: number): DisplayedItemGroup[] {
        const groups = Map.groupBy(items, item => item.rarity);

        const sorted = groups.entries().toArray();
        sorted.sort((a, b) => groupRarityComparator.compare(a, b) * reverseMultiplier);

        return sorted.map(([key, list]) => ({
            title: String(key),
            list
        }));
    }

    function groupByEvent(items: Iterable<IItem>, reverseMultiplier: number): DisplayedItemGroup[] {
        const groups = Map.groupBy(items, item => itemEventMap.get(item.gameId)?.id ?? "nonEvent");

        const sorted = groups.entries().toArray();
        sorted.sort((a, b) => groupEventComparator.compare(a, b) * reverseMultiplier);

        return sorted.map(([key, list]) => ({
            title: $t(factoryEventStorage.byId.get(key)?.title ?? "sort.events.nonEvent"),
            list
        }));
    }

    function groupByGroup(items: Iterable<IItem>, reverseMultiplier: number): DisplayedItemGroup[] {
        const groups = Map.groupBy(items, item => item.groupId);

        const sorted = groups.entries().toArray();
        sorted.sort((a, b) => groupGroupComparator.compare(a, b) * reverseMultiplier);

        return sorted.map(([key, list]) => ({
            title: $t(`sort.itemGroups.${key}`),
            list
        }));
    }

    function groupByType(items: Iterable<IItem>, reverseMultiplier: number): DisplayedItemGroup[] {
        const groups = Map.groupBy(items, item => item.type);

        const sorted = groups.entries().toArray();
        sorted.sort((a, b) => groupTypeComparator.compare(a, b) * reverseMultiplier);

        return sorted.map(([key, list]) => ({
            title: $t(`sort.itemTypes.${key}`),
            list
        }));
    }

    function groupByMaterial(items: Iterable<IItem>, reverseMultiplier: number): DisplayedItemGroup[] {
        const groups = Map.groupBy(items, item => item.material ?? "nonMaterial");

        const sorted = groups.entries().toArray();
        sorted.sort((a, b) => groupMaterialComparator.compare(a, b) * reverseMultiplier);

        return sorted.map(([key, list]) => ({
            title: $t(`sort.itemMaterials.${key}`),
            list
        }));
    }

    function groupByName(items: Iterable<IItem>, reverseMultiplier: number): DisplayedItemGroup[] {
        const groups = Map.groupBy(items, item => $t(item.i18nKey).at(0)!.toUpperCase());

        const sorted = groups.entries().toArray();
        sorted.sort((a, b) => groupLocaleComparator.compare(a, b) * reverseMultiplier);

        return sorted.map(([key, list]) => ({
            title: key,
            list
        }));
    }

    let groupDisplayLimit = 2;
    let flatDisplayLimit = 40;

    let displayedGroups: DisplayedItemGroup[] = [];
    let displayedItems: IItem[] = [];

    $: displayedGroups = $itemGroupMode ? groupedItems.slice(0, groupDisplayLimit) : [];
    $: displayedItems = !$itemGroupMode ? filteredItems.slice(0, flatDisplayLimit) : [];

    $: {
        void [
            $itemSearch,
            $filterChain,
            $itemSortParams,
            sortDirection,
            $itemGroupMode
        ];

        groupDisplayLimit = 2;
        flatDisplayLimit = 40;
        setTimeout(checkScroll, 50);
    }

    function loadMore() {
        let changed = false;

        if ($itemGroupMode && groupDisplayLimit < groupedItems.length) {
            groupDisplayLimit += 2;
            changed = true;
        } else if (!$itemGroupMode && flatDisplayLimit < filteredItems.length) {
            flatDisplayLimit += 40;
            changed = true;
        }

        if (changed) {
            setTimeout(checkScroll, 50);
        }
    }

    function checkScroll() {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return;
        }

        const currentScroll = window.innerHeight + window.scrollY;
        const totalHeight = document.body.offsetHeight;

        if (totalHeight - currentScroll < 1000) {
            loadMore();
        }
    }

    function selectItem(item: IItem) {
        if (data.itemId === item.gameId) {
            isBottomSheetOpen = false;

            goto("/recipes", {
                replaceState: true,
                noScroll: true
            });

            return;
        }

        isBottomSheetOpen = true;

        goto(`/recipes?id=${item.gameId}`, {
            replaceState: true,
            noScroll: true
        });
    }

    let isBottomSheetOpen: boolean = false;

    const machineCraftStorage = new BuildingRecipeDataStorage(machineCraftDataStorage.list, craft => craft.buildingId);
    const manualCraftStorage = new RecipeDataStorage(manualCraftDataStorage.list);
    const hubCraftStorage = new RecipeDataStorage(hubCraftDataStorage.list);

    const machineCraftFactory: IMachineCraftFactory = new MachineCraftFactory(itemStorage, crafterStorage, gasEnvStorage);
    const manualCraftFactory: IManualCraftFactory = new ManualCraftFactory(itemStorage);

    const machineCraftSearcher: IMachineCraftSearcher = new MachineCraftSearcher(machineCraftStorage, machineCraftFactory, machineCraftDataStorage);
    const manualCraftSearcher: IManualCraftSearcher = new ManualCraftSearcher(manualCraftStorage, manualCraftFactory, manualCraftDataStorage);
    const hubCraftSearcher: IManualCraftSearcher = new ManualCraftSearcher(hubCraftStorage, manualCraftFactory, hubCraftDataStorage);
    const minerRecipeSearcher: IMinerRecipeSearcher = new MinerRecipeSearcher(minerStorage);
    const gasMinerRecipeSearcher: IMinerRecipeSearcher = new MinerRecipeSearcher(gasMinerStorage);
    const pumpRecipeSearcher: IPumpRecipeSearcher = new PumpRecipeSearcher(pumpStorage);
    const powerRecipeSearcher: IPowerRecipeSearcher = new PowerRecipeSearcher(powerStationStorage);
    const gasEnvRecipeSearcher: IGasEnvRecipeSearcher = new GasEnvRecipeSearcher(vaporizerStorage);

    let crafter: ICrafter | null = null;
    let miner: IMiner | null = null;
    let gasMiner: IMiner | null = null;
    let pump: IPump | null = null;
    let powerStation: IPowerStation | null = null;
    let vaporizer: IVaporizer | null = null;

    $: if (selectedItem) {
        crafter = crafterStorage.byItemId.get(selectedItem.gameId) ?? null;
        miner = minerStorage.byItemId.get(selectedItem.gameId) ?? null;
        gasMiner = gasMinerStorage.byItemId.get(selectedItem.gameId) ?? null;
        pump = pumpStorage.byItemId.get(selectedItem.gameId) ?? null;
        powerStation = powerStationStorage.byItemId.get(selectedItem.gameId) ?? null;
        vaporizer = vaporizerStorage.byItemId.get(selectedItem.gameId) ?? null;
    }

    function highlightItem(stack: IItemStack): boolean {
        if (!selectedItem) {
            return false;
        }

        return stack.item.gameId === selectedItem.gameId;
    }

    function getItemStackUrl(stack: IItemStack): string {
        return getRecipeTreeUrlItem(stack.item.gameId);
    }

</script>

<svelte:head>

    <title>
        {$t("pages.recipes")} - Goyfield
    </title>

    <meta
        name="description"
        content={$t("seo.descriptions.recipes")}
    />

    <meta
        property="og:title"
        content={`${$t("pages.recipes")} - Goyfield`}
    />

    <meta
        property="og:description"
        content={$t("seo.descriptions.recipes")}
    />

</svelte:head>

<svelte:window
    on:scroll={checkScroll}
    on:resize={checkScroll}
/>

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full flex flex-col xl:flex-row">

    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">

        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">

            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.recipes")}
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
                onFilterReset={resetFilters}
                bind:isGrouped={$itemGroupMode}
                bind:searchString={$itemSearch}
                bind:sortDirection={sortDirection}
            >

                <RecipesSortDropdown
                    slot="sortDropdown"
                    onSortReset={resetSort}
                    bind:sortParams={$itemSortParams}
                />

                <RecipesFilterDropdown
                    slot="filterDropdown"
                    filters={itemFilters}
                    onFilterReset={resetFilters}
                />

            </DataToolbar>

        </div>

        <div class="w-full pb-8">

            {#if $itemGroupMode}

                {#each displayedGroups as group}

                    {@const title = group.title}

                    <div class="flex flex-col gap-1 animate-fadeIn pb-5">

                        <div class="flex items-center gap-2 mb-2">

                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk pl-0.5">
                                {title}
                            </h3>

                            {#if groupField === "rarity"}

                                <Icon
                                    name="star"
                                    class="h-5 w-5 text-[#21272C] dark:text-[#E4E4E4]"
                                />

                            {/if}

                        </div>

                        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                            {#each group.list as item}

                                <button
                                    tabindex="0"
                                    class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                    on:click|preventDefault|stopPropagation={() => selectItem(item)}
                                >

                                    <ItemStackCard
                                        item={item}
                                        highlight={item.gameId === data.itemId}
                                        event={itemEventMap.get(item.gameId)}
                                        showHoverEffect={true}
                                    />

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
                            on:click|preventDefault|stopPropagation={() => selectItem(item)}
                        >

                            <ItemStackCard
                                item={item}
                                highlight={item.gameId === data.itemId}
                                event={itemEventMap.get(item.gameId)}
                                showHoverEffect={true}
                            />

                        </button>

                    {/each}

                </div>

            {/if}

            {#if ($itemGroupMode && groupDisplayLimit < groupedItems.length) || (!$itemGroupMode && flatDisplayLimit < filteredItems.length)}

                <div class="h-10 w-full mt-4 flex items-center justify-center opacity-50">

                    <div class="w-8 h-8 animate-spin dark:text-white">

                        <Icon
                            name="loading"
                            class="w-8 h-8 opacity-100"
                        />

                    </div>

                </div>

            {/if}

        </div>

    </div>

    <BottomSheet
        bind:isOpen={isBottomSheetOpen}
    >

        <div class="w-full min-h-[50vh] h-full xl:h-[calc(100vh-64px)] sticky top-8">

            <RecipeSidebar
                title={selectedItem ? $t(selectedItem.i18nKey) : null}
                buttonTitle={$t("formulaSidebar.treeSwitchButton.openTree")}
                buttonUrl={selectedItem ? `/recipes/tree?itemId=${selectedItem.gameId}` : null}
            >

                {#if selectedItem}

                    {@const machineAsIncome = machineCraftSearcher.searchByItemAsIncome(selectedItem.gameId)}
                    {@const manualAsIncome = manualCraftSearcher.searchByItemAsIncome(selectedItem.gameId)}
                    {@const hubAsIncome = hubCraftSearcher.searchByItemAsIncome(selectedItem.gameId)}
                    {@const minerAsIncome = minerRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}
                    {@const gasMinerAsIncome = gasMinerRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}
                    {@const powerStationAsIncome = powerRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}
                    {@const vaporizerAsIncome = gasEnvRecipeSearcher.searchByItemAsIncome(selectedItem.gameId)}

                    {@const machineAsOutcome = machineCraftSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const manualAsOutcome = manualCraftSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const hubAsOutcome = hubCraftSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const minerAsOutcome = minerRecipeSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const gasMinerAsOutcome = gasMinerRecipeSearcher.searchByItemAsOutcome(selectedItem.gameId)}
                    {@const pumpAsOutcome = pumpRecipeSearcher.searchByItemAsOutcome(selectedItem.gameId)}

                    {@const hasSource = !machineAsOutcome.isEmpty
                        || !manualAsOutcome.isEmpty
                        || !hubAsOutcome.isEmpty
                        || !minerAsOutcome.isEmpty
                        || !gasMinerAsOutcome.isEmpty
                        || !pumpAsOutcome.isEmpty}
                    {@const hasUsing = !machineAsIncome.isEmpty
                        || !manualAsIncome.isEmpty
                        || !hubAsIncome.isEmpty
                        || !minerAsIncome.isEmpty
                        || !gasMinerAsIncome.isEmpty
                        || !powerStationAsIncome.isEmpty
                        || !vaporizerAsIncome.isEmpty}

                    <div class="flex flex-col justify-start gap-10">

                        {#if hasSource}

                            <RecipeSidebarSector
                                title={$t("formulaSidebar.sector.source")}
                            >

                                {#if !minerAsOutcome.isEmpty}

                                    {@const grouped = minerAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        resourcePoint={recipe.resourcePoint}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.MINING, stack.item.gameId, recipe.building.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !gasMinerAsOutcome.isEmpty}

                                    {@const grouped = gasMinerAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        resourcePoint={recipe.resourcePoint}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.GAS_MINING, stack.item.gameId, recipe.building.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !pumpAsOutcome.isEmpty}

                                    {@const grouped = pumpAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        resourcePoint={recipe.resourcePoint}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.PUMPING, stack.item.gameId, recipe.building.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !hubAsOutcome.isEmpty}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.HUB}
                                    >

                                        {#each hubAsOutcome.list as recipe}

                                            <RecipeFormula>

                                                <RecipeItemChain
                                                    slot="left"
                                                    items={recipe.ingredients}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={getItemStackUrl}
                                                />

                                                <RecipeItemChain
                                                    slot="right"
                                                    items={recipe.outcomes}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.HUB, stack.item.gameId, recipe.gameId)}
                                                />

                                            </RecipeFormula>

                                        {/each}

                                    </SourceRecipeGroup>

                                {/if}

                                {#if !manualAsOutcome.isEmpty}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.MANUAL}
                                    >

                                        {#each manualAsOutcome.list as recipe}

                                            <RecipeFormula>

                                                <RecipeItemChain
                                                    slot="left"
                                                    items={recipe.ingredients}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={getItemStackUrl}
                                                />

                                                <RecipeItemChain
                                                    slot="right"
                                                    items={recipe.outcomes}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MANUAL, stack.item.gameId, recipe.gameId)}
                                                />

                                            </RecipeFormula>

                                        {/each}

                                    </SourceRecipeGroup>

                                {/if}

                                {#if !machineAsOutcome.isEmpty}

                                    {@const grouped = machineAsOutcome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                    gasEnv={recipe.consumeGasEnv}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MACHINE, stack.item.gameId, recipe.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                            </RecipeSidebarSector>

                        {/if}

                        {#if hasUsing}

                            <RecipeSidebarSector
                                title={$t("formulaSidebar.sector.using")}
                            >

                                {#if !hubAsIncome.isEmpty}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.HUB}
                                    >

                                        {#each hubAsIncome.list as recipe}

                                            <RecipeFormula>

                                                <RecipeItemChain
                                                    slot="left"
                                                    items={recipe.ingredients}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={getItemStackUrl}
                                                />

                                                <RecipeItemChain
                                                    slot="right"
                                                    items={recipe.outcomes}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.HUB, stack.item.gameId, recipe.gameId)}
                                                />

                                            </RecipeFormula>

                                        {/each}

                                    </SourceRecipeGroup>

                                {/if}

                                {#if !manualAsIncome.isEmpty}

                                    <SourceRecipeGroup
                                        recipeSource={RecipeSource.MANUAL}
                                    >

                                        {#each manualAsIncome.list as recipe}

                                            <RecipeFormula>

                                                <RecipeItemChain
                                                    slot="left"
                                                    items={recipe.ingredients}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={getItemStackUrl}
                                                />

                                                <RecipeItemChain
                                                    slot="right"
                                                    items={recipe.outcomes}
                                                    highlightItemFn={highlightItem}
                                                    getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MANUAL, stack.item.gameId, recipe.gameId)}
                                                />

                                            </RecipeFormula>

                                        {/each}

                                    </SourceRecipeGroup>

                                {/if}

                                {#if !machineAsIncome.isEmpty}

                                    {@const grouped = machineAsIncome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                    gasEnv={recipe.consumeGasEnv}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MACHINE, stack.item.gameId, recipe.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !minerAsIncome.isEmpty}

                                    {@const grouped = minerAsIncome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        resourcePoint={recipe.resourcePoint}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.MINING, stack.item.gameId, recipe.building.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !gasMinerAsIncome.isEmpty}

                                    {@const grouped = gasMinerAsIncome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        resourcePoint={recipe.resourcePoint}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <RecipeItemChain
                                                        slot="right"
                                                        items={recipe.outcomes}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.GAS_MINING, stack.item.gameId, recipe.building.gameId)}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !powerStationAsIncome.isEmpty}

                                    {@const grouped = powerStationAsIncome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <FuelEnergyCard
                                                        slot="right"
                                                        powerProvide={recipe.powerProvide}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                                {#if !vaporizerAsIncome.isEmpty}

                                    {@const grouped = vaporizerAsIncome.groupByBuilding()}

                                    {#each grouped.values() as group}

                                        <BuildingRecipeGroup
                                            building={group.building}
                                        >

                                            {#each group.list as recipe}

                                                <RecipeFormula
                                                    processTimeMs={recipe.processTimeMs}
                                                >

                                                    <RecipeItemChain
                                                        slot="left"
                                                        items={recipe.ingredients}
                                                        highlightItemFn={highlightItem}
                                                        getItemUrlFn={getItemStackUrl}
                                                    />

                                                    <GasEnvCard
                                                        slot="right"
                                                        gasEnv={recipe.gasEnv}
                                                        showTooltip={true}
                                                        size={CardSize.MICRO}
                                                    />

                                                </RecipeFormula>

                                            {/each}

                                        </BuildingRecipeGroup>

                                    {/each}

                                {/if}

                            </RecipeSidebarSector>

                        {/if}

                        {#if crafter}

                            {@const searchResult = machineCraftSearcher.searchByBuilding(crafter.gameId)}

                            {#if !searchResult.isEmpty}

                                {@const grouped = searchResult.groupByFormulaGroup()}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.availableFormulas")}
                                >

                                    {#each CrafterModeName.ORDER as modeName}

                                        {@const formulaGroupId = crafter.modes.find(group => group.mode.name === modeName)?.formulaGroupId}
                                        {@const group = formulaGroupId ? grouped.get(formulaGroupId) ?? null : null}

                                        {#if group}

                                            <CrafterModeRecipeGroup
                                                crafterMode={group.mode.mode}
                                            >

                                                {#each group.list as recipe}

                                                    <RecipeFormula
                                                        processTimeMs={recipe.processTimeMs}
                                                    >

                                                        <RecipeItemChain
                                                            slot="left"
                                                            items={recipe.ingredients}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={getItemStackUrl}
                                                        />

                                                        <RecipeItemChain
                                                            slot="right"
                                                            items={recipe.outcomes}
                                                            highlightItemFn={highlightItem}
                                                            getItemUrlFn={(stack) => getRecipeTreeUrlCraft(RecipeType.MACHINE, stack.item.gameId, recipe.gameId)}
                                                        />

                                                    </RecipeFormula>

                                                {/each}

                                            </CrafterModeRecipeGroup>

                                        {/if}

                                    {/each}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                        {#if miner}

                            {@const searchResult = minerRecipeSearcher.searchByBuilding(miner.gameId)}

                            {#if !searchResult.isEmpty}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.resourceCollection")}
                                >

                                    {#each searchResult.list as recipe}

                                        <RecipeFormula
                                            processTimeMs={recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={recipe.ingredients}
                                                resourcePoint={recipe.resourcePoint}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.MINING, stack.item.gameId, recipe.building.gameId)}
                                            />

                                        </RecipeFormula>

                                    {/each}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                        {#if gasMiner}

                            {@const searchResult = gasMinerRecipeSearcher.searchByBuilding(gasMiner.gameId)}

                            {#if !searchResult.isEmpty}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.resourceCollection")}
                                >

                                    {#each searchResult.list as recipe}

                                        <RecipeFormula
                                            processTimeMs={recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={recipe.ingredients}
                                                resourcePoint={recipe.resourcePoint}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.GAS_MINING, stack.item.gameId, recipe.building.gameId)}
                                            />

                                        </RecipeFormula>

                                    {/each}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                        {#if pump}

                            {@const searchResult = pumpRecipeSearcher.searchByBuilding(pump.gameId)}

                            {#if !searchResult.isEmpty}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.resourceCollection")}
                                >

                                    {#each searchResult.list as recipe}

                                        <RecipeFormula
                                            processTimeMs={recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={recipe.ingredients}
                                                resourcePoint={recipe.resourcePoint}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <RecipeItemChain
                                                slot="right"
                                                items={recipe.outcomes}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={(stack) => getRecipeTreeUrlBuilding(RecipeType.PUMPING, stack.item.gameId, recipe.building.gameId)}
                                            />

                                        </RecipeFormula>

                                    {/each}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                        {#if powerStation}

                            {@const searchResult = powerRecipeSearcher.searchByBuilding(powerStation.gameId)}

                            {#if !searchResult.isEmpty}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.availableFunctions")}
                                >

                                    {#each searchResult.list as recipe}

                                        <RecipeFormula
                                            processTimeMs={recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={recipe.ingredients}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <FuelEnergyCard
                                                slot="right"
                                                powerProvide={recipe.powerProvide}
                                            />

                                        </RecipeFormula>

                                    {/each}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                        {#if vaporizer}

                            {@const searchResult = gasEnvRecipeSearcher.searchByBuilding(vaporizer.gameId)}

                            {#if !searchResult.isEmpty}

                                <RecipeSidebarSector
                                    title={$t("formulaSidebar.sector.availableFunctions")}
                                >

                                    {#each searchResult.list as recipe}

                                        <RecipeFormula
                                            processTimeMs={recipe.processTimeMs}
                                        >

                                            <RecipeItemChain
                                                slot="left"
                                                items={recipe.ingredients}
                                                highlightItemFn={highlightItem}
                                                getItemUrlFn={getItemStackUrl}
                                            />

                                            <GasEnvCard
                                                slot="right"
                                                gasEnv={recipe.gasEnv}
                                                showTooltip={true}
                                                size={CardSize.MICRO}
                                            />

                                        </RecipeFormula>

                                    {/each}

                                </RecipeSidebarSector>

                            {/if}

                        {/if}

                    </div>

                {/if}

            </RecipeSidebar>

        </div>

    </BottomSheet>

</div>

{#if !isBottomSheetOpen && data.itemId}

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