<script>
    import { t } from "$lib/i18n";
    import { equipment } from "$lib/data/items/equipment.js";
    import { pullData } from "$lib/stores/pulls";
    import { manualPotentials } from "$lib/stores/potentials";
    import { accountStore } from "$lib/stores/accounts";
    //import { onMount } from 'svelte'; //Убрать
    import {
        equipmentFilters,
        equipmentSearch,
        equipmentManual,
        equipmentGroupMode,
    } from "$lib/stores/filterStore";

    import WeaponCard from "$lib/components/WeaponCard.svelte";
    import DataToolbar from "$lib/components/DataToolbar.svelte";
    import Icon from "$lib/components/Icons.svelte";

    $: filters = $equipmentFilters;
    $: searchQuery = $equipmentSearch;
    $: isGrouped = $equipmentGroupMode;

    const allEquipment = Object.entries(equipment || {}).map(([id, data]) => ({
        id,
        ...data,
    }));

    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let showOwnedOnly = false;

    const availablePacks = [
        ...new Set(allEquipment.map((eq) => eq.pack).filter(Boolean)),
    ];
    //const available2Stats = [...new Set(allEquipment.flatMap(eq => (eq.displayAttr || []).map(a => a.attrType)))];
    const availableStats = [
        "Def",
        "Str",
        "Agi",
        "Wisd",
        "Will",
        "Atk",
        "CriticalRate",
        "UltimateSpGainScalar",
        "OriginiumArts",
        "Sub",
        "Main",
        "NormalSkillEfficiency",
        "ComboSkillEfficiency",
        "UltimateSkillEfficiency",
        "SpellDamageIncrease",
        "AllSkillDamageIncrease",
        "PhysicalDamageIncrease",
        "AttrDamageToBrokenUnitIncrease",
        "NormalAttackDamageIncrease",
        "CrystAndPulseDamageIncrease",
        "FireAndNaturalDamageIncrease",
        "MaxHp",
        "AllDamageTakenScalar",
        "HealOutputIncrease",
    ];

    // 0 - body, 1 - hand, 2 - edc
    let filters = {
        rarity: [5, 4, 3, 2, 1],
        partType: [0, 1, 2],
        pack: [],
        stats: {
            any: [],
            1: [],
            2: [],
            3: [],
        },
    };

    // onMount(() => {
    //     const allEquip = Object.values(equipment);
    //     const packs = [...new Set(allEquip.map(e => e.pack).filter(Boolean))];
    //     const stats = [...new Set(allEquip.flatMap(e => e.displayAttr?.map(a => a.attrType)).filter(Boolean))];
    //     console.log("const hardcodedPacks =", JSON.stringify(packs));
    //     console.log("const hardcodedStats =", JSON.stringify(stats));
    // });

    const { selectedId } = accountStore;

    $: filteredEquipment = (() => {
        const baseFiltered = [...allEquipment].filter((eq) => {
            if (showOwnedOnly) {
                const activeId = $selectedId;
                const manualPots = $manualPotentials[activeId] || {};
                const finalPot =
                    manualPots[eq.id] !== undefined ? manualPots[eq.id] : -1;
                if (finalPot < 0) return false;
            }

            const locName = ($t(`equipment.${eq.id}`) || "").toLowerCase();
            const query = searchQuery.toLowerCase().trim();
            const idName = (eq.id || "").toLowerCase();
            const matchesSearch =
                !query || locName.includes(query) || idName.includes(query);
            if (!matchesSearch) return false;
            const itemRarity = eq.rarity || 1;
            const matchesRarity =
                filters.rarity.length === 0 ||
                filters.rarity.includes(itemRarity);
            const itemPartType = eq.partType !== undefined ? eq.partType : 0;
            const matchesPart =
                filters.partType.length === 0 ||
                filters.partType.includes(itemPartType);
            const itemPack = eq.pack || "none";
            const matchesPack =
                filters.pack.length === 0 || filters.pack.includes(itemPack);
            const allItemAttributes = [
                ...(eq.equipAttr || []),
                ...(eq.displayAttr || []),
            ].map((a) => String(a.attrType || "").toLowerCase());
            const passesAny =
                filters.stats.any.length === 0 ||
                filters.stats.any.some((stat) =>
                    allItemAttributes.includes(String(stat).toLowerCase()),
                );
            if (!passesAny) return false;
            for (let i = 1; i <= 3; i++) {
                const required = filters.stats[i];
                if (required && required.length > 0) {
                    const statAtThisPos = allItemAttributes[i]; 
                    if (!statAtThisPos || !required.map(s => String(s).toLowerCase()).includes(statAtThisPos)) {
                        return false;
                    }
                }
            }
            return matchesRarity && matchesPart && matchesPack;
        });

        const sortLogic = (a, b) => {
            let diff = 0;
            if (sortField === "rarity") {
                const rarityA = a.rarity !== undefined ? a.rarity : 1;
                const rarityB = b.rarity !== undefined ? b.rarity : 1;
                diff = rarityA - rarityB;
            } else if (sortField === "level") {
                const lvlA = a.level !== undefined ? a.level : 1;
                const lvlB = b.level !== undefined ? b.level : 1;
                diff = lvlA - lvlB;
            } else if (sortField === "partType") {
                const partA = a.partType !== undefined ? a.partType : 0;
                const partB = b.partType !== undefined ? b.partType : 0;
                diff = partA - partB;
            } else if (sortField === "pack") {
                const packA = String(a.pack || "none").toLowerCase();
                const packB = String(b.pack || "none").toLowerCase();
                diff = packA.localeCompare(packB);
            } else {
                let valA = a[sortField] || "";
                let valB = b[sortField] || "";
                diff = String(valA).localeCompare(String(valB));
            }

            if (diff === 0) {
                const partA = a.partType !== undefined ? a.partType : 0;
                const partB = b.partType !== undefined ? b.partType : 0;
                diff = partA - partB;

                if (diff === 0) {
                    diff = (a.id || "").localeCompare(b.id || "");
                }
                return diff;
            }

            return sortDirection === "asc" ? diff : -diff;
        };

        return baseFiltered.sort(sortLogic);
    })();

    $: groupedEquipment = filteredEquipment.reduce((groups, eq) => {
        const packKey = eq.pack || "none";
        if (!groups[packKey]) groups[packKey] = [];
        groups[packKey].push(eq);
        return groups;
    }, {});

    $: groupedArray = Object.entries(groupedEquipment)
        .map(([pack, items]) => ({
            pack,
            items,
            maxRarity: Math.max(...items.map((i) => i.rarity || 1)),
        }))
        .sort((a, b) => {
            const isNoneA = a.pack === "none" || a.pack === "";
            const isNoneB = b.pack === "none" || b.pack === "";

            if (isNoneA && !isNoneB) return 1;
            if (!isNoneA && isNoneB) return -1;
            if (sortDirection === "desc") {
                return (
                    b.maxRarity - a.maxRarity || a.pack.localeCompare(b.pack)
                );
            }
            return a.maxRarity - b.maxRarity || a.pack.localeCompare(b.pack);
        });

    let displayLimit = 4;
    let flatDisplayLimit = 60;

    $: {
        const _trigger = [
            searchQuery,
            filters,
            sortField,
            sortDirection,
            showOwnedOnly,
            isGrouped,
        ];
        displayLimit = 4;
        flatDisplayLimit = 60;
        setTimeout(checkScroll, 50);
    }

    $: displayedGroups = groupedArray.slice(0, displayLimit);
    $: displayedFlat = filteredEquipment.slice(0, flatDisplayLimit);

    function loadMore() {
        let changed = false;
        if (isGrouped && displayLimit < groupedArray.length) {
            displayLimit += 4;
            changed = true;
        } else if (!isGrouped && flatDisplayLimit < filteredEquipment.length) {
            flatDisplayLimit += 40;
            changed = true;
        }
        if (changed) {
            setTimeout(checkScroll, 50);
        }
    }

    function checkScroll() {
        if (typeof window === "undefined" || typeof document === "undefined")
            return;
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
        <h2
            class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]"
        >
            {$t("pages.equipment") || "Equipment"}
        </h2>
        <span class="text-gray-400 text-xl md:text-3xl font-normal">
            / {filteredEquipment.length}
        </span>
    </div>

    <div class="w-full xl:w-[70%] mb-3">
        <DataToolbar
            bind:sortField
            bind:sortDirection
            bind:filters={$equipmentFilters}
            bind:searchQuery={$equipmentSearch}
            bind:manualMode={$equipmentManual}
            bind:showOwnedOnly
            bind:groupMode={$equipmentGroupMode}
            mode="equipment"
            {availablePacks}
            {availableStats}
        />
    </div>

    <div class="w-full xl:w-[69%] pb-12 flex flex-col gap-5 relative">
        {#if isGrouped}
            {#each displayedGroups as group}
                <div class="flex flex-col gap-1 animate-fadeIn">
                    <div class="flex items-center gap-3 pb-2">
                        <h3
                            class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk"
                        >
                            {$t(`packs.${group.pack}`) || group.pack}
                        </h3>
                    </div>

                    <div
                        class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,100px)] gap-5 justify-start"
                    >
                        {#each group.items as eq (eq.id)}
                            <div
                                class="flex justify-center transition-transform"
                            >
                                <WeaponCard weapon={eq} isEquipment={true} />
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else}
            <div
                class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-5 justify-start animate-fadeIn"
            >
                {#each displayedFlat as eq (eq.id)}
                    <div class="flex justify-center transition-transform">
                        <WeaponCard weapon={eq} isEquipment={true} />
                    </div>
                {/each}
            </div>
        {/if}

        {#if (isGrouped && displayLimit < groupedArray.length) || (!isGrouped && flatDisplayLimit < filteredEquipment.length)}
            <div
                class="w-full h-24 mt-4 flex items-center justify-center opacity-50"
            >
                <div class="w-8 h-8 animate-spin dark:text-white">
                    <Icon name="loading" class="w-8 h-8 opacity-100" />
                </div>
            </div>
        {/if}

        {#if filteredEquipment.length === 0}
            <div
                class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#444]"
            >
                <Icon name="noData" class="w-10 h-10 mb-3 opacity-30" />
                <p class="text-sm font-medium">
                    {$t("emptyState.noData") || "No equipment found"}
                </p>
            </div>
        {/if}
    </div>
</div>
