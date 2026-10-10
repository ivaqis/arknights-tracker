<script module>
    import { getEnemyFilters2 } from "$lib/stores/filterStore.ts";

    let savedDisplayLimit = 4;
    let savedFlatDisplayLimit = 60;
    let savedSortField = "rarity";
    let savedSortDirection = "desc";

    const enemyFilters = getEnemyFilters2();
</script>

<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator.ts";
    import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator.ts";
    import { EnemyComparatorName } from "$lib/classes/comparators/names/EnemyComparatorName.ts";
    import { ReactiveNamedComparatorChain } from "$lib/classes/comparators/ReactiveNamedComparatorChain.ts";
    import { ReactiveFilterChain } from "$lib/classes/filters/ReactiveFilterChain.ts";
    import { SearchFilter } from "$lib/classes/filters/SearchFilter.ts";
    import GroupSelectorDropdown from "$lib/components/dataToolbarV2/groupDropdowns/GroupSelectorDropdown.svelte";
    import EnemySortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/EnemySortDropdown.svelte";
    import { currentLocale, normalizeLocale } from "$lib/stores/locale.ts";
    import { groupPreservingOrderAndName, isListItemsEqual } from "$lib/utils/collectionUtils.ts";
    import { onMount, onDestroy } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import EnemyDetailsView from "$lib/components/enemies/EnemyDetailsView.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import EnemyFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/EnemyFilterDropdown.svelte";
    import { t } from "$lib/i18n";
    import { enemies } from "$lib/data/enemies.js";
    import {
        enemySearch,
        enemyGroupMode,
        getEnemyFilters,
        enemySortParams, getDefaultEnemySortParams, enemyGroupOption, enemyGroupSort
    } from "$lib/stores/filterStore";

    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import Icon from "$lib/components/Icon.svelte";

    const defaultSortParams = getDefaultEnemySortParams();

    $: {
        let isSortParamsCorrect = $enemySortParams ? checkSortParams($enemySortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect enemy sort params");

            resetSort();
        }
    }

    function checkSortParams(current, defaultParams) {
        if (!current || !current.sortFieldParams || !current.sortFieldOrder) {
            return false;
        }

        const fieldOrder = isListItemsEqual(current.sortFieldOrder, defaultParams.sortFieldOrder);

        if (!fieldOrder) {
            return false;
        }

        const { locale, ...rest } = defaultParams.sortFieldParams;
        const keys = Object.keys(rest);

        for (const key of keys) {
            if (!(key in current.sortFieldParams)) {
                return false;
            }

            const check = isListItemsEqual(current.sortFieldParams[key], defaultParams.sortFieldParams[key]);

            if (!check) {
                return false;
            }
        }

        return true;
    }

    $: searchQuery = $enemySearch || "";
    $: isGrouped = $enemyGroupMode || false;

    const allEnemies = Object.values(enemies || {}).filter(
        (e) => e && e.id
    );

    let sortField = savedSortField;
    let sortDirection = savedSortDirection;
    let filters = getEnemyFilters();

    $: queryId = $page.url.searchParams.get("id");
    let selectedEnemyId = "";
    let isBottomSheetOpen = false;

    $: {
        if (queryId && allEnemies.some(e => e.id === queryId)) {
            selectedEnemyId = queryId;
            isBottomSheetOpen = true;
            if (typeof localStorage !== "undefined" && $splitEquipmentView) {
                localStorage.setItem("last_selected_enemy_id", queryId);
            }
        } else if (!queryId) {
            selectedEnemyId = "";
            isBottomSheetOpen = false;
        }
    }

    onMount(() => {
        if (queryId && allEnemies.some(e => e.id === queryId)) {
            if (!$splitEquipmentView) {
                goto(`/enemies/${queryId}`, { replaceState: true });
            } else {
                localStorage.setItem("last_selected_enemy_id", queryId);
            }
        } else if (!queryId && $splitEquipmentView) {
            const savedId = localStorage.getItem("last_selected_enemy_id");
            if (savedId && allEnemies.some(e => e.id === savedId)) {
                selectEnemy(savedId, true);
            }
        }
    });

    function selectEnemy(enemyId, forceSelect = false) {
        if (!enemyId || (!forceSelect && selectedEnemyId === enemyId)) {
            selectedEnemyId = "";
            isBottomSheetOpen = false;
            if ($splitEquipmentView) {
                localStorage.removeItem("last_selected_enemy_id");
                const url = new URL(window.location.href);
                url.searchParams.delete("id");
                goto(url.pathname, { replaceState: true, noScroll: true, keepFocus: true });
            }
            return;
        }

        selectedEnemyId = enemyId;
        isBottomSheetOpen = true;
        if ($splitEquipmentView) {
            localStorage.setItem("last_selected_enemy_id", enemyId);
            const url = new URL(window.location.href);
            url.searchParams.set("id", enemyId);
            goto(url.search, { replaceState: true, noScroll: true, keepFocus: true });
        }
    }

    const nameFilter = new SearchFilter(enemy => $t(`enemies.${enemy.id}`));
    const idFilter = new SearchFilter(enemy => enemy.id);

    const rarityFilter = enemyFilters.rarity;
    const groupIdFilter = enemyFilters.groupId;

    const searchChain = new ReactiveFilterChain()
        .or(nameFilter)
        .or(idFilter);

    const filterChain = new ReactiveFilterChain()
        .and(rarityFilter)
        .and(groupIdFilter)
        .and(searchChain);

    $: {
        searchChain.beginManual();

        nameFilter.searchString = $enemySearch;
        idFilter.searchString = $enemySearch;

        searchChain.endManual();
    }

    $: {
        filterChain.beginManual();

        groupIdFilter.paramList = $enemySortParams.sortFieldParams.groupId;
        rarityFilter.paramList = $enemySortParams.sortFieldParams.rarity;

        filterChain.endManual();
    }

    const rarityComparator = new FieldValueComparator(enemy => enemy.rarity);
    const groupIdComparator = new FieldValueComparator(enemy => enemy.groupId || "none");
    const nameComparator = new LocaleComparator(enemy => $t(`enemies.${enemy.id}`));

    const comparatorChain = new ReactiveNamedComparatorChain(getComparator);

    $: {
        comparatorChain.beginManual();

        comparatorChain.setOrderAliased($enemySortParams.sortFieldOrder);
        rarityComparator.setValueOrder($enemySortParams.sortFieldParams.rarity);
        groupIdComparator.setValueOrder($enemySortParams.sortFieldParams.groupId);
        nameComparator.order = $enemySortParams.sortFieldParams.locale;

        comparatorChain.endManual();
    }

    $: nameComparator.locale = normalizeLocale($currentLocale);

    function getComparator(name) {
        switch (name) {
            case EnemyComparatorName.RARITY:
                return rarityComparator;
            case EnemyComparatorName.GROUP_ID:
                return groupIdComparator;
            case EnemyComparatorName.LOCALE:
                return nameComparator;
        }
    }

    let revereMultiplier;

    $: revereMultiplier = sortDirection === "asc" ? -1 : 1;

    $: filteredEnemies = filterEnemies(allEnemies, $filterChain, $comparatorChain, revereMultiplier);

    function filterEnemies(allEnemies, filter, comparator, reverseMultiplier) {
        const filtered = allEnemies.filter(enemy => `enemies.${enemy.id}` !== $t(`enemies.${enemy.id}`) && filter.satisfies(enemy));

        filtered.sort((a, b) => comparator.compare(a, b) * reverseMultiplier);

        return filtered;
    }

    function resetSort() {
        $enemySortParams = getDefaultEnemySortParams();
    }

    function resetFilters() {
        filterChain.beginManual();

        groupIdFilter.clear();
        rarityFilter.clear();

        filterChain.endManual();
    }

    function resetGroup() {
        $enemyGroupOption = "groupId";
        $enemyGroupSort = false;
    }

    let isFilterActive = false;
    $: isFilterActive = !$rarityFilter.isEmpty || !$groupIdFilter.isEmpty;

    const groupOptions = [
        "inherit_sort",
        "rarity",
        "groupId",
        "locale",
    ];

    function getGroupOptionTitle(option) {
        switch (option) {
            case "groupId":
                return $t("sort.enemyGroupTitle");
            case "locale":
                return $t("sort.localeNameTitle");
        }

        return $t(`sort.${option}`);
    }

    let groupField;

    $: if ($enemyGroupOption === "inherit_sort") {
        groupField = $enemySortParams.sortFieldOrder[0];
    } else {
        groupField = $enemyGroupOption;
    }

    const groupRarityComparator = new FieldValueComparator(entry => entry.key);
    const groupGroupIdComparator = new FieldValueComparator(entry => entry.key);
    const groupNameComparator = new LocaleComparator(entry => entry.key, normalizeLocale($currentLocale));

    $: {
        groupRarityComparator.setValueOrder($enemySortParams.sortFieldParams.rarity);
        groupGroupIdComparator.setValueOrder($enemySortParams.sortFieldParams.groupId);
        groupNameComparator.order = $enemySortParams.sortFieldParams.locale;
    }

    $: groupNameComparator.locale = normalizeLocale($currentLocale);

    function groupEnemies(filteredEnemies, groupField) {
        switch (groupField) {
            case "rarity":
                return groupPreservingOrderAndName(filteredEnemies, enemy => enemy.rarity, String);
            case "groupId":
                return groupPreservingOrderAndName(filteredEnemies, enemy => enemy.groupId || "none", key => $t(`enemiesGroups.${key}`));
            case "locale":
                return groupPreservingOrderAndName(filteredEnemies, enemy => $t(`enemies.${enemy.id}`).at(0).toUpperCase(), key => key);
        }

        throw new Error(`Unknown group field: ${groupField}`);
    }

    let groupEnemiesAndSort;

    $: groupEnemiesAndSort = (filteredEnemies, groupField) => {
        switch (groupField) {
            case "rarity":
                return groupPreservingOrderAndName(filteredEnemies, enemy => enemy.rarity, String)
                    .sort((a, b) => $groupRarityComparator.compare(a, b));
            case "groupId":
                return groupPreservingOrderAndName(filteredEnemies, enemy => enemy.groupId || "none", key => $t(`enemiesGroups.${key}`))
                    .sort((a, b) => $groupGroupIdComparator.compare(a, b));
            case "locale":
                return groupPreservingOrderAndName(filteredEnemies, enemy => $t(`enemies.${enemy.id}`).at(0).toUpperCase(), key => key)
                    .sort((a, b) => $groupNameComparator.compare(a, b));
        }

        throw new Error(`Unknown group field: ${groupField}`);
    };

    $: groupedArray = $enemyGroupSort ? groupEnemiesAndSort(filteredEnemies, groupField) : groupEnemies(filteredEnemies, groupField);

    function onGroupSelect(event) {
        if (event.previousOption === event.newOption) {
            $enemyGroupMode = !$enemyGroupMode;
        } else {
            $enemyGroupMode = true;
        }
    }

    let displayLimit = savedDisplayLimit;
    let flatDisplayLimit = savedFlatDisplayLimit;

    let initialRender = true;

    $: {
        void [searchQuery, $enemySortParams, sortDirection, isGrouped, $filterChain];

        if (initialRender) {
            initialRender = false;
        } else {
            displayLimit = 4;
            flatDisplayLimit = 60;
        }
        setTimeout(checkScroll, 50);
    }

    $: displayedGroups = groupedArray.slice(0, displayLimit);
    $: displayedFlat = filteredEnemies.slice(0, flatDisplayLimit);

    function loadMore() {
        let changed = false;
        if (isGrouped && displayLimit < groupedArray.length) {
            displayLimit += 4;
            changed = true;
        } else if (!isGrouped && flatDisplayLimit < filteredEnemies.length) {
            flatDisplayLimit += 40;
            changed = true;
        }
        if (changed) {
            setTimeout(checkScroll, 50);
        }
    }

    function checkScroll() {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const currentScroll = window.innerHeight + window.scrollY;
        const totalHeight = document.body.offsetHeight;
        if (totalHeight - currentScroll < 1000) {
            loadMore();
        }
    }
    onDestroy(() => {
        savedSortField = sortField;
        savedSortDirection = sortDirection;
        savedDisplayLimit = displayLimit;
        savedFlatDisplayLimit = flatDisplayLimit;
    });
</script>

<svelte:head>
    <title>{$t("pages.enemies")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.enemies")} />
    <meta property="og:title" content={`${$t("pages.enemies")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.enemies")} />
</svelte:head>

<svelte:window on:scroll={checkScroll} on:resize={checkScroll} />

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen {$splitEquipmentView ? 'flex flex-col xl:flex-row justify-between items-start' : ''}">
    
    <div class="w-full {$splitEquipmentView ? 'xl:w-[calc(100%-min(770px,45%))] xl:mr-6' : ''}">
        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.enemies")}
            </h2>
            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {filteredEnemies.length}
            </span>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[70%]'} mb-4">
            <DataToolbar
                showSortDropdownButton={true}
                showSortDirectionButton={true}
                showFilterDropdownButton={true}
                showSearchInput={true}
                onFilterReset={resetFilters}
                isFilterActive={isFilterActive}
                showGroupDropdownButton={true}
                bind:isGrouped={$enemyGroupMode}
                bind:searchString={$enemySearch}
                bind:sortDirection={sortDirection}
            >

                <EnemySortDropdown
                    slot="sortDropdown"
                    bind:sortParams={$enemySortParams}
                    onSortReset={resetSort}
                />

                <EnemyFilterDropdown
                    slot="filterDropdown"
                    filters={enemyFilters}
                />

                <GroupSelectorDropdown
                    slot="groupDropdown"
                    getLocaleFn={getGroupOptionTitle}
                    onOptionSelect={onGroupSelect}
                    onResetButtonClick={resetGroup}
                    optionList={groupOptions}
                    bind:isGroupSortActive={$enemyGroupSort}
                    bind:selectedOption={$enemyGroupOption}
                />

            </DataToolbar>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[85%]'} pb-12 flex flex-col gap-5 relative">
            {#if isGrouped}
                {#each displayedGroups as group (group.key)}

                    <div class="flex flex-col gap-1 animate-fadeIn">

                        <div class="flex items-center mb-2 gap-2">

                            {#if groupField === "groupId" && group.key !== "none"}
                                <Icon
                                    name={group.key.replace("wiki_group_monster_", "")}
                                    class="text-gray-700 dark:text-gray-300 {group.groupId === "none" ? 'w-0 h-0' : 'w-6 h-6'}"
                                />
                            {/if}

                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk">
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
                            {#each group.list as enemy (enemy.id)}
                                {#if $splitEquipmentView}
                                    <button
                                        tabindex="0"
                                        type="button"
                                        class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                        on:click|preventDefault|stopPropagation={() => selectEnemy(enemy.id)}
                                    >
                                        <WeaponCard
                                            weapon={enemy}
                                            isEnemy={true}
                                            hideDarkness={true}
                                            hidePot={false}
                                            asLink={false}
                                            className="w-full h-full"
                                        />
                                        {#if selectedEnemyId === enemy.id}
                                            <div
                                                class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                            ></div>
                                        {/if}
                                    </button>
                                {:else}
                                    <div class="flex justify-center transition-transform">
                                        <WeaponCard
                                            weapon={enemy}
                                            isEnemy={true}
                                            hideDarkness={true}
                                            hidePot={false}
                                        />
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/each}
            {:else}
                <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start animate-fadeIn">
                    {#each displayedFlat as enemy (enemy.id)}
                        {#if $splitEquipmentView}
                            <button
                                tabindex="0"
                                type="button"
                                class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                on:click|preventDefault|stopPropagation={() => selectEnemy(enemy.id)}
                            >
                                <WeaponCard weapon={enemy} isEnemy={true} hideDarkness={true} hidePot={false} isNew={enemy.isNew} asLink={false} className="w-full h-full" />
                                {#if selectedEnemyId === enemy.id}
                                    <div
                                        class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                    ></div>
                                {/if}
                            </button>
                        {:else}
                            <div class="flex justify-center transition-transform">
                                <WeaponCard weapon={enemy} isEnemy={true} hideDarkness={true} hidePot={false} isNew={enemy.isNew} />
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}

            {#if (isGrouped && displayLimit < groupedArray.length) || (!isGrouped && flatDisplayLimit < filteredEnemies.length)}
                <div class="w-full h-24 mt-4 flex items-center justify-center opacity-50">
                    <div class="w-8 h-8 animate-spin dark:text-white">
                        <Icon name="loading" class="w-8 h-8 opacity-100" />
                    </div>
                </div>
            {/if}

            {#if filteredEnemies.length === 0}
                <div class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#444]">
                    <Icon name="noData" class="w-10 h-10 mb-3 opacity-30" />
                    <p class="text-sm font-medium">
                        {$t("emptyState.noData")}
                    </p>
                </div>
            {/if}
        </div>
    </div>

    {#if $splitEquipmentView}
        <BottomSheet
            bind:isOpen={isBottomSheetOpen}
            className="xl:sticky xl:top-6 xl:w-[770px] xl:max-w-[770px] shrink-0"
        >
            <div class="w-full min-h-[50vh] h-full xl:h-auto xl:max-h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar pb-8">
                {#if selectedEnemyId}
                    <EnemyDetailsView
                        id={selectedEnemyId}
                        showBackButton={false}
                    />
                {:else}
                    <div class="text-center py-20 px-6 text-gray-400 italic bg-white dark:bg-[#2b2b2b] rounded-3xl border border-gray-200 dark:border-[#444] shadow-sm flex flex-col items-center justify-center h-full xl:h-[calc(100vh-64px)] w-full">
                        <Icon name="noData" class="w-12 h-12 mb-3 opacity-30 mx-auto" />
                        <h3 class="text-lg font-bold text-[#21272C] dark:text-[#E4E4E4] not-italic mb-1 font-sdk">
                            {$t("emptyState.nothingSelected")}
                        </h3>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 not-italic max-w-[320px]">
                            {$t("emptyState.clickEnemyHint")}
                        </p>
                    </div>
                {/if}
            </div>
        </BottomSheet>
    {/if}
</div>

{#if $splitEquipmentView && !isBottomSheetOpen && selectedEnemyId}
    <button
        type="button"
        class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
        on:click={() => (isBottomSheetOpen = true)}
        title="Details"
    >
        <Icon name="inbox" class="w-6 h-6 text-black" />
    </button>
{/if}