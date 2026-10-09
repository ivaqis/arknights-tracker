<script module>
    import { getEquipmentFilters2 } from "$lib/stores/filterStore.ts";

    let savedDisplayLimit = 4;
    let savedFlatDisplayLimit = 60;
    let savedSortField = "rarity";
    let savedSortDirection = "desc";
    let savedSelectedAttrType = "any";

    const equipFilters = getEquipmentFilters2();
</script>

<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator.ts";
    import { LocaleComparator } from "$lib/classes/comparators/LocaleComparator.ts";
    import { NumberComparator } from "$lib/classes/comparators/NumberComparator.ts";
    import { ReactiveNamedComparatorChain } from "$lib/classes/comparators/ReactiveNamedComparatorChain.ts";
    import { ReactiveFilterChain } from "$lib/classes/filters/ReactiveFilterChain.ts";
    import { SearchFilter } from "$lib/classes/filters/SearchFilter.ts";
    import EquipmentSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/EquipmentSortDropdown.svelte";
    import { splitEquipmentView } from "$lib/stores/settings.js";
    import BottomSheet from "$lib/components/BottomSheet.svelte";
    import EquipmentDetailsView from "$lib/components/equipment/EquipmentDetailsView.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import EquipmentFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/EquipmentFilterDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { equipment } from "$lib/data/items/equipment.js";
    import { t } from "$lib/i18n";
    import {
        equipmentFilters,
        equipmentGroupMode, equipmentGroupOption,
        equipmentSearch, equipmentSortParams, getAllEquipmentStatsGrouped, getDefaultEquipmentSortParams,
        getEquipmentFilters,
    } from "$lib/stores/filterStore";
    import { currentLocale } from "$lib/stores/locale";
    import { groupPreservingOrderAndName, isListItemsEqual } from "$lib/utils/collectionUtils.ts";
    import { onDestroy, onMount } from "svelte";

    $: selectedFilters = $equipmentFilters;
    $: searchQuery = $equipmentSearch;
    $: isGrouped = $equipmentGroupMode;

    const defaultSortParams = getDefaultEquipmentSortParams();

    $: {
        let isSortParamsCorrect = $equipmentSortParams ? checkSortParams($equipmentSortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect equip sort params");

            resetSort();
        }
    }

    function checkSortParams(current, defaultParams) {
        if (!current || !current.sortFieldParams || !current.sortFieldOrder) {
            return false;
        }

        const fieldOrder = isListItemsEqual(current.sortFieldOrder, defaultParams.sortFieldOrder);

        if (!fieldOrder) {
            return false;
        }

        const { locale, level, ...rest } = defaultParams.sortFieldParams;
        const keys = Object.keys(rest);

        for (const key of keys) {
            if (!(key in current.sortFieldParams)) {
                return false;
            }

            const check = isListItemsEqual(current.sortFieldParams[key], defaultParams.sortFieldParams[key]);

            if (!check) {
                return false;
            }
        }

        return true;
    }

    const allEquipment = Object.entries(equipment || {}).map(([id, data]) => ({
        id,
        ...data,
    }));

    let isBottomSheetOpen = false;
    let zoomImageUrl = null;

    $: queryId = $page.url.searchParams.get("id");
    let selectedEquipmentId = "";

    $: {
        if (queryId && allEquipment.some(e => e.id === queryId)) {
            selectedEquipmentId = queryId;
            isBottomSheetOpen = true;
            if (typeof localStorage !== "undefined" && $splitEquipmentView) {
                localStorage.setItem("last_selected_equipment_id", queryId);
            }
        } else if (!queryId) {
            selectedEquipmentId = "";
            isBottomSheetOpen = false;
        }
    }

    onMount(() => {
        if (queryId && allEquipment.some(e => e.id === queryId)) {
            if (!$splitEquipmentView) {
                goto(`/equipment/${queryId}`, { replaceState: true });
            } else {
                localStorage.setItem("last_selected_equipment_id", queryId);
            }
        } else if (!queryId && $splitEquipmentView) {
            const savedId = localStorage.getItem("last_selected_equipment_id");
            if (savedId && allEquipment.some(e => e.id === savedId)) {
                selectEquipment(savedId, true);
            }
        }
    });

    function selectEquipment(eqId, forceSelect = false) {
        if (!eqId || (!forceSelect && selectedEquipmentId === eqId)) {
            selectedEquipmentId = "";
            isBottomSheetOpen = false;
            if ($splitEquipmentView) {
                localStorage.removeItem("last_selected_equipment_id");
                const url = new URL(window.location.href);
                url.searchParams.delete("id");
                goto(url.pathname, { replaceState: true, noScroll: true, keepFocus: true });
            }
            return;
        }

        selectedEquipmentId = eqId;
        isBottomSheetOpen = true;
        if ($splitEquipmentView) {
            localStorage.setItem("last_selected_equipment_id", eqId);
            const url = new URL(window.location.href);
            url.searchParams.set("id", eqId);
            goto(url.search, { replaceState: true, noScroll: true, keepFocus: true });
        }
    }

    const allStats = getAllEquipmentStatsGrouped();

    const rarityFilter = equipFilters.rarity;
    const partTypeFilter = equipFilters.partType;
    const packFilter = equipFilters.pack;
    const statsAnyFilter = equipFilters.stats_any;
    const stats1Filter = equipFilters.stats_1;
    const stats2Filter = equipFilters.stats_2;
    const stats3Filter = equipFilters.stats_3;

    const nameFilter = new SearchFilter(item => $t(`equipment.${item.id}`));
    const idFilter = new SearchFilter(item => item.id);

    let isNumericActive;

    const searchChain = new ReactiveFilterChain()
        .or(nameFilter)
        .or(idFilter);

    const noDynamicChain = new ReactiveFilterChain()
        .and(searchChain)
        .and(rarityFilter)
        .and(partTypeFilter)
        .and(packFilter);

    const excludeFirstAttrChain = new ReactiveFilterChain()
        .and(stats2Filter)
        .and(stats3Filter);
    const excludeSecondAttrChain = new ReactiveFilterChain()
        .and(stats1Filter)
        .and(stats3Filter);
    const excludeThirdAttrChain = new ReactiveFilterChain()
        .and(stats1Filter)
        .and(stats2Filter);

    const statsAnyChain = new ReactiveFilterChain()
        .and(noDynamicChain)
        .and(statsAnyFilter);
    const statsNumericChain = new ReactiveFilterChain()
        .and(noDynamicChain)
        .and(stats1Filter)
        .and(stats2Filter)
        .and(stats3Filter);

    $: isNumericActive = !$stats1Filter.isEmpty || !$stats2Filter.isEmpty || !$stats3Filter.isEmpty;

    $: {
        searchChain.beginManual();

        nameFilter.searchString = $equipmentSearch;
        idFilter.searchString = $equipmentSearch;

        searchChain.endManual();
    }

    $: {
        noDynamicChain.beginManual();

        rarityFilter.paramList = $equipmentSortParams.sortFieldParams.rarity;
        partTypeFilter.paramList = $equipmentSortParams.sortFieldParams.partType;
        packFilter.paramList = $equipmentSortParams.sortFieldParams.pack;

        noDynamicChain.endManual();
    }

    $: stats1Filter.groups = getAvailableStats(allEquipment, allStats, $excludeFirstAttrChain, item => item.displayAttr.length >= 3 ? item.displayAttr[1].attrType : "NoAttr");
    $: stats2Filter.groups = getAvailableStats(allEquipment, allStats, $excludeSecondAttrChain, item => item.displayAttr.length >= 4 ? item.displayAttr[2].attrType : "NoAttr");
    $: stats3Filter.groups = getAvailableStats(allEquipment, allStats, $excludeThirdAttrChain, item => item.displayAttr.length >= 2 ? item.displayAttr.at(-1).attrType : "NoAttr");

    function getAvailableStats(allItems, allGroups, filter, getStatFn) {
        const filteredItems = allItems.filter(item => filter.satisfies(item));

        const map = Map.groupBy(filteredItems, item => getStatFn(item));

        return allGroups
            .map(group => group.filter(attr => map.has(attr)))
            .filter(group => group.length > 0);
    }

    const rarityComparator = new FieldValueComparator(item => item.rarity);
    const partTypeComparator = new FieldValueComparator(item => item.partType === 0 ? "body" : item.partType === 1 ? "hand" : "edc");
    const packComparator = new FieldValueComparator(item => item.pack || "none");
    const levelComparator = new NumberComparator(item => item.level, $equipmentSortParams.sortFieldParams.level);
    const nameComparator = new LocaleComparator(item => $t(`equipment.${item.id}`));

    const comparatorChain = new ReactiveNamedComparatorChain(getComparator);

    $: {
        comparatorChain.beginManual();

        comparatorChain.setOrderAliased($equipmentSortParams.sortFieldOrder);
        rarityComparator.setValueOrder($equipmentSortParams.sortFieldParams.rarity);
        partTypeComparator.setValueOrder($equipmentSortParams.sortFieldParams.partType);
        packComparator.setValueOrder($equipmentSortParams.sortFieldParams.pack);
        levelComparator.direction = $equipmentSortParams.sortFieldParams.level;
        nameComparator.order = $equipmentSortParams.sortFieldParams.localeName;

        comparatorChain.endManual();
    }

    function getComparator(name) {
        switch (name) {
            case "rarity":
                return rarityComparator;
            case "partType":
                return partTypeComparator;
            case "pack":
                return packComparator;
            case "level":
                return levelComparator;
            case "localeName":
                return nameComparator;
        }
    }

    let sortField = savedSortField;
    let sortDirection = savedSortDirection;
    let searchQuery = "";
    let showOwnedOnly = false;

    let selectedAttrType = savedSelectedAttrType;

    const availablePacks = [
        ...new Set( allEquipment.map((eq) => eq.pack).filter((pack) => pack) ),
        "none"
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

    $: filteredEquipment = getFilteredItems(allEquipment, isNumericActive ? $statsNumericChain : $statsAnyChain, $comparatorChain, sortDirection === "desc" ? 1 : -1);

    function getFilteredItems(allItems, filter, comparator, reverseMultiplier) {
        const filteredItems = allItems.filter(item => filter.satisfies(item));

        filteredItems.sort((a, b) => comparator.compare(a, b) * reverseMultiplier);

        return filteredItems;
    }

    const mainStats = new Set([
        "Str",
        "Agi",
        "Wisd",
        "Will",
        "Main",
        "Sub"
    ]);

    function getPartTypeId(partType) {
        switch (partType) {
            case 0: return "body";
            case 1: return "hand";
            case 2: return "edc";
            default: return "";
        }
    }

    let isFilterActive = false;
    $: isFilterActive = Object.values(selectedFilters).some((set) => set.size > 0);

    function resetSort() {
        $equipmentSortParams = getDefaultEquipmentSortParams();
    }

    function resetFilters() {
        noDynamicChain.beginManual();
        statsNumericChain.beginManual();
        statsAnyChain.beginManual();
        excludeFirstAttrChain.beginManual();
        excludeSecondAttrChain.beginManual();
        excludeThirdAttrChain.beginManual();

        rarityFilter.clear();
        partTypeFilter.clear();
        packFilter.clear();
        statsAnyFilter.clear();
        stats1Filter.clear();
        stats2Filter.clear();
        stats3Filter.clear();

        noDynamicChain.endManual();
        statsNumericChain.endManual();
        statsAnyChain.endManual();
        excludeFirstAttrChain.endManual();
        excludeSecondAttrChain.endManual();
        excludeThirdAttrChain.endManual();

        selectedAttrType = "any"
    }

    let groupField;

    $: if ($equipmentGroupOption === "inherit_sort") {
        groupField = $equipmentSortParams.sortFieldOrder[0];
    } else {
        groupField = $equipmentGroupOption;
    }

    function groupEquip(filteredList, field) {
        switch (field) {
            case "rarity":
                return groupPreservingOrderAndName(filteredList, item => item.rarity, key => String(key));
            case "partType":
                return groupPreservingOrderAndName(filteredList, item => getPartTypeId(item.partType), key => $t(`equipmentTypes.${key}`));
            case "pack":
                return groupPreservingOrderAndName(filteredList, item => item.pack || "none", key => $t(`packs.${key}`));
            case "level":
                return groupPreservingOrderAndName(filteredList, item => item.level, key => String(key));
            case "localeName":
                return groupPreservingOrderAndName(filteredList, item => $t(`equipment.${item.id}`).at(0).toUpperCase(), key => key);
        }
    }

    // $: groupedEquipment = filteredEquipment.reduce((groups, eq) => {
    //     const packKey = eq.pack || "none";
    //     if (!groups[packKey]) groups[packKey] = [];
    //     groups[packKey].push(eq);
    //     return groups;
    // }, {});

    $: groupedArray = groupEquip(filteredEquipment, groupField);

    let displayLimit = savedDisplayLimit;
    let flatDisplayLimit = savedFlatDisplayLimit;

    let initialRender = true;

    $: {
        void [
            searchQuery,
            selectedFilters,
            sortField,
            sortDirection,
            showOwnedOnly,
            isGrouped,
        ];

        if (initialRender) {
            initialRender = false;
        } else {
            displayLimit = 4;
            flatDisplayLimit = 60;
        }
        setTimeout(checkScroll, 50);
    }

    onDestroy(() => {
        savedSortField = sortField;
        savedSortDirection = sortDirection;
        savedSelectedAttrType = selectedAttrType;
        savedDisplayLimit = displayLimit;
        savedFlatDisplayLimit = flatDisplayLimit;
    });

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
                    result = parseFloat((result * 100).toFixed(4)) + "%";
                } else if (format === "0") {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(4));
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

<svelte:head>
    <title>{$t("pages.equipment")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.equipment")} />
    <meta property="og:title" content={`${$t("pages.equipment")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.equipment")} />
</svelte:head>

<svelte:window on:scroll={checkScroll} on:resize={checkScroll} />

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full {$splitEquipmentView ? 'flex flex-col xl:flex-row justify-between items-start' : ''}">
    <div class="w-full {$splitEquipmentView ? 'xl:w-[calc(100%-min(770px,45%))] xl:mr-6' : ''}">
        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">
            <h2
                class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]"
            >
                {$t("pages.equipment")}
            </h2>
            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {filteredEquipment.length}
            </span>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[70%]'} mb-3">
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

                <EquipmentSortDropdown
                    slot="sortDropdown"
                    bind:sortParams={$equipmentSortParams}
                    onSortReset={resetSort}
                />

                <EquipmentFilterDropdown
                    slot="filterDropdown"
                    filters={equipFilters}
                    onFilterReset={resetFilters}
                    bind:selectedAttrType={selectedAttrType}
                />
            </DataToolbar>
        </div>

        <div class="w-full {$splitEquipmentView ? '' : 'xl:w-[69%]'} pb-12 flex flex-col gap-5 relative">
            {#if isGrouped}
                {#each displayedGroups as group}
                    <div class="flex flex-col gap-1 animate-fadeIn">
                        <div class="flex items-center gap-3 pb-2">
                            <h3
                                class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk"
                            >
                                {group.title}
                            </h3>
                        </div>

                        <div
                            class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start"
                        >
                            {#each group.list as eq (eq.id)}
                                {#if $splitEquipmentView}
                                    <button
                                        tabindex="0"
                                        type="button"
                                        class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                        on:click|preventDefault|stopPropagation={() => selectEquipment(eq.id)}
                                    >
                                        <WeaponCard weapon={eq} isEquipment={true} asLink={false} className="w-full h-full" />
                                        {#if selectedEquipmentId === eq.id}
                                            <div
                                                class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                            ></div>
                                        {/if}
                                    </button>
                                {:else}
                                    <div class="flex justify-center">
                                        <WeaponCard weapon={eq} isEquipment={true} />
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/each}
            {:else}
                <div
                    class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start animate-fadeIn"
                >
                    {#each displayedFlat as eq (eq.id)}
                        {#if $splitEquipmentView}
                            <button
                                tabindex="0"
                                type="button"
                                class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                on:click|preventDefault|stopPropagation={() => selectEquipment(eq.id)}
                            >
                                <WeaponCard weapon={eq} isEquipment={true} asLink={false} className="w-full h-full" />
                                {#if selectedEquipmentId === eq.id}
                                    <div
                                        class="absolute inset-[-3px] border-[3px] border-[#F9B90C] rounded-[9px] z-30 pointer-events-none"
                                    ></div>
                                {/if}
                            </button>
                        {:else}
                            <div class="flex justify-center">
                                <WeaponCard weapon={eq} isEquipment={true} />
                            </div>
                        {/if}
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

    {#if $splitEquipmentView}
        <BottomSheet
            bind:isOpen={isBottomSheetOpen}
            className="xl:sticky xl:top-6 xl:w-[770px] xl:max-w-[770px] shrink-0"
        >
            <div class="w-full min-h-[50vh] h-full xl:h-auto xl:max-h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar pb-8">
                {#if selectedEquipmentId}
                    <EquipmentDetailsView
                        id={selectedEquipmentId}
                        showBackButton={false}
                        onSelectEquipment={(id) => selectEquipment(id, true)}
                        onZoomImage={(code) => zoomImageUrl = code}
                    />
                {:else}
                    <div class="text-center py-20 px-6 text-gray-400 italic bg-white dark:bg-[#2b2b2b] rounded-3xl border border-gray-200 dark:border-[#444] shadow-sm flex flex-col items-center justify-center h-full xl:h-[calc(100vh-64px)] w-full">
                        <Icon name="noData" class="w-12 h-12 mb-3 opacity-30 mx-auto" />
                        <h3 class="text-lg font-bold text-[#21272C] dark:text-[#E4E4E4] not-italic mb-1 font-sdk">
                            {$t("emptyState.nothingSelected") || "Nothing selected"}
                        </h3>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 not-italic max-w-[320px]">
                            {$t("emptyState.clickEquipmentHint") || "Click on an equipment on the left to display its details."}
                        </p>
                    </div>
                {/if}
            </div>
        </BottomSheet>
    {/if}
</div>

{#if $splitEquipmentView && !isBottomSheetOpen && selectedEquipmentId}
    <button
        type="button"
        class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
        on:click={() => (isBottomSheetOpen = true)}
        title="Details"
    >
        <Icon name="inbox" class="w-6 h-6 text-black" />
    </button>
{/if}

<Modal isOpen={!!zoomImageUrl} on:close={() => zoomImageUrl = null}>
    {#if zoomImageUrl}
        <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center group pointer-events-auto">
            <img
                src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{zoomImageUrl}.jpg"
                alt="Blueprint location map full screen"
                class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
                referrerpolicy="no-referrer"
            />
            
            <button
                type="button"
                class="absolute -top-12 right-0 md:-right-12 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                on:click={() => zoomImageUrl = null}
            >
                <Icon name="close" class="w-6 h-6 text-white" />
            </button>
        </div>
    {/if}
</Modal>
