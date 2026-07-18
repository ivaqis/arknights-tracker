<script>
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import EquipmentFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/EquipmentFilterDropdown.svelte";
    import SortSelectorDropdown from "$lib/components/dataToolbarV2/sortDropdowns/SortSelectorDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { equipment } from "$lib/data/items/equipment.js";
    import { t } from "$lib/i18n";
    import { accountStore } from "$lib/stores/accounts";
    import {
        equipmentFilters,
        equipmentGroupMode,
        equipmentSearch,
        getEquipmentFilters,
        getEquipmentSortOptions
    } from "$lib/stores/filterStore";
    import { currentLocale } from "$lib/stores/locale";
    import { manualPotentials } from "$lib/stores/potentials";
    import { filterCheck, filterCheckLowerCase } from "$lib/utils/filterUtils.js";

    $: selectedFilters = $equipmentFilters;
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

    let selectedAttrType = "any";

    const availablePacks = [
        ...new Set( allEquipment.map((eq) => eq.pack).filter((pack) => pack) ),
    ];

    let allFilters = getEquipmentFilters();
    allFilters.pack = availablePacks;

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
            const matchesRarity = filterCheck(selectedFilters.rarity, itemRarity);

            const itemPartType = eq.partType !== undefined ? eq.partType : 0;
            const matchesPart = filterCheck(selectedFilters.partType, getPartTypeId(itemPartType));

            const itemPack = eq.pack || "none";
            const matchesPack = filterCheck(selectedFilters.pack, itemPack);

            const allItemAttributes = [
                ...(eq.displayAttr || []),
            ].map((a) => String(a.attrType || "").toLowerCase());

            const passesAny = allItemAttributes.some((stat) => filterCheckLowerCase(selectedFilters.stats_any, stat));

            if (!passesAny) return false;

            const passesMain = filterCheckLowerCase(selectedFilters.stats_1, getMainStat(eq.displayAttr)?.attrType ?? "NoAttr");
            const passesSub = filterCheckLowerCase(selectedFilters.stats_2, getSubStat(eq.displayAttr)?.attrType ?? "NoAttr");
            const passesSpecial = filterCheckLowerCase(selectedFilters.stats_3, getSpecialStat(eq.displayAttr)?.attrType ?? "NoAttr");

            if (!(passesMain && passesSub && passesSpecial)) {
                return false;
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

    $: equipmentFilteredByAttr12 = allEquipment.filter((eq) => {
        // const allItemAttributes = (eq.displayAttr || []).map((a) => a.attrType || "");

        const passesAttr1 = filterCheckLowerCase(selectedFilters.stats_1, getMainStat(eq.displayAttr)?.attrType ?? "NoAttr");
        const passesAttr2 = filterCheckLowerCase(selectedFilters.stats_2, getSubStat(eq.displayAttr)?.attrType ?? "NoAttr");

        return passesAttr1 && passesAttr2;
    });

    $: equipmentFilteredByAttr23 = allEquipment.filter((eq) => {
        // const allItemAttributes = (eq.displayAttr || []).map((a) => a.attrType || "");

        const passesAttr2 = filterCheckLowerCase(selectedFilters.stats_2, getSubStat(eq.displayAttr)?.attrType ?? "NoAttr");
        const passesAttr3 = filterCheckLowerCase(selectedFilters.stats_3, getSpecialStat(eq.displayAttr)?.attrType ?? "NoAttr");

        return passesAttr2 && passesAttr3;
    });

    $: equipmentFilteredByAttr13 = allEquipment.filter((eq) => {
        // const allItemAttributes = (eq.displayAttr || []).map((a) => a.attrType || "");

        const passesAttr1 = filterCheckLowerCase(selectedFilters.stats_1, getMainStat(eq.displayAttr)?.attrType ?? "NoAttr");
        const passesAttr3 = filterCheckLowerCase(selectedFilters.stats_3, getSpecialStat(eq.displayAttr)?.attrType ?? "NoAttr");

        return passesAttr1 && passesAttr3;
    });

    $: if (equipmentFilteredByAttr12 && equipmentFilteredByAttr23 && equipmentFilteredByAttr13) {
        let attrFilters1 = getEquipmentAttrSet(equipmentFilteredByAttr23, 1);
        let attrFilters2 = getEquipmentAttrSet(equipmentFilteredByAttr13, 2);
        let attrFilters3 = getEquipmentAttrSet(equipmentFilteredByAttr12, 3);

        allFilters.stats_1 = getFilteredAttrGroupList(allFilters.stats, attrFilters1);
        allFilters.stats_2 = getFilteredAttrGroupList(allFilters.stats, attrFilters2);
        allFilters.stats_3 = getFilteredAttrGroupList(allFilters.stats, attrFilters3);

        forceUpdateFilterList();
    }

    const mainStats = new Set([
        "Str",
        "Agi",
        "Wisd",
        "Will",
        "Main",
        "Sub"
    ]);

    function getMainStat(displayAttrList) {
        const candidates = displayAttrList.filter(a => mainStats.has(a.attrType) && Number.isInteger(a.values[0]));

        if (candidates.length > 2) {
            console.log(candidates);
            throw new Error(`2 or less candidates expected: ${candidates.length}`);
        }

        candidates.sort((a, b) => b.values[0] - a.values[0]);

        return candidates[0] ?? null;
    }

    function getSubStat(displayAttrList) {
        const candidates = displayAttrList.filter(a => mainStats.has(a.attrType) && Number.isInteger(a.values[0]));

        if (candidates.length > 2) {
            console.log(candidates);
            throw new Error(`2 or less candidates expected: ${candidates.length}`);
        }

        candidates.sort((a, b) => b.values[0] - a.values[0]);

        return candidates[1] ?? null;
    }

    function getSpecialStat(displayAttrList) {
        const candidates = displayAttrList.filter(a => (!mainStats.has(a.attrType) || a.values.some(v => !Number.isInteger(v))) && a.attrType !== "Def");

        if (candidates.length > 1) {
            console.log(candidates);
            throw new Error(`Only 1 candidate expected: ${candidates.length}`)
        }

        return candidates[0] ?? null;
    }

    function getFilteredAttrGroupList(allAttrGroupList, attrSet) {
        let groupList = [];

        for (let group of allAttrGroupList) {
            let list = [];

            for (let attr of group) {

                if (attrSet.has(attr)) {
                    list.push(attr);
                }
            }

            groupList.push(list);
        }

        return groupList;
    }

    function getEquipmentAttrSet(equipmentList, attrIndex) {
        let set = new Set();

        for (let eq of equipmentList) {
            let attr = attrIndex === 1 ? getMainStat(eq.displayAttr)?.attrType ?? "NoAttr"
                : attrIndex === 2 ? getSubStat(eq.displayAttr)?.attrType ?? "NoAttr"
                : attrIndex === 3 ? getSpecialStat(eq.displayAttr)?.attrType ?? "NoAttr"
                : null;

            if (attr) {
                set.add(attr);
            }
        }

        return set;
    }

    function getPartTypeId(partType) {
        switch (partType) {
            case 0: return "body";
            case 1: return "hand";
            case 2: return "edc";
            default: return "";
        }
    }

    function forceUpdateFilterList() {
        allFilters = allFilters;
    }

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters).some((set) => set.size > 0);

    function resetFilters() {
        $equipmentFilters = {};
        selectedAttrType = "any"
    }

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
            selectedFilters,
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

    function formatStatValue(val) {
        if (val === undefined || val === null) return "";
        if (typeof val === "number") {
            if (Math.abs(val) > 0 && Math.abs(val) < 1) {
                const pct = Math.round(val * 1000) / 10;
                return `${pct}%`;
            }
            return Math.round(val * 100) / 100;
        }
        return val;
    }

    function formatStatType(type) {
        if (!type) return "";
        const lower = type.toLowerCase();
        if (lower === "str" || lower === "atk") return "atk";
        if (lower === "agi") return "agi";
        if (lower === "wisd" || lower === "originiumarts" || lower.includes("spell")) return "arts";
        if (lower === "will") return "will";
        if (lower === "maxhp" || lower === "hp") return "hp";
        if (lower.includes("skill") || lower.includes("efficiency")) return "skill";
        if (lower.includes("crit")) return "crit";
        if (lower.includes("heal")) return "heal";
        if (lower.includes("sp")) return "sp";
        if (lower.includes("damageincrease")) return "dmg";
        if (lower.includes("damagetakenscalar")) return "res";
        return lower;
    }

    function interpolateBlackboard(text, bb) {
        if (!text) return "";
        if (!bb || Object.keys(bb).length === 0) return text;

        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(":");
            let mathStr = expr.replace(/\b(\d+),(\d+)\b/g, (m, f) => Object.keys(bb)[f] || m);

            for (const key in bb) {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                mathStr = mathStr.replace(regex, `(${bb[key]})`);
            }

            if (/[a-zA-Z_]/.test(mathStr)) return match;

            let result = 0;
            try {
                result = new Function("return " + mathStr)();
            } catch (e) {
                return match;
            }
            if (format) {
                if (format.includes("%")) {
                    result = parseFloat((result * 100).toFixed(2)) + "%";
                } else if (format === "0") {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(2));
                }
            }
            return result;
        });
    }

    function cleanSetBonus(text) {
        if (!text) return "";
        let cleaned = text.replace(/<[^>]+>/g, "");
        return cleaned.trim();
    }

    async function exportEquipmentExcel() {
        const XLSX = await import("xlsx");
        
        const lang = $currentLocale || "en";
        const safeLang = lang.toLowerCase().replace("-", "");
        
        const localePath = `/src/lib/locales/${safeLang}/equipment.json`;
        const fallbackPath = `/src/lib/locales/en/equipment.json`;
        
        const localeModules = {
            en: import.meta.glob("/src/lib/locales/en/equipment.json"),
            ru: import.meta.glob("/src/lib/locales/ru/equipment.json"),
            de: import.meta.glob("/src/lib/locales/de/equipment.json"),
            es: import.meta.glob("/src/lib/locales/es/equipment.json"),
            fr: import.meta.glob("/src/lib/locales/fr/equipment.json"),
            id: import.meta.glob("/src/lib/locales/id/equipment.json"),
            it: import.meta.glob("/src/lib/locales/it/equipment.json"),
            ja: import.meta.glob("/src/lib/locales/ja/equipment.json"),
            ko: import.meta.glob("/src/lib/locales/ko/equipment.json"),
            pt: import.meta.glob("/src/lib/locales/pt/equipment.json"),
            th: import.meta.glob("/src/lib/locales/th/equipment.json"),
            vi: import.meta.glob("/src/lib/locales/vi/equipment.json"),
            zhcn: import.meta.glob("/src/lib/locales/zhcn/equipment.json"),
            zhtw: import.meta.glob("/src/lib/locales/zhtw/equipment.json"),
        };
        
        let loader = localeModules[safeLang]?.[localePath];
        if (!loader && safeLang !== "en") {
            loader = localeModules["en"]?.[fallbackPath];
        }
        
        let localEquipmentJson = {};
        if (loader) {
            try {
                const mod = await loader();
                localEquipmentJson = mod.default || mod;
            } catch (e) {
                console.error("Failed to load active locale equipment json", e);
            }
        }
        
        let fallbackEquipmentJson = {};
        const fallbackLoader = localeModules["en"]?.[fallbackPath];
        if (fallbackLoader) {
            try {
                const mod = await fallbackLoader();
                fallbackEquipmentJson = mod.default || mod;
            } catch (e) {
                console.error("Failed to load English locale equipment json fallback", e);
            }
        }
        
        const rows = allEquipment.map((eq) => {
            const itemLocale = localEquipmentJson[eq.id] || fallbackEquipmentJson[eq.id] || {};
            const translatedName = $t("equipment." + eq.id);
            const equipName = (translatedName && translatedName !== "equipment." + eq.id) 
                ? translatedName 
                : (itemLocale.name || eq.id);
                
            const displayAttrs = eq.displayAttr || [];
            const defAttr = displayAttrs.find(a => a.attrType === "Def");
            const defVal = defAttr ? defAttr.values[defAttr.values.length - 1] : "";
            
            const additionalAttrs = displayAttrs.filter(a => a.attrType !== "Def");
            
            const firstAttr = additionalAttrs[0];
            const secondAttr = additionalAttrs[1];
            const thirdAttr = additionalAttrs[2];
            
            const firstStatVal = firstAttr ? firstAttr.values[firstAttr.values.length - 1] : null;
            const firstStatType = firstAttr ? formatStatType(firstAttr.attrType) : "";
            const firstStat = firstAttr 
                ? formatStatValue(
                    firstAttr.attrType.toLowerCase() === "alldamagetakenscalar" 
                        ? (1 - firstStatVal) 
                        : firstStatVal
                  ) 
                : "";
            
            const secondStatVal = secondAttr ? secondAttr.values[secondAttr.values.length - 1] : null;
            const secondStatType = secondAttr ? formatStatType(secondAttr.attrType) : "";
            const secondStat = secondAttr 
                ? formatStatValue(
                    secondAttr.attrType.toLowerCase() === "alldamagetakenscalar" 
                        ? (1 - secondStatVal) 
                        : secondStatVal
                  ) 
                : "";
            
            const thirdStatVal = thirdAttr ? thirdAttr.values[thirdAttr.values.length - 1] : null;
            const thirdStatType = thirdAttr ? formatStatType(thirdAttr.attrType) : "";
            const thirdStat = thirdAttr 
                ? formatStatValue(
                    thirdAttr.attrType.toLowerCase() === "alldamagetakenscalar" 
                        ? (1 - thirdStatVal) 
                        : thirdStatVal
                  ) 
                : "";
            
            const packName = eq.pack && eq.pack !== "none" ? ($t("packs." + eq.pack) || eq.pack) : "";
            
            const rawSetBonus = itemLocale.setBonus || "";
            const currentBlackboard = eq.blackboard || {};
            const interpolatedSetBonus = interpolateBlackboard(rawSetBonus, currentBlackboard);
            const setDesc = cleanSetBonus(interpolatedSetBonus);
            
            return {
                id: eq.id,
                equipName,
                lvl: eq.level || 1,
                def: defVal,
                firstStat,
                firstStatType,
                secondStat,
                secondStatType,
                thirdStat,
                thirdStatType,
                setName: packName,
                setDesc
            };
        });
        
        const workbook = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows, {
            header: ["id", "equipName", "lvl", "def", "firstStat", "firstStatType", "secondStat", "secondStatType", "thirdStat", "thirdStatType", "setName", "setDesc"]
        });
        
        ws["!cols"] = [
            { wch: 35 }, // id
            { wch: 25 }, // equipName
            { wch: 6 },  // lvl
            { wch: 6 },  // def
            { wch: 10 }, // firstStat
            { wch: 12 }, // firstStatType
            { wch: 10 }, // secondStat
            { wch: 12 }, // secondStatType
            { wch: 10 }, // thirdStat
            { wch: 12 }, // thirdStatType
            { wch: 15 }, // setName
            { wch: 45 }  // setDesc
        ];
        
        XLSX.utils.book_append_sheet(workbook, ws, "Equipment");
        XLSX.writeFile(workbook, `Equipment_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
            showSortDropdownButton={true}
            showSortDirectionButton={true}
            showFilterDropdownButton={true}
            showSearchInput={true}
            showGroupButton={true}
            showExportExcelButton={true}
            isFilterActive={isFilterActive}
            onFilterReset={resetFilters}
            onExportExcel={exportEquipmentExcel}
            bind:searchString={$equipmentSearch}
            bind:isGrouped={$equipmentGroupMode}
            bind:sortDirection={sortDirection}
        >

            <SortSelectorDropdown
                slot="sortDropdown"
                optionList={getEquipmentSortOptions()}
                bind:selectedOption={sortField}
            />

            <EquipmentFilterDropdown
                slot="filterDropdown"
                filters={allFilters}
                bind:selectedFilters={$equipmentFilters}
                bind:selectedAttrType={selectedAttrType}
            />

        </DataToolbar>

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
