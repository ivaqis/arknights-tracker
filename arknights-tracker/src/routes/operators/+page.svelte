<script>
    import { goto } from "$app/navigation";
    import { t } from "$lib/i18n";
    import { characters } from "$lib/data/characters.js";
    import { pullData } from "$lib/stores/pulls";
    import { manualPotentials } from "$lib/stores/potentials";
    import { accountStore } from "$lib/stores/accounts";
    import { operatorFilters, operatorSearch, operatorManual, operatorOwnedOnly } from '$lib/stores/filterStore';

    import OperatorCard from "$lib/components/OperatorCard.svelte";
    import DataToolbar from "$lib/components/DataToolbar.svelte";
    import Icon from "$lib/components/Icons.svelte";

    $: filters = $operatorFilters;
    $: searchQuery = $operatorSearch;
    $: showOwnedOnly = $operatorOwnedOnly;

    const allOperators = Object.values(characters || {}).filter(
        (op) => op && op.id,
    );

    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let showOwnedOnly = false;
    
    let filters = {
        rarity: [6, 5, 4],
        class: ["guard", "vanguard", "caster", "defender", "supporter", "striker"],
        element: ["cryo", "physical", "nature", "heat", "electric"],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
    };

    const { selectedId } = accountStore;

    $: filteredOperators = allOperators
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
            
            const matchesRarity = filters.rarity.length === 0 || filters.rarity.includes(op.rarity);
            const matchesClass = filters.class.length === 0 || filters.class.some((c) => c.toLowerCase() === op.class?.toLowerCase());
            const matchesElement = filters.element.length === 0 || filters.element.some((e) => e.toLowerCase() === op.element?.toLowerCase());
            const matchesWeapon = filters.weapon.length === 0 || (op.weapon && filters.weapon.some((w) => w.toLowerCase() === op.weapon.toLowerCase()));

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
            bind:sortField
            bind:sortDirection
            bind:filters={$operatorFilters} 
            bind:searchQuery={$operatorSearch} 
            bind:manualMode={$operatorManual}
            bind:showOwnedOnly={$operatorOwnedOnly}
        />
    </div>

    <div class="w-full xl:w-[80%] pb-8">
        <div
            class="grid grid-cols-[repeat(auto-fill,120px)] gap-4 justify-center md:justify-start"
        >
            {#each filteredOperators as op (op.id)}
                <div class="flex justify-center">
                    <OperatorCard operator={op} isNew={op.isNew} />
                </div>
            {/each}
        </div>

        {#if filteredOperators.length === 0}
            <div
                class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center"
            >
                <Icon name="noData" class="w-4 h-4" />
                <p class="text-sm">
                    {$t("emptyState.noData") || "Нет данных"}
                </p>
            </div>
        {/if}
    </div>
</div>
