<script>
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import WeaponFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/WeaponFilterDropdown.svelte";
    import SortSelectorDropdown from "$lib/components/dataToolbarV2/sortDropdowns/SortSelectorDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { weapons } from "$lib/data/weapons.js";
    import { t } from "$lib/i18n";
    import { accountStore } from "$lib/stores/accounts";
    import {
        getWeaponFilters,
        getWeaponSortOptions,
        weaponFilters,
        weaponOwnedOnly,
        weaponSearch
    } from "$lib/stores/filterStore";
    import { manualPotentials } from "$lib/stores/potentials";
    import { pullData } from "$lib/stores/pulls";

    $: selectedFilters = $weaponFilters;
    $: searchQuery = $weaponSearch;
    $: showOwnedOnly = $weaponOwnedOnly;

    const allWeapons = Object.values(weapons || {}).filter(
        (wp) => wp && wp.id
    );

    let sortOptions = getWeaponSortOptions();
    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let showOwnedOnly = false;

    const { selectedId } = accountStore;

    $: filteredWeapons = allWeapons
        .filter((wp) => {
            if (showOwnedOnly) {
                const activeId = $selectedId;
                const manualPots = $manualPotentials[activeId] || {}; 
                
                let pullsCount = 0;
                if ($pullData) {
                    Object.values($pullData).forEach(banner => {
                        const pulls = banner?.pulls || [];
                        pullsCount += pulls.filter(p => 
                            p.id === wp.id || 
                            p.name === wp.id || 
                            p.itemId === wp.id || 
                            (p.name && wp.name && p.name.toLowerCase() === wp.name.toLowerCase())
                        ).length;
                    });
                }
                
                const basePot = pullsCount > 0 ? pullsCount - 1 : -1;
                const finalPot = manualPots[wp.id] !== undefined ? manualPots[wp.id] : basePot;
                
                if (finalPot < 0) return false;
            }

            const locName = ($t(`weaponsList.${wp.id}`) || "").toLowerCase();
            const query = searchQuery.toLowerCase().trim();
            const baseName = (wp.name || "").toLowerCase();
            const idName = wp.id.toLowerCase();

            const matchesSearch =
                !query ||
                baseName.includes(query) ||
                locName.includes(query) ||
                idName.includes(query);

            if (!matchesSearch) return false;
            
            const matchesRarity = filterCheck(selectedFilters.rarity, wp.rarity);
            const wpType = wp.type || wp.weapon;
            const matchesType = filterCheckLowerCase(selectedFilters.type, wpType);
            const passesAttr1 = wp.skills?.some((skill) => filterCheck(selectedFilters.attr1, skill));
            const passesAttr2 = wp.skills?.some((skill) => filterCheck(selectedFilters.attr2, skill));
            const passesAttr3 = wp.skills?.some((skill) => filterCheck(selectedFilters.attr3, skill));

            return matchesRarity && matchesType && passesAttr1 && passesAttr2 && passesAttr3;
        })
        .sort((a, b) => {
            let valA = sortField === "type" ? a.type || a.weapon : a[sortField];
            let valB = sortField === "type" ? b.type || b.weapon : b[sortField];
            if (sortField === "rarity") {
                let rarityDiff = sortDirection === "asc" ? valA - valB : valB - valA;
                if (rarityDiff === 0) {
                    let typeA = String(a.type || a.weapon || "");
                    let typeB = String(b.type || b.weapon || "");
                    return typeA.localeCompare(typeB);
                }
                return rarityDiff;
            }
            if (!valA) valA = "";
            if (!valB) valB = "";
            let compareResult = sortDirection === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
            if (sortField === "type" && compareResult === 0) {
                return (b.rarity || 0) - (a.rarity || 0); 
            }
            return compareResult;
        });

    function filterCheck(filterParamSet, value) {
        if (!filterParamSet || filterParamSet.size === 0) {
            return true;
        }

        return filterParamSet.has(value);
    }

    function filterCheckLowerCase(filterParamSet, value) {
        if (!filterParamSet || filterParamSet.size === 0) {
            return true;
        }

        const valueLowerCase = value.toLowerCase();

        for (let param of filterParamSet) {
            if (param.toLowerCase() === valueLowerCase) {
                return true;
            }
        }

        return false;
    }

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters)
        .some((set) => set.size > 0);

    let displayLimit = 40;
    $: if (searchQuery !== undefined || selectedFilters || sortField || sortDirection || showOwnedOnly) {
        displayLimit = 40;
    }
    $: displayedWeapons = filteredWeapons.slice(0, displayLimit);

    function infiniteScroll(node) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && displayLimit < filteredWeapons.length) {
                displayLimit += 40; 
            }
        }, { rootMargin: "400px" });
        observer.observe(node);
        return { destroy() { observer.disconnect(); } };
    }
</script>

<div class="max-w-[100%] max-h-[100%] justify-start min-h-screen">
    
    <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
        <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
            {$t("pages.weapons") || "Weapons"}
        </h2>
        <span class="text-gray-400 text-xl md:text-3xl font-normal">
            / {filteredWeapons.length}
        </span>
    </div>

    <div class="w-full xl:w-[70%] mb-4">
<!--        <DataToolbar-->
<!--            bind:sortField-->
<!--            bind:sortDirection-->
<!--            bind:filters={$weaponFilters} -->
<!--            bind:searchQuery={$weaponSearch} -->
<!--            bind:manualMode={$weaponManual}-->
<!--            bind:showOwnedOnly={$weaponOwnedOnly}-->
<!--            mode="weapons" -->
<!--        />-->

        <DataToolbar
            showSortDropdownButton={true}
            showSortDirectionButton={true}
            showFilterDropdownButton={true}
            showSearchInput={true}
            isFilterActive={isFilterActive}
            onFilterReset={() => $weaponFilters = {}}
            bind:searchString={$weaponSearch}
            bind:sortDirection={sortDirection}
        >

            <SortSelectorDropdown
                slot="sortDropdown"
                optionList={sortOptions}
                bind:selectedOption={sortField}
            />

            <WeaponFilterDropdown
                slot="filterDropdown"
                filters={getWeaponFilters()}
                bind:selectedFilters={$weaponFilters}
                bind:showOwnedOnly={$weaponOwnedOnly}
            />

        </DataToolbar>

    </div>

    <div class="w-full xl:w-[85%] pb-8">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,100px)] gap-5 justify-start">
            {#each displayedWeapons as wp (wp.id)}
                <div class="flex justify-center">
                    <WeaponCard weapon={wp} isNew={wp.isNew}/>
                </div>
            {/each}
        </div>

        {#if displayLimit < filteredWeapons.length}
            <div use:infiniteScroll class="h-10 w-full mt-4"></div>
        {/if}

        {#if filteredWeapons.length === 0}
            <div class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#444]">
                <Icon name="noData" class="w-10 h-10 mb-3 opacity-30" />
                <p class="text-sm font-medium">
                    {$t("emptyState.noData") || "No weapons found"}
                </p>
            </div>
        {/if}
    </div>
</div>