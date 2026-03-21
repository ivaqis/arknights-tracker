<script>
    import { t } from "$lib/i18n";
    import { weapons } from "$lib/data/weapons.js";
    import { essences } from "$lib/data/items/essences.js";
    import { pullData } from "$lib/stores/pulls";
    import { locations } from "$lib/data/locations.js";
    import { manualPotentials } from "$lib/stores/potentials";
    import { accountStore } from "$lib/stores/accounts";

    import WeaponCard from "$lib/components/WeaponCard.svelte";
    import DataToolbar from "$lib/components/DataToolbar.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Button from "$lib/components/Button.svelte";

    const allWeapons = Object.values(weapons || {}).filter((wp) => wp && wp.id);

    let sortField = "rarity";
    let sortDirection = "desc";
    let searchQuery = "";
    let showOwnedOnly = false;

    const skillIcons = {
        "attr_atk": "atk",
        "attr_hp": "hp",
        "attr_agi": "agi",
        "attr_str": "str",
        "attr_wisd": "int",
        "attr_will": "will",
        "attr_firedam": "heat",
        "attr_icedam": "cryo",
        "attr_naturaldam": "nature",
        "attr_phydam": "physical",
        "attr_pulsedam": "electric",
        "attr_crirate": "crirate",
        "attr_usp": "usp",
        "attr_heal": "heal",
        "attr_physpell": "magicdam",
    };

    const elementColors = {
        "attr_firedam": "text-[#FE633D]",
        "attr_icedam": "text-[#22C6D0]",
        "attr_naturaldam": "text-[#AFCD47] dark:text-[#C3E354]",
        "attr_pulsedam": "text-[#FEC001]",
        "attr_phydam": "text-slate-500 dark:text-slate-300" 
    };

    const attr1Skills = [
        "attr_agi",
        "attr_str",
        "attr_will",
        "attr_wisd",
        "attr_main",
    ];
    const attr2Skills = [
        "attr_firedam",    // Heat
        "attr_icedam",     // Cryo
        "attr_naturaldam", // Nature
        "attr_phydam",     // Physical
        "attr_pulsedam",   // Electric
        "attr_magicdam",   // Arts
        "attr_atk",        // Attack
        "attr_crirate",    // Crit Rate
        "attr_heal",       // Healing
        "attr_hp",         // HP
        "attr_physpell",   // Arts Intensity
        "attr_usp"         // Ultimate Gain
    ];
    const attr3Skills = [
        "tacafter",
        "magabn",
        "burst",
        "spirit",
        "tactic",
        "ult",
        "break",
        "combo",
        "crit",
        "force",
        "heal",
        "keyword",
        "phyabn",
        "smash",
    ];

    let filters = {
        rarity: [6, 5, 4, 3],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        attr1: [...attr1Skills],
        attr2: [...attr2Skills],
        attr3: [...attr3Skills],
    };

    const { selectedId } = accountStore;

    $: filteredWeapons = allWeapons
        .filter((wp) => {
            if (showOwnedOnly) {
                const activeId = $selectedId;
                const manualPots = $manualPotentials[activeId] || {};
                let pullsCount = 0;
                if ($pullData) {
                    Object.values($pullData).forEach((banner) => {
                        pullsCount += (banner?.pulls || []).filter(
                            (p) =>
                                p.id === wp.id ||
                                p.name === wp.id ||
                                p.itemId === wp.id ||
                                (p.name &&
                                    wp.name &&
                                    p.name.toLowerCase() ===
                                        wp.name.toLowerCase()),
                        ).length;
                    });
                }
                const basePot = pullsCount > 0 ? pullsCount - 1 : -1;
                const finalPot =
                    manualPots[wp.id] !== undefined
                        ? manualPots[wp.id]
                        : basePot;
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

            const matchesRarity =
                filters.rarity.length === 0 ||
                filters.rarity.includes(wp.rarity);
            const wpType = wp.type || wp.weapon;
            const matchesType =
                filters.type.length === 0 ||
                (wpType &&
                    filters.type.some(
                        (w) => w.toLowerCase() === wpType.toLowerCase(),
                    ));
            const passesAttr1 =
                filters.attr1.length === attr1Skills.length ||
                (wp.skills && wp.skills.some((s) => filters.attr1.includes(s)));
            const passesAttr2 =
                filters.attr2.length === attr2Skills.length ||
                (wp.skills && wp.skills.some((s) => filters.attr2.includes(s)));
            const passesAttr3 =
                filters.attr3.length === attr3Skills.length ||
                (wp.skills && wp.skills.some((s) => filters.attr3.includes(s)));

            return (
                matchesRarity &&
                matchesType &&
                passesAttr1 &&
                passesAttr2 &&
                passesAttr3
            );
        })
        .sort((a, b) => {
            let valA = sortField === "type" ? a.type || a.weapon : a[sortField];
            let valB = sortField === "type" ? b.type || b.weapon : b[sortField];
            if (sortField === "rarity")
                return sortDirection === "asc" ? valA - valB : valB - valA;
            if (!valA) valA = "";
            if (!valB) valB = "";
            return sortDirection === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });

    let displayLimit = 40;
    $: if (
        searchQuery !== undefined ||
        filters ||
        sortField ||
        sortDirection ||
        showOwnedOnly
    )
        displayLimit = 40;
    $: displayedWeapons = filteredWeapons.slice(0, displayLimit);

    function infiniteScroll(node) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    displayLimit < filteredWeapons.length
                )
                    displayLimit += 40;
            },
            { rootMargin: "400px" },
        );
        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    let activeTab = "optimizer";
    let invAttr1 = null;
    let invAttr2 = null;
    let invAttr3 = null;

    function setInvAttr(group, skillId) {
        if (group === 1) invAttr1 = invAttr1 === skillId ? null : skillId;
        if (group === 2) invAttr2 = invAttr2 === skillId ? null : skillId;
        if (group === 3) invAttr3 = invAttr3 === skillId ? null : skillId;
    }

    function clearInvFilters() {
        invAttr1 = null;
        invAttr2 = null;
        invAttr3 = null;
    }

    $: invSelectedCount = [invAttr1, invAttr2, invAttr3].filter(Boolean).length;

    $: invMatches = allWeapons.map(wp => {
        const selectedStats = [invAttr1, invAttr2, invAttr3].filter(Boolean);
        const matchedStats = selectedStats.filter(s => wp.skills.includes(s));
        return {
            weapon: wp,
            matchCount: matchedStats.length,
            matchedStats
        };
    }).filter(m => m.matchCount > 0 && invSelectedCount > 0);

    $: invGroup3 = invMatches.filter(m => m.matchCount === 3).sort((a, b) => b.weapon.rarity - a.weapon.rarity);
    $: invGroup2 = invMatches.filter(m => m.matchCount === 2).sort((a, b) => b.weapon.rarity - a.weapon.rarity);
    $: invGroup1 = invMatches.filter(m => m.matchCount === 1).sort((a, b) => b.weapon.rarity - a.weapon.rarity);
    let selectedWeaponIds = new Set();
    let primaryWeaponId = null;

    function toggleWeaponSelection(wpId) {
        if (selectedWeaponIds.has(wpId)) {
            selectedWeaponIds.delete(wpId);
            if (primaryWeaponId === wpId) {
                primaryWeaponId =
                    selectedWeaponIds.size > 0
                        ? Array.from(selectedWeaponIds)[0]
                        : null;
            }
        } else {
            selectedWeaponIds.add(wpId);
            if (!primaryWeaponId) primaryWeaponId = wpId;
        }
        selectedWeaponIds = new Set(selectedWeaponIds);
    }

    function setPrimaryWeapon(wpId) {
        primaryWeaponId = wpId;
    }

    function clearSelection() {
        selectedWeaponIds.clear();
        selectedWeaponIds = new Set();
        primaryWeaponId = null;
    }

    $: wishlistData = computeWishlist(
        selectedWeaponIds,
        primaryWeaponId,
        allWeapons,
    );

    function computeWishlist(selectedIds, primaryId, weaponsList) {
        let wishlist = {
            primary: null,
            secondary: [],
            attr1: [],
            lockedAttr23: null,
            totalConflicts: 0
        };
        
        if (selectedIds.size === 0 || !primaryId) return wishlist;

        let selectedWeapons = Array.from(selectedIds).map(id => weaponsList.find(w => w.id === id)).filter(Boolean);
        wishlist.primary = selectedWeapons.find(w => w.id === primaryId);

        if (!wishlist.primary) return wishlist;

        let pAttr1 = wishlist.primary.skills.filter(s => attr1Skills.includes(s));
        let pAttr23 = wishlist.primary.skills.filter(s => attr2Skills.includes(s) || attr3Skills.includes(s));

        let bestLock = null;
        let maxIntersections = -1;
        
        if (pAttr23.length > 0) {
            pAttr23.forEach(stat => {
                let intersections = 0;
                selectedWeapons.forEach(w => {
                    if (w.id !== primaryId && w.skills.includes(stat)) intersections++;
                });
                if (intersections > maxIntersections) {
                    maxIntersections = intersections;
                    bestLock = stat;
                }
            });
            wishlist.lockedAttr23 = bestLock || pAttr23[0];
        }

        wishlist.attr1.push(...pAttr1);
        selectedWeapons.forEach(w => {
            if (w.id === primaryId) return;
            let wAttr1 = w.skills.filter(s => attr1Skills.includes(s));
            wAttr1.forEach(s => {
                if (wishlist.attr1.length < 3 && !wishlist.attr1.includes(s)) {
                    wishlist.attr1.push(s);
                }
            });
        });

        selectedWeapons.forEach(w => {
            if (w.id === primaryId) return;
            let weaponData = { weapon: w, stats: [], hasConflict: false };

            let wAttr23 = w.skills.filter(s => attr2Skills.includes(s) || attr3Skills.includes(s));
            let hasAttr23Conflict = wAttr23.length > 0 && wishlist.lockedAttr23 && !wAttr23.includes(wishlist.lockedAttr23);

            w.skills.forEach(s => {
                let isConflict = false;
                
                if (attr1Skills.includes(s)) {
                    isConflict = !wishlist.attr1.includes(s);
                } else if (attr2Skills.includes(s) || attr3Skills.includes(s)) {
                    isConflict = hasAttr23Conflict;
                }

                if (isConflict) {
                    weaponData.hasConflict = true;
                    wishlist.totalConflicts++;
                }

                weaponData.stats.push({ id: s, isConflict });
            });

            wishlist.secondary.push(weaponData);
        });

        return wishlist;
    }

    $: optimizerResults = computeOptimizer(selectedWeaponIds, primaryWeaponId, allWeapons, essences, wishlistData);

    function computeOptimizer(selectedIds, primaryId, weaponsList, essencesData, wishlist) {
        if (selectedIds.size === 0) return [];

        const selectedWeapons = Array.from(selectedIds).map(id => weaponsList.find(w => w.id === id)).filter(Boolean);
        const dungeonMap = {}; 

        Object.values(essencesData).forEach(essence => {
            if (!essence.obtain || essence.obtain.length === 0) return;
            const eSkillIds = essence.skills.map(s => s.id);
            const eLevelSum = essence.skills.reduce((sum, s) => sum + s.level, 0);

            selectedWeapons.forEach(wp => {
                const matchedSkills = wp.skills.filter(s => eSkillIds.includes(s));
                const matchCount = matchedSkills.length;
                
                let effectiveCount = matchCount;
                if (wishlist && primaryId !== wp.id) {
                    const secData = wishlist.secondary.find(s => s.weapon.id === wp.id);
                    if (secData) {
                        effectiveCount = matchedSkills.filter(skillId => {
                            const stat = secData.stats.find(s => s.id === skillId);
                            return stat ? !stat.isConflict : true;
                        }).length;
                    }
                }

                if (matchCount > 0) {
                    essence.obtain.forEach(dungeonId => {
                        if (!dungeonMap[dungeonId]) dungeonMap[dungeonId] = {};

                        const existing = dungeonMap[dungeonId][wp.id];
                        const isBetter = !existing ||
                            effectiveCount > existing.effectiveCount ||
                            (effectiveCount === existing.effectiveCount && matchCount > existing.matchCount) ||
                            (effectiveCount === existing.effectiveCount && matchCount === existing.matchCount && essence.rarity > existing.bestEssence.rarity) ||
                            (effectiveCount === existing.effectiveCount && matchCount === existing.matchCount && essence.rarity === existing.bestEssence.rarity && eLevelSum > existing.eLevelSum);

                        if (isBetter) {
                            dungeonMap[dungeonId][wp.id] = { 
                                bestEssence: essence, 
                                matchCount, 
                                effectiveCount,
                                matchedSkills,
                                eLevelSum 
                            };
                        }
                    });
                }
            });
        });

        let results = Object.entries(dungeonMap).map(([dungeonId, weaponsMatched]) => {
            let hasPrimaryPerfect = false; 
            
            const matchedList = Object.entries(weaponsMatched).map(([wpId, data]) => {
                if (wpId === primaryId && data.effectiveCount === 3) {
                    hasPrimaryPerfect = true;
                }
                return {
                    weapon: selectedWeapons.find(w => w.id === wpId),
                    ...data
                };
            }).sort((a, b) => {
                if (a.weapon.id === primaryId) return -1;
                if (b.weapon.id === primaryId) return 1;
                return b.effectiveCount - a.effectiveCount; 
            });

            const perfectMatches = matchedList.filter(m => m.effectiveCount === 3).length;

            return {
                dungeonId,
                matchedList,
                perfectMatches,
                totalCovered: matchedList.length,
                hasPrimaryPerfect 
            };
        }).sort((a, b) => {
            if (a.hasPrimaryPerfect && !b.hasPrimaryPerfect) return -1;
            if (!a.hasPrimaryPerfect && b.hasPrimaryPerfect) return 1;
            if (b.perfectMatches !== a.perfectMatches) return b.perfectMatches - a.perfectMatches;
            return b.totalCovered - a.totalCovered;
        });

        return results.slice(0, 3);
    }

    function getLocationIcon(dungeonId) {
        const loc = locations[dungeonId];
        if (loc && loc.region) {
            return loc.region;
        }
        return "theHub";
    }

    const regionColors = {
        theBase: "#BCE200",
        wuling: "#00B4A8",
        default: "#00B4A8",
    };

    function getRegionColor(regionId) {
        return regionColors[regionId] || regionColors["default"];
    }
</script>

<div class="max-w-[100%] min-h-screen flex flex-col xl:flex-row gap-8">
    
    <div class="w-full xl:w-[45%] flex flex-col xl:border-r border-gray-200 dark:border-[#333] xl:pr-8">
        
        <div class="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-[#333] pb-2 mt-2">
            <div class="flex gap-4">
                <button
                    class="text-lg font-bold pb-2 border-b-2 transition-colors {activeTab === 'optimizer' ? 'border-[#F9B90C] text-[#21272C] dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}"
                    on:click={() => (activeTab = "optimizer")}
                >
                    {$t("essencesPage.optimizer")}
                </button>
                <button
                    class="text-lg font-bold pb-2 border-b-2 transition-colors {activeTab === 'inventory' ? 'border-[#F9B90C] text-[#21272C] dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}"
                    on:click={() => (activeTab = "inventory")}
                >
                    {$t("essencesPage.inventory")}
                </button>
            </div>

            {#if activeTab === 'optimizer' && selectedWeaponIds.size > 0}
                <button class="text-xs font-bold text-gray-400 hover:text-[#F9B90C] transition-colors uppercase tracking-wider px-2 py-1" on:click={clearSelection}>
                    {$t("essencesPage.reset")}
                </button>
            {:else if activeTab === 'inventory' && invSelectedCount > 0}
                <button class="text-xs font-bold text-gray-400 hover:text-[#F9B90C] transition-colors uppercase tracking-wider px-2 py-1" on:click={clearInvFilters}>
                    {$t("essencesPage.reset")}
                </button>
            {/if}
        </div>

        {#if activeTab === "optimizer"}
            
            <div class="mb-4">
                <DataToolbar
                    bind:sortField
                    bind:sortDirection
                    bind:searchQuery
                    bind:filters
                    bind:showOwnedOnly
                    mode="weapons"
                />
            </div>

            <div class="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4 justify-start pb-8">
                {#each displayedWeapons as wp (wp.id)}
                    {@const isSelected = selectedWeaponIds.has(wp.id)}
                    {@const isPrimary = primaryWeaponId === wp.id}

                    <div
                        role="button"
                        tabindex="0"
                        class="relative w-full h-full rounded-[6px] cursor-pointer text-left aspect-square"
                        on:click|preventDefault|stopPropagation={() => toggleWeaponSelection(wp.id)}
                        on:keydown={(e) => e.key === "Enter" && toggleWeaponSelection(wp.id)}
                    >
                        <WeaponCard
                            weapon={wp}
                            isNew={wp.isNew}
                            asLink={false}
                            className="w-full h-full"
                        />

                        {#if isSelected}
                            <div class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"></div>

                            <button
                                class="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-40 transition-colors border-2 {isPrimary ? 'bg-[#F9B90C] border-[#F9B90C] text-black' : 'bg-[#2A2A2A] border-[#444] text-gray-400 hover:bg-[#333] hover:text-white'}"
                                on:click|preventDefault|stopPropagation={() => setPrimaryWeapon(wp.id)}
                                title={isPrimary ? $t("essencesPage.primaryWeapon") : $t("essencesPage.makePrimary")}
                            >
                                <Icon name="favorite" class="w-5 h-5" />
                            </button>
                        {/if}
                    </div>
                {/each}
            </div>

            {#if displayLimit < filteredWeapons.length}
                <div use:infiniteScroll class="h-10 w-full mt-4"></div>
            {/if}

            {#if filteredWeapons.length === 0}
                <div class="text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed">
                    <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                    <p class="text-sm">{$t("emptyState.noData") || "No weapons found"}</p>
                </div>
            {/if}

        {:else if activeTab === "inventory"}
            
            <div class="flex flex-col gap-6 pt-2 pb-8">
                
                <div>
                    <h3 class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-3">{$t("essencesPage.attr1")}</h3>
                    <div class="flex flex-wrap gap-2">
                        {#each attr1Skills as skill}
                            <button 
                                type="button" 
                                class="h-[32px] px-2 pr-3 rounded flex items-center justify-center gap-1.5 border transition-all cursor-pointer {invAttr1 === skill ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white/50 dark:bg-[#383838]/50 border-gray-200 dark:border-[#444444] text-gray-700 dark:text-[#E0E0E0] hover:bg-white hover:dark:bg-[#424242]'}" 
                                on:click={() => setInvAttr(1, skill)}
                            >
                                {#if skillIcons[skill]}
                                    <div class="w-5 h-5 bg-[#2A2A2A] dark:bg-[#2A2A2A] border border-[#3A3A3A] rounded-[4px] flex items-center justify-center pointer-events-none">
                                        <Icon name={skillIcons[skill]} class="w-3 h-3 text-white pointer-events-none" />
                                    </div>
                                {/if}
                                <span class="text-xs font-bold pointer-events-none">{$t(`skills.${skill}`) || skill}</span>
                            </button>
                        {/each}
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-3">{$t("essencesPage.attr2")}</h3>
                    <div class="flex flex-wrap gap-2">
                        {#each attr2Skills as skill}
                            <button 
                                type="button" 
                                class="h-[32px] px-3 rounded flex items-center justify-center gap-1.5 border transition-all cursor-pointer {invAttr2 === skill ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white/50 dark:bg-[#383838]/50 border-gray-200 dark:border-[#444444] text-gray-700 dark:text-[#E0E0E0] hover:bg-white hover:dark:bg-[#424242]'}" 
                                on:click={() => setInvAttr(2, skill)}
                            >
                                {#if skillIcons[skill]}
                                    {#if elementColors[skill]}
                                        <Icon name={skillIcons[skill]} class="w-4 h-4 pointer-events-none {elementColors[skill]}" />
                                    {:else}
                                        <div class="w-5 h-5 bg-[#2A2A2A] dark:bg-[#2A2A2A] border border-[#3A3A3A] rounded-[4px] flex items-center justify-center pointer-events-none">
                                            <Icon name={skillIcons[skill]} class="w-3 h-3 text-white pointer-events-none" />
                                        </div>
                                    {/if}
                                {/if}
                                <span class="text-xs font-bold pointer-events-none {elementColors[skill] || 'text-current'}">
                                    {$t(`skills.${skill}`) || skill}
                                </span>
                            </button>
                        {/each}
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-3">{$t("essencesPage.attr3")}</h3>
                    <div class="flex flex-wrap gap-2">
                        {#each attr3Skills as skill}
                            <button 
                                type="button" 
                                class="h-[32px] px-3 rounded flex items-center justify-center gap-1.5 border transition-all cursor-pointer {invAttr3 === skill ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white/50 dark:bg-[#383838]/50 border-gray-200 dark:border-[#444444] text-gray-700 dark:text-[#E0E0E0] hover:bg-white hover:dark:bg-[#424242]'}" 
                                on:click={() => setInvAttr(3, skill)}
                            >
                                {#if skillIcons[skill]}
                                    <Icon name={skillIcons[skill]} class="w-4 h-4 text-current pointer-events-none" />
                                {/if}
                                <span class="text-xs font-bold pointer-events-none">{$t(`skills.${skill}`) || skill}</span>
                            </button>
                        {/each}
                    </div>
                </div>

            </div>

        {/if}
    </div>

    <div class="w-full xl:w-[55%] flex flex-col pb-8 pt-2">
        
        {#if activeTab === "optimizer"}
            
            {#if selectedWeaponIds.size === 0}
                <div class="flex-grow flex flex-col items-center justify-center text-center py-20 opacity-50">
                    <Icon name="noData" class="w-16 h-16 mb-4 text-gray-500" />
                    <h3 class="text-xl font-bold dark:text-white text-gray-800 mb-2">{$t("essencesPage.nothingSelected")}</h3>
                    <p class="text-sm dark:text-gray-400">{$t("essencesPage.clickToStart")}</p>
                </div>
            {:else if optimizerResults.length === 0}
                <div class="text-center py-10 dark:text-gray-400">{$t("essencesPage.noEssencesFound")}</div>
            {:else}
                <div class="flex flex-col gap-4">
                    {#each optimizerResults as dungeon}
                        
                        {@const locData = locations[dungeon.dungeonId] || {}}
                        {@const firstEnemyId = locData.enemyIds && locData.enemyIds.length > 0 ? locData.enemyIds[0] : null}
                        {@const regionId = getLocationIcon(dungeon.dungeonId)}
                        {@const rColor = getRegionColor(regionId)}

                        <div class="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-sm">
                            
                            <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#202020] border-l-4" style="border-left-color: {rColor};">
                                <Icon name={regionId} class="w-5 h-5" style="color: {rColor};" />
                                <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                                    {$t(`energyPoints.${dungeon.dungeonId}`) || dungeon.dungeonId}
                                </h3>
                            </div>

                            <div class="px-4 py-3 flex flex-wrap gap-4 justify-between items-center border-b border-gray-200 dark:border-[#333]">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-full border border-gray-400 dark:border-gray-600 bg-[#111] overflow-hidden flex-shrink-0">
                                        {#if firstEnemyId}
                                            <img src={`/images/enemies/${firstEnemyId}.png`} alt={$t(`enemies.${firstEnemyId}`) || firstEnemyId} class="w-full h-full object-cover" on:error={(e) => (e.target.src = "/images/boss_placeholder.png")} />
                                        {:else}
                                            <img src="/images/boss_placeholder.png" alt="boss" class="w-full h-full object-cover" />
                                        {/if}
                                    </div>
                                    <div>
                                        <div class="text-sm font-bold text-gray-900 dark:text-[#E0E0E0]">
                                            {firstEnemyId ? $t(`enemies.${firstEnemyId}`) || firstEnemyId : $t("essencesPage.unknownBoss")}
                                        </div>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                                {$t("essencesPage.covers")} {dungeon.perfectMatches}/{selectedWeaponIds.size} {$t("essencesPage.selectedWeapons")}
                                            </span>
                                            {#if wishlistData.totalConflicts > 0}
                                                <span class="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800/50">
                                                    {$t("essencesPage.conflicts")} {wishlistData.totalConflicts}
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="roundSmall"
                                    className="opacity-70 hover:opacity-100"
                                    color="gray"
                                    onClick={() => {
                                        const mapUrl = locData.url || locData.URL;
                                        if (mapUrl) window.open(mapUrl, '_blank');
                                    }}
                                >
                                    <span class="flex items-center gap-2">
                                        {$t("essencesPage.openInMap")}
                                        <Icon name="sendToLink" class="w-3 h-3" />
                                    </span>
                                </Button>
                            </div>

                            <div class="px-4 py-3 bg-gray-50/50 dark:bg-[#202020] border-b border-gray-200 dark:border-[#333]">
                                <div class="text-[10px] font-bold text-gray-500 mb-2">
                                    {$t("essencesPage.requiredToSelect")}
                                </div>
                                <div class="flex flex-col gap-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300 w-[80px] shrink-0">
                                            {$t("essencesPage.attr1")}:
                                        </span>
                                        <div class="flex flex-wrap gap-1.5">
                                            {#each wishlistData.attr1 as stat}
                                                <div class="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#F9B90C]/10 text-[#d9a009] dark:text-[#F9B90C] border-[#F9B90C]/30">
                                                    {$t(`skills.${stat}`) || stat}
                                                </div>
                                            {/each}
                                            {#each Array(Math.max(0, 3 - wishlistData.attr1.length)) as _}
                                                <div class="px-2 py-0.5 rounded text-[10px] font-bold border border-dashed border-gray-400 text-gray-500 dark:text-gray-400 bg-transparent">
                                                    {$t("essencesPage.anyAttr")}
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                    {#if wishlistData.lockedAttr23}
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 w-[80px] shrink-0">
                                                {$t("essencesPage.attr23")}:
                                            </span>
                                            <div class="flex flex-wrap gap-1.5">
                                                <div class="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#00B4A8]/10 text-[#009288] dark:text-[#00B4A8] border-[#00B4A8]/30">
                                                    {$t(`skills.${wishlistData.lockedAttr23}`) || wishlistData.lockedAttr23}
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>

                            <div class="p-4 flex flex-col gap-3">
                                {#each dungeon.matchedList as match}
                                    {@const isPrimary = wishlistData.primary && wishlistData.primary.id === match.weapon.id}
                                    {@const secData = !isPrimary ? wishlistData.secondary.find(s => s.weapon.id === match.weapon.id) : null}
                                    
                                    <div class="flex items-center gap-4 bg-gray-50 dark:bg-[#252525] rounded-lg p-3 {isPrimary ? 'border-[#F9B90C]' : match.effectiveCount === 3 ? 'border-[#4ADE80]' : 'border-gray-500'}">
                                        
                                        <div class="relative w-12 h-12 flex-shrink-0">
                                            <div class="w-full h-full rounded border border-gray-300 dark:border-[#333] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#3a3a3a] dark:to-[#1a1a1a] flex items-center justify-center shadow-sm">
                                                <Images 
                                                    id={match.weapon.id} 
                                                    variant="weapon-icon" 
                                                    className="w-full h-full pt-1 pr-0.5 object-contain drop-shadow-md blur-[0.3px] rotate-[0.01deg]" 
                                                    alt={match.weapon.name} 
                                                />
                                            </div>
                                            {#if isPrimary}
                                                <div class="absolute -top-1.5 -right-1.5 bg-[#F9B90C] text-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#252525] z-10" title={$t("essencesPage.primaryWeapon")}>
                                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                                </div>
                                            {/if}
                                        </div>
                                        
                                        <div class="flex flex-col gap-2">
                                            <div class="text-sm font-bold text-gray-900 dark:text-[#E0E0E0]">
                                                {$t(`weaponsList.${match.weapon.id}`) || match.weapon.name}
                                                <span class="ml-1 {match.effectiveCount === 3 ? 'text-[#4ADE80]' : match.effectiveCount === 2 ? 'text-[#F9B90C]' : 'text-gray-500'}">
                                                    ({match.effectiveCount}/3)
                                                </span>
                                            </div>
                                            
                                            <div class="flex flex-wrap gap-2 mt-1">
                                                {#each [...match.weapon.skills].sort((a, b) => {
                                                    const isCoveredA = match.matchedSkills.includes(a);
                                                    const isConflictA = secData ? secData.stats.find(s => s.id === a)?.isConflict : false;
                                                    const rankA = !isCoveredA ? 2 : (isConflictA ? 1 : 0);
                                                    
                                                    const isCoveredB = match.matchedSkills.includes(b);
                                                    const isConflictB = secData ? secData.stats.find(s => s.id === b)?.isConflict : false;
                                                    const rankB = !isCoveredB ? 2 : (isConflictB ? 1 : 0);
                                                    
                                                    return rankA - rankB;
                                                }) as skillId}
                                                
                                                    {@const isCovered = match.matchedSkills.includes(skillId)}
                                                    {@const isConflict = secData ? secData.stats.find(s => s.id === skillId)?.isConflict : false}
                                                    
                                                    {#if !isCovered}
                                                        <Tooltip text={$t("essencesPage.missingAttribute")}>
                                                            <div class="px-2 py-0.5 rounded text-[10px] font-bold border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
                                                                {$t(`skills.${skillId}`) || skillId} {$t("essencesPage.missing")}
                                                            </div>
                                                        </Tooltip>
                                                    {:else if isConflict}
                                                        <Tooltip text={$t("essencesPage.attributeConflict")}>
                                                            <div class="px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                                                                {$t(`skills.${skillId}`) || skillId}
                                                            </div>
                                                        </Tooltip>
                                                    {:else}
                                                        <div class="px-2 py-0.5 rounded text-[10px] font-bold border bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-[#4ADE80] border-green-300 dark:border-green-800">
                                                            {$t(`skills.${skillId}`) || skillId}
                                                        </div>
                                                    {/if}
                                                {/each}
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

        {:else if activeTab === "inventory"}
            
            {#if invSelectedCount === 0}
                <div class="flex-grow flex flex-col items-center justify-center text-center py-20 opacity-50">
                    <Icon name="noData" class="w-16 h-16 mb-4 text-gray-500" />
                    <h3 class="text-xl font-bold dark:text-white text-gray-800 mb-2">
                        {$t("essencesPage.invEmptyTitle")}
                    </h3>
                    <p class="text-sm dark:text-gray-400 max-w-sm">
                        {$t("essencesPage.invEmptyDesc")}
                    </p>
                </div>
            {:else if invMatches.length === 0}
                <div class="text-center py-10 dark:text-gray-400">
                    {$t("essencesPage.noWeaponsFound")}
                </div>
            {:else}
                <div class="flex flex-col gap-8">
                    
                    {#if invGroup3.length > 0}
                        <div>
                            <div class="flex items-center gap-3 mb-4 border-b border-[#4ADE80]/30 pb-2">
                                <div class="w-2 h-6 bg-[#4ADE80] rounded-full"></div>
                                <h3 class="text-lg font-bold text-[#4ADE80]">{$t("essencesPage.perfectMatch")} (3/3)</h3>
                            </div>
                            <div class="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                                {#each invGroup3 as match (match.weapon.id)}
                                    <div class="w-full aspect-square relative rounded-[6px] border-2 border-[#4ADE80]/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                        <WeaponCard weapon={match.weapon} isNew={match.weapon.isNew} asLink={true} className="w-full h-full" />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if invGroup2.length > 0}
                        <div>
                            <div class="flex items-center gap-3 mb-4 border-b border-[#F9B90C]/30 pb-2">
                                <div class="w-2 h-6 bg-[#F9B90C] rounded-full"></div>
                                <h3 class="text-lg font-bold text-[#F9B90C]">{$t("essencesPage.partialMatch")} (2/3)</h3>
                            </div>
                            <div class="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                                {#each invGroup2 as match (match.weapon.id)}
                                    <div class="w-full aspect-square relative rounded-[6px]">
                                        <WeaponCard weapon={match.weapon} isNew={match.weapon.isNew} asLink={true} className="w-full h-full" />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if invGroup1.length > 0}
                        <div>
                            <div class="flex items-center gap-3 mb-4 border-b border-gray-400/30 pb-2">
                                <div class="w-2 h-6 bg-gray-400 rounded-full"></div>
                                <h3 class="text-lg font-bold text-gray-500 dark:text-gray-400">{$t("essencesPage.minimalMatch")} (1/3)</h3>
                            </div>
                            <div class="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4 opacity-70">
                                {#each invGroup1 as match (match.weapon.id)}
                                    <div class="w-full aspect-square relative rounded-[6px]">
                                        <WeaponCard weapon={match.weapon} isNew={match.weapon.isNew} asLink={true} className="w-full h-full" />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                </div>
            {/if}
            
        {/if}
    </div>
</div>