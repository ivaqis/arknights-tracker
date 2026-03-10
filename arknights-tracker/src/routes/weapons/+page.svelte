<script>
    import { t } from "$lib/i18n";
    import { weapons } from "$lib/data/weapons.js"; 
    import { pullData } from "$lib/stores/pulls";
    import { manualPotentials } from "$lib/stores/potentials";
    import { accountStore } from "$lib/stores/accounts";

    import WeaponCard from "$lib/components/WeaponCard.svelte";
    import DataToolbar from "$lib/components/DataToolbar.svelte";
    import Icon from "$lib/components/Icons.svelte";

    const allWeapons = Object.values(weapons || {}).filter(
        (wp) => wp && wp.id
    );
    
    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let showOwnedOnly = false;
    
    let filters = {
        rarity: [6, 5, 4, 3],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"], 
    };

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
            
            const matchesRarity = filters.rarity.length === 0 || filters.rarity.includes(wp.rarity);
            const wpType = wp.type || wp.weapon;
            const matchesType = filters.type.length === 0 || (wpType && filters.type.some(w => w.toLowerCase() === wpType.toLowerCase()));

            return matchesRarity && matchesType;
        })
        .sort((a, b) => {
            let valA = sortField === "type" ? (a.type || a.weapon) : a[sortField];
            let valB = sortField === "type" ? (b.type || b.weapon) : b[sortField];
            
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
        <DataToolbar
            bind:sortField
            bind:sortDirection
            bind:searchQuery
            bind:filters
            bind:showOwnedOnly
            mode="weapons" 
        />
    </div>

    <div class="w-full xl:w-[80%] pb-8">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,100px)] gap-4 justify-start">
            {#each filteredWeapons as wp (wp.id)}
                <div class="flex justify-center">
                    <WeaponCard weapon={wp} isNew={wp.isNew}/>
                </div>
            {/each}
        </div>

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