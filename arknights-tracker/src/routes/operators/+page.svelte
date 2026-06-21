<script>
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import OperatorFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/OperatorFilterDropdown.svelte";
    import SortSelectorDropdown from "$lib/components/dataToolbarV2/sortDropdowns/SortSelectorDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { characters } from "$lib/data/characters.js";
    import { t } from "$lib/i18n";
    import { accountStore } from "$lib/stores/accounts";
    import {
        getOperatorFilters,
        getOperatorSortOptions,
        operatorFilters,
        operatorOwnedOnly,
        operatorSearch
    } from "$lib/stores/filterStore";
    import { manualPotentials } from "$lib/stores/potentials";
    import { pullData } from "$lib/stores/pulls";
    import { filterCheck, filterCheckLowerCase, getBaseSkillMappedFilter } from "$lib/utils/filterUtils.js";

    $: selectedFilters = $operatorFilters;
    $: searchQuery = $operatorSearch;
    $: showOwnedOnly = $operatorOwnedOnly;

    $: selectedMaterial = selectedFilters.skillMaterial?.values().next().value ?? null;
    let selectedSkillMaterialType = "any";

    const allOperators = Object.values(characters || {}).filter(
        (op) => op && op.id,
    );

    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let showOwnedOnly = false;

    const { selectedId } = accountStore;

    const characterDataModules = import.meta.glob("/src/lib/data/charactersData/*.json", { eager: false });
    let characterDetailsMap = {};
    let isDataLoaded = false;
    let loadingPromise = null;

    async function loadCharacterData() {
        if (isDataLoaded) return;
        if (loadingPromise) return loadingPromise;

        loadingPromise = (async () => {
            const promises = Object.entries(characterDataModules).map(async ([_, importFn]) => {
                const mod = await importFn();
                const charData = mod.default || mod;
                if (charData && charData.id) {
                    characterDetailsMap[charData.id] = charData;
                }
            });
            await Promise.all(promises);
            isDataLoaded = true;
            characterDetailsMap = { ...characterDetailsMap };
        })();

        return loadingPromise;
    }

    loadCharacterData();

    function getSkillMaterialCount(opId, matId, category) {
        if (!matId) return 0;
        const charDetails = characterDetailsMap[opId];
        if (!charDetails || !charDetails.materials) return 0;

        const materials = charDetails.materials;
        let total = 0;

        const keysToCheck = [];
        const isAny = !category || category === "any";

        if (isAny || category === "basic_combo") {
            for (let r = 2; r <= 12; r++) {
                keysToCheck.push(`basicAttackRank${r}`);
                keysToCheck.push(`comboSkillRank${r}`);
            }
        }
        if (isAny || category === "battle_ultimate") {
            for (let r = 2; r <= 12; r++) {
                keysToCheck.push(`battleSkillRank${r}`);
                keysToCheck.push(`ultimateRank${r}`);
            }
        }
        if (isAny || category === "ascension") {
            for (let r = 1; r <= 10; r++) {
                keysToCheck.push(`ascention${r}`);
            }
        }

        keysToCheck.forEach(key => {
            const list = materials[key];
            if (Array.isArray(list)) {
                list.forEach(item => {
                    if (item.name === matId) {
                        total += item.amount;
                    }
                });
            }
        });

        return total;
    }

    $: filteredOperators = (() => {
        const _ = characterDetailsMap;
        return allOperators
            .filter((op) => {
                if (showOwnedOnly) {
                    const isEndmin = op.id === "endministrator1" || op.id === "endministrator2";
                    let isOwned = isEndmin;

                    if (!isOwned) {
                        const activeId = $selectedId;
                        const manualPots = $manualPotentials[activeId] || {};
                        
                        let pullsCount = 0;
                        if ($pullData) {
                            Object.values($pullData).forEach(banner => {
                                const pulls = banner?.pulls || [];
                                pullsCount += pulls.filter(p => 
                                    p.id === op.id || 
                                    p.name === op.id || 
                                    p.itemId === op.id || 
                                    (p.name && op.name && p.name.toLowerCase() === op.name.toLowerCase())
                                ).length;
                            });
                        }
                        
                        const basePot = pullsCount > 0 ? pullsCount - 1 : -1;
                        const finalPot = manualPots[op.id] !== undefined ? manualPots[op.id] : basePot;
                        isOwned = finalPot >= 0;
                    }

                    if (!isOwned) return false;
                }

                const locName = ($t(`characters.${op.id}`) || "").toLowerCase();
                const query = searchQuery.toLowerCase();
                
                const matchesSearch =
                    !query ||
                    op.name.toLowerCase().includes(query) ||
                    (op.id && op.id.toLowerCase().includes(query)) ||
                    locName.includes(query);

                if (!matchesSearch) return false;
                
                const matchesRarity = filterCheck(selectedFilters.rarity, op.rarity);
                const matchesClass = filterCheckLowerCase(selectedFilters.class, op.class ?? "");
                const matchesElement = filterCheckLowerCase(selectedFilters.element, op.element ?? "");
                const matchesWeapon = filterCheckLowerCase(selectedFilters.weapon, op.weapon);

                if (selectedMaterial) {
                    const count = getSkillMaterialCount(op.id, selectedMaterial, selectedSkillMaterialType);
                    if (count === 0) return false;
                }

                if (selectedFilters.baseSkill && selectedFilters.baseSkill.size > 0) {
                    const charDetails = characterDetailsMap[op.id];
                    if (!charDetails || !charDetails.facSkills) return false;
                    let hasMatch = false;
                    for (const key of Object.keys(charDetails.facSkills)) {
                        const skill = charDetails.facSkills[key];
                        if (skill && skill.name) {
                            const mappedFilter = getBaseSkillMappedFilter(op.id, skill.name);
                            if (selectedFilters.baseSkill.has(mappedFilter)) {
                                hasMatch = true;
                                break;
                            }
                        }
                    }
                    if (!hasMatch) return false;
                }

                return matchesRarity && matchesClass && matchesElement && matchesWeapon;
            })
            .sort((a, b) => {
                let valA = sortField === "weapon" ? a.weapon : a[sortField];
                let valB = sortField === "weapon" ? b.weapon : b[sortField];
                
                if (sortField === "rarity") {
                    return sortDirection === "asc" ? valA - valB : valB - valA;
                }
                if (!valA) valA = "";
                if (!valB) valB = "";

                return sortDirection === "asc"
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            });
    })();

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters).some((set) => set.size > 0)
        || showOwnedOnly;

    function resetFilters() {
        $operatorFilters = {};
        $operatorOwnedOnly = false;
    }

    let displayLimit = 40;
    $: if (searchQuery !== undefined || filters || sortField || sortDirection || showOwnedOnly) {
        displayLimit = 40;
    }
    $: displayedOperators = filteredOperators.slice(0, displayLimit);

    function infiniteScroll(node) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && displayLimit < filteredOperators.length) {
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
            {$t("pages.operators") || "Operators"}
        </h2>
        <span class="text-gray-400 text-xl md:text-3xl font-normal">
            / {filteredOperators.length}
        </span>
    </div>

    <div class="w-full xl:w-[70%] mb-4">

        <DataToolbar
            showSortDropdownButton={true}
            showSortDirectionButton={true}
            showFilterDropdownButton={true}
            showSearchInput={true}
            isFilterActive={isFilterActive}
            onFilterReset={resetFilters}
            bind:searchString={$operatorSearch}
            bind:sortDirection={sortDirection}
        >

            <SortSelectorDropdown
                slot="sortDropdown"
                optionList={getOperatorSortOptions()}
                bind:selectedOption={sortField}
            />

            <OperatorFilterDropdown
                slot="filterDropdown"
                filters={getOperatorFilters()}
                onFilterReset={resetFilters}
                bind:selectedFilters={$operatorFilters}
                bind:showOwnedOnly={$operatorOwnedOnly}
                bind:selectedSkillMaterialType={selectedSkillMaterialType}
            />

        </DataToolbar>

    </div>

    <div class="w-full xl:w-[80%] pb-8">
        <div
            class="grid grid-cols-[repeat(auto-fill,120px)] gap-4 justify-center md:justify-start"
        >
            {#each filteredOperators as op (op.id)}
                <div class="flex justify-center">
                    <OperatorCard 
                        operator={op} 
                        isNew={op.isNew} 
                        materialIcon={selectedMaterial}
                        materialCount={getSkillMaterialCount(op.id, selectedMaterial, selectedSkillMaterialType)}
                        baseSkills={characterDetailsMap[op.id]?.facSkills}
                        activeBaseSkillFilters={selectedFilters.baseSkill}
                    />
                </div>
            {/each}
        </div>

        {#if filteredOperators.length === 0}
            <div
                class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center"
            >
                <Icon name="noData" class="w-4 h-4" />
                <p class="text-sm">
                    {$t("emptyState.noData")}
                </p>
            </div>
        {/if}
    </div>
</div>
