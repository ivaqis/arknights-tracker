<script>
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
    let sortField = "rarity";
    let sortDirection = "desc";
    let filters = getEnemyFilters();

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

    let displayLimit = 4;
    let flatDisplayLimit = 60;

    $: {
        const _trigger = [searchQuery, sortField, sortDirection, isGrouped, selectedFilters];
        displayLimit = 4;
        flatDisplayLimit = 60;
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
</script>

<svelte:window on:scroll={checkScroll} on:resize={checkScroll} />

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen">
    
    <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
        <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
            {$t("pages.enemies") || "Enemies"}
        </h2>
        <span class="text-gray-400 text-xl md:text-3xl font-normal">
            / {filteredEnemies.length}
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

    <div class="w-full xl:w-[85%] pb-12 flex flex-col gap-5 relative">
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

                    <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,100px)] gap-5 justify-start">
                        {#each group.items as enemy (enemy.id)}
                            <div class="flex justify-center transition-transform">
                                <WeaponCard weapon={enemy} isEnemy={true} hideDarkness={true} hidePot={false}/>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else}
            <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,100px)] gap-5 justify-start animate-fadeIn">
                {#each displayedFlat as enemy (enemy.id)}
                    <div class="flex justify-center transition-transform">
                        <WeaponCard weapon={enemy} isEnemy={true} hideDarkness={true} hidePot={false} isNew={enemy.isNew} />
                    </div>
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
                    {$t("emptyState.noData") || "No data"}
                </p>
            </div>
        {/if}
    </div>
</div>