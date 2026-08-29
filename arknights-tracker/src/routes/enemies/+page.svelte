<script module>
    let savedDisplayLimit = 4;
    let savedFlatDisplayLimit = 60;
    let savedSortField = "rarity";
    let savedSortDirection = "desc";
</script>

<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import EnemyDetailsView from "$lib/components/enemies/EnemyDetailsView.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import EnemyFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/EnemyFilterDropdown.svelte";
    import SortSelectorDropdown from "$lib/components/dataToolbarV2/sortDropdowns/SortSelectorDropdown.svelte";
    import { t } from "$lib/i18n";
    import { enemies } from "$lib/data/enemies.js";
    import { enemyFilters, enemySearch, enemyGroupMode, getEnemyFilters } from "$lib/stores/filterStore";

    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { filterCheck } from "$lib/utils/filterUtils.js";

    $: searchQuery = $enemySearch || "";
    $: isGrouped = $enemyGroupMode || false;
    $: selectedFilters = $enemyFilters;

    const allEnemies = Object.values(enemies || {}).filter(
        (e) => e && e.id
    );

    let sortFieldList = ["rarity"];
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

    $: filteredEnemies = (() => {
        const baseFiltered = allEnemies.filter((enemy) => {
            const translationKey = `enemies.${enemy.id}`;
            const translatedName = $t(translationKey);

            if (translatedName === translationKey) return false;

            const matchesRarity = filterCheck(selectedFilters.rarity, enemy.rarity);
            if (!matchesRarity) return false;

            const locName = translatedName.toLowerCase();
            const query = searchQuery.toLowerCase().trim();
            const baseName = (enemy.name || "").toLowerCase();
            const idName = enemy.id.toLowerCase();
            
            return !query ||
                baseName.includes(query) ||
                locName.includes(query) ||
                idName.includes(query);
        });

        return baseFiltered.sort((a, b) => {
            let diff = 0;

            if (sortField === "rarity") {
                const rarA = a.rarity || 0;
                const rarB = b.rarity || 0;
                diff = rarA - rarB;
            } else {
                let valA = a[sortField] || "";
                let valB = b[sortField] || "";
                diff = String(valA).localeCompare(String(valB));
            }
            
            if (diff === 0) {
                return a.id.localeCompare(b.id);
            }

            return sortDirection === "asc" ? diff : -diff;
        });
    })();

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters)
        .some((set) => set.size > 0);

    $: groupedEnemies = filteredEnemies.reduce((groups, e) => {
        const groupKey = e.groupId || "none";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(e);
        return groups;
    }, {});

    $: groupedArray = Object.entries(groupedEnemies)
        .map(([groupId, items]) => ({
            groupId,
            items,
            maxRarity: Math.max(...items.map((i) => i.rarity || 1)),
        }))
        .sort((a, b) => {
            const isNoneA = a.groupId === "none" || a.groupId === "";
            const isNoneB = b.groupId === "none" || b.groupId === "";

            if (isNoneA && !isNoneB) return 1;
            if (!isNoneA && isNoneB) return -1;
            
            if (sortDirection === "desc") {
                return b.maxRarity - a.maxRarity || a.groupId.localeCompare(b.groupId);
            }
            return a.maxRarity - b.maxRarity || a.groupId.localeCompare(b.groupId);
        });

    let displayLimit = savedDisplayLimit;
    let flatDisplayLimit = savedFlatDisplayLimit;

    let initialRender = true;

    $: {
        const _trigger = [searchQuery, sortField, sortDirection, isGrouped, selectedFilters];
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
                showGroupButton={true}
                isFilterActive={isFilterActive}
                onFilterReset={() => $enemyFilters = {}}
                bind:isGrouped={$enemyGroupMode}
                bind:searchString={$enemySearch}
                bind:sortDirection={sortDirection}
            >
                <SortSelectorDropdown
                    slot="sortDropdown"
                    optionList={sortFieldList}
                    bind:selectedOption={sortField}
                />

                <EnemyFilterDropdown
                    slot="filterDropdown"
                    filters={filters}
                    bind:selectedFilters={$enemyFilters}
                />
            </DataToolbar>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[85%]'} pb-12 flex flex-col gap-5 relative">
            {#if isGrouped}
                {#each displayedGroups as group}
                    <div class="flex flex-col gap-1 animate-fadeIn">
                        <div class="flex items-center mb-2 {group.groupId === "none" ? 'gap-0' : 'gap-3'}">
                            <Icon name={group.groupId.replace('wiki_group_monster_', '')} class="text-gray-700 dark:text-gray-300 {group.groupId === "none" ? 'w-0 h-0' : 'w-6 h-6'}" />
                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk">
                                {group.groupId === "none" 
                                    ? ($t("global.noData") || "No data") 
                                    : ($t(`enemiesGroups.${group.groupId}`) || group.groupId)}
                            </h3>
                        </div>

                        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">
                            {#each group.items as enemy (enemy.id)}
                                {#if $splitEquipmentView}
                                    <button
                                        tabindex="0"
                                        type="button"
                                        class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                        on:click|preventDefault|stopPropagation={() => selectEnemy(enemy.id)}
                                    >
                                        <WeaponCard weapon={enemy} isEnemy={true} hideDarkness={true} hidePot={false} asLink={false} className="w-full h-full" />
                                        {#if selectedEnemyId === enemy.id}
                                            <div
                                                class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                            ></div>
                                        {/if}
                                    </button>
                                {:else}
                                    <div class="flex justify-center transition-transform">
                                        <WeaponCard weapon={enemy} isEnemy={true} hideDarkness={true} hidePot={false}/>
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