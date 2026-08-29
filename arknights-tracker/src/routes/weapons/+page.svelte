<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import WeaponDetailsView from "$lib/components/weapons/WeaponDetailsView.svelte";
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import WeaponFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/WeaponFilterDropdown.svelte";
    import SortSelectorDropdown from "$lib/components/dataToolbarV2/sortDropdowns/SortSelectorDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import Image from "$lib/components/Image.svelte";
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
    import { filterCheck, filterCheckLowerCase } from "$lib/utils/filterUtils.js";
    import { weaponEssences } from "$lib/stores/weaponEssences.js";

    let zoomMapUrl = null;
    let selectedWeaponZoom = null;

    $: selectedFilters = $weaponFilters;
    $: searchQuery = $weaponSearch;
    $: showOwnedOnly = $weaponOwnedOnly;

    const allWeapons = Object.values(weapons || {}).filter(
        (wp) => wp && wp.id
    );

    let sortField = "rarity";
    let sortDirection = "desc";

    const { selectedId } = accountStore;
    $: accountEssences = $weaponEssences[$selectedId] || {};

    $: queryId = $page.url.searchParams.get("id");
    let selectedWeaponId = "";
    let isBottomSheetOpen = false;

    $: {
        if (queryId && allWeapons.some(w => w.id === queryId)) {
            selectedWeaponId = queryId;
            isBottomSheetOpen = true;
            if (typeof localStorage !== "undefined" && $splitEquipmentView) {
                localStorage.setItem("last_selected_weapon_id", queryId);
            }
        } else if (!queryId) {
            selectedWeaponId = "";
            isBottomSheetOpen = false;
        }
    }

    onMount(() => {
        if (queryId && allWeapons.some(w => w.id === queryId)) {
            if (!$splitEquipmentView) {
                goto(`/weapons/${queryId}`, { replaceState: true });
            } else {
                localStorage.setItem("last_selected_weapon_id", queryId);
            }
        } else if (!queryId && $splitEquipmentView) {
            const savedId = localStorage.getItem("last_selected_weapon_id");
            if (savedId && allWeapons.some(w => w.id === savedId)) {
                selectWeapon(savedId, true);
            }
        }
    });

    function selectWeapon(wpId, forceSelect = false) {
        if (!wpId || (!forceSelect && selectedWeaponId === wpId)) {
            selectedWeaponId = "";
            isBottomSheetOpen = false;
            if ($splitEquipmentView) {
                localStorage.removeItem("last_selected_weapon_id");
                const url = new URL(window.location.href);
                url.searchParams.delete("id");
                goto(url.pathname, { replaceState: true, noScroll: true, keepFocus: true });
            }
            return;
        }

        selectedWeaponId = wpId;
        isBottomSheetOpen = true;
        if ($splitEquipmentView) {
            localStorage.setItem("last_selected_weapon_id", wpId);
            const url = new URL(window.location.href);
            url.searchParams.set("id", wpId);
            goto(url.search, { replaceState: true, noScroll: true, keepFocus: true });
        }
    }

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
            const wpEssence = accountEssences[wp.id] || 0;
            const matchesEssence = filterCheck(selectedFilters.essence, wpEssence);
            const passesAttr1 = wp.skills?.some((skill) => filterCheck(selectedFilters.attr1, skill));
            const passesAttr2 = wp.skills?.some((skill) => filterCheck(selectedFilters.attr2, skill));
            const passesAttr3 = wp.skills?.some((skill) => filterCheck(selectedFilters.attr3, skill));

            return matchesRarity && matchesType && matchesEssence && passesAttr1 && passesAttr2 && passesAttr3;
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

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters).some((set) => set.size > 0)
        || showOwnedOnly;

    function resetFilters() {
        $weaponFilters = {};
        $weaponOwnedOnly = false;
    }

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

<svelte:head>
    <title>{$t("pages.weapons")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.weapons")} />
    <meta property="og:title" content={`${$t("pages.weapons")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.weapons")} />
</svelte:head>

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full {$splitEquipmentView ? 'flex flex-col xl:flex-row justify-between items-start' : ''}">
    <div class="w-full {$splitEquipmentView ? 'xl:w-[calc(100%-min(770px,45%))] xl:mr-6' : ''}">
        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.weapons")}
            </h2>
            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {filteredWeapons.length}
            </span>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[70%]'} mb-4">
            <DataToolbar
                showSortDropdownButton={true}
                showSortDirectionButton={true}
                showFilterDropdownButton={true}
                showSearchInput={true}
                isFilterActive={isFilterActive}
                onFilterReset={resetFilters}
                bind:searchString={$weaponSearch}
                bind:sortDirection={sortDirection}
            >
                <SortSelectorDropdown
                    slot="sortDropdown"
                    optionList={getWeaponSortOptions()}
                    bind:selectedOption={sortField}
                />

                <WeaponFilterDropdown
                    slot="filterDropdown"
                    filters={getWeaponFilters()}
                    onFilterReset={resetFilters}
                    bind:selectedFilters={$weaponFilters}
                    bind:showOwnedOnly={$weaponOwnedOnly}
                />
            </DataToolbar>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[85%]'} pb-8">
            <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">
                {#each displayedWeapons as wp (wp.id)}
                    {#if $splitEquipmentView}
                        <button
                            tabindex="0"
                            type="button"
                            class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                            on:click|preventDefault|stopPropagation={() => selectWeapon(wp.id)}
                        >
                            <WeaponCard weapon={wp} isNew={wp.isNew} asLink={false} className="w-full h-full" />
                            {#if selectedWeaponId === wp.id}
                                <div
                                    class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                ></div>
                            {/if}
                        </button>
                    {:else}
                        <div class="flex justify-center">
                            <WeaponCard weapon={wp} isNew={wp.isNew} />
                        </div>
                    {/if}
                {/each}
            </div>

            {#if displayLimit < filteredWeapons.length}
                <div use:infiniteScroll class="h-10 w-full mt-4"></div>
            {/if}

            {#if filteredWeapons.length === 0}
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
                {#if selectedWeaponId}
                    <WeaponDetailsView
                        id={selectedWeaponId}
                        showBackButton={false}
                        onZoomImage={(code) => zoomMapUrl = code}
                        onZoomWeaponImage={(variant) => selectedWeaponZoom = { id: selectedWeaponId, variant }}
                    />
                {:else}
                    <div class="text-center py-20 px-6 text-gray-400 italic bg-white dark:bg-[#2b2b2b] rounded-3xl border border-gray-200 dark:border-[#444] shadow-sm flex flex-col items-center justify-center h-full xl:h-[calc(100vh-64px)] w-full">
                        <Icon name="noData" class="w-12 h-12 mb-3 opacity-30 mx-auto" />
                        <h3 class="text-lg font-bold text-[#21272C] dark:text-[#E4E4E4] not-italic mb-1 font-sdk">
                            {$t("emptyState.nothingSelected")}
                        </h3>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 not-italic max-w-[320px]">
                            {$t("emptyState.clickWeaponHint")}
                        </p>
                    </div>
                {/if}
            </div>
        </BottomSheet>
    {/if}
</div>

{#if $splitEquipmentView && !isBottomSheetOpen && selectedWeaponId}
    <button
        type="button"
        class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
        on:click={() => (isBottomSheetOpen = true)}
        title="Details"
    >
        <Icon name="inbox" class="w-6 h-6 text-black" />
    </button>
{/if}

<Modal isOpen={!!zoomMapUrl} on:close={() => (zoomMapUrl = null)}>
    {#if zoomMapUrl}
        <div
            class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center group pointer-events-auto"
        >
            <img
                src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{zoomMapUrl}.jpg"
                alt="Map full screen"
                class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
                referrerpolicy="no-referrer"
            />

            <button
                type="button"
                class="absolute -top-12 right-0 md:-right-12 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                on:click={() => (zoomMapUrl = null)}
            >
                <Icon name="close" class="w-6 h-6 text-white" />
            </button>
        </div>
    {/if}
</Modal>

{#if selectedWeaponZoom}
    <div
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        class="md:ml-[var(--sb-w)] fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 animate-fadeIn outline-none cursor-zoom-out overflow-hidden"
        on:click={() => (selectedWeaponZoom = null)}
        on:keydown={(e) =>
            (e.key === "Enter" || e.key === "Escape" || e.key === " ") &&
            (selectedWeaponZoom = null)}
    >
        <div
            role="presentation"
            class="relative max-w-full max-h-[90vh] flex items-center justify-center cursor-auto"
            on:click|stopPropagation
            on:keydown|stopPropagation
        >
            <Image
                id={selectedWeaponZoom.id}
                variant={selectedWeaponZoom.variant}
                interactive={true}
                className="max-w-full max-h-[90vh] object-contain rounded-lg drop-shadow-2xl select-none"
                alt="{selectedWeaponZoom.id} Full"
            />

            <button
                class="absolute -top-4 -right-4 md:top-4 md:right-4 p-3 bg-black/40 hover:bg-[#FFD800] text-white hover:text-black rounded-full transition-colors backdrop-blur-sm z-10 shadow-lg"
                on:click={() => (selectedWeaponZoom = null)}
            >
                <Icon name="close" class="w-6 h-6" />
            </button>
        </div>
    </div>
{/if}