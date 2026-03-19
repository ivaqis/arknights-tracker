<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icons.svelte";

    export let mode = "operators"; // "operators" | "weapons"
    export let sortField = "rarity";
    export let sortDirection = "desc";
    export let searchQuery = "";
    export let showOwnedOnly = false;

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

    const attr1Skills = ["attr_agi", "attr_str", "attr_will", "attr_wisd", "attr_main"];
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
        "tacafter", "magabn", "burst", "spirit", "tactic", "ult", "break", 
        "combo", "crit", "force", "heal", "keyword", "phyabn", "smash"
    ];

    $: filterOptions = {
        rarity: mode === "weapons" ? [6, 5, 4, 3] : [6, 5, 4],
        class: ["guard", "vanguard", "caster", "defender", "supporter", "striker"],
        element: ["cryo", "physical", "nature", "heat", "electric"],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        attr1: attr1Skills,
        attr2: attr2Skills,
        attr3: attr3Skills
    };

    export let filters = mode === "weapons" ? {
        rarity: [6, 5, 4, 3],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        attr1: [...attr1Skills],
        attr2: [...attr2Skills],
        attr3: [...attr3Skills]
    } : {
        rarity: [6, 5, 4],
        class: ["guard", "vanguard", "caster", "defender", "supporter", "striker"],
        element: ["cryo", "physical", "nature", "heat", "electric"],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
    };

    $: sortOptions = mode === "weapons" 
        ? ["rarity", "type"] 
        : ["rarity", "class", "element", "weapon"];

    let isFilterOpen = false;
    let isSortDropdownOpen = false;

    function toggleSortDirection() {
        sortDirection = sortDirection === "desc" ? "asc" : "desc";
    }

    function toggleSortDropdown() {
        isSortDropdownOpen = !isSortDropdownOpen;
        if (isSortDropdownOpen) isFilterOpen = false;
    }

    function toggleFilterDropdown() {
        isFilterOpen = !isFilterOpen;
        if (isFilterOpen) isSortDropdownOpen = false;
    }

    function setSortField(field) {
        sortField = field;
        isSortDropdownOpen = false;
    }

    function toggleFilterGroup(groupKey) {
        filters = { ...filters, [groupKey]: [] };
    }

    function toggleFilterItem(groupKey, value) {
        const current = filters[groupKey] || [];
        const allOptions = filterOptions[groupKey];
        let newSelected;

        if (current.length === allOptions.length) {
            newSelected = [value];
        } else {
            if (current.includes(value)) {
                if (current.length === 1) {
                    newSelected = [...allOptions];
                } else {
                    newSelected = current.filter((v) => v !== value);
                }
            } else {
                newSelected = [...current, value];
            }
        }

        filters = { ...filters, [groupKey]: newSelected };
    }

    $: isSelected = (group, value) => {
        return (filters[group] || []).includes(value);
    };

    function clearSearch() {
        searchQuery = "";
    }

    $: isFilterActive = mode === "weapons" 
        ? (filters.rarity?.length !== filterOptions.rarity.length || 
           filters.type?.length !== filterOptions.type.length || 
           filters.attr1?.length !== filterOptions.attr1.length || 
           filters.attr2?.length !== filterOptions.attr2.length || 
           filters.attr3?.length !== filterOptions.attr3.length || 
           showOwnedOnly)
        : (filters.rarity?.length !== filterOptions.rarity.length || 
           filters.class?.length !== filterOptions.class.length || 
           filters.element?.length !== filterOptions.element.length || 
           filters.weapon?.length !== filterOptions.weapon.length || 
           showOwnedOnly);

    function resetFilters() {
        if (mode === "weapons") {
            filters = {
                rarity: [...filterOptions.rarity],
                type: [...filterOptions.type],
                attr1: [...filterOptions.attr1],
                attr2: [...filterOptions.attr2],
                attr3: [...filterOptions.attr3],
            };
        } else {
            filters = {
                rarity: [...filterOptions.rarity],
                class: [...filterOptions.class],
                element: [...filterOptions.element],
                weapon: [...filterOptions.weapon],
            };
        }
        showOwnedOnly = false;
        isFilterOpen = false;
    }

    function closeAll() {
        isSortDropdownOpen = false;
        isFilterOpen = false;
    }

    function toggleOwnedOnly() {
        showOwnedOnly = !showOwnedOnly;
    }
</script>

<svelte:window on:click={closeAll} />

<div class="flex flex-wrap gap-3 items-center w-full mb-6 relative z-40">
    <div class="relative">
        <button
            type="button"
            class="h-[40px] dark:bg-[#383838] dark:border dark:border-[#444444] hover:dark:bg-[#373737] px-4 bg-gray-200 hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors min-w-[140px] justify-between cursor-pointer select-none"
            on:click|stopPropagation={toggleSortDropdown}
        >
            <span class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 capitalize pointer-events-none">
                {$t("sort.title") || "Sort"}
            </span>
            <svg class="w-4 h-4 text-gray-500 transition-transform {isSortDropdownOpen ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>

        {#if isSortDropdownOpen}
            <div class="dark:bg-[#383838]  dark:border-[#444444] absolute top-[48px] left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 flex flex-col z-40">
                {#each sortOptions as option}
                    <button
                        type="button"
                        class="px-4 py-2.5 text-left  text-sm hover:bg-gray-50 hover:dark:bg-[#424242] transition-colors capitalize cursor-pointer {sortField === option ? 'text-black font-bold bg-gray-50 dark:text-[#E0E0E0] dark:bg-[#424242]' : 'text-gray-600 dark:text-[#B7B6B3]'}"
                        on:click|stopPropagation={() => setSortField(option)}
                    >
                        {$t(`sort.${option}`) || option}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <button
        type="button"
        class="h-[40px] px-4 bg-gray-200 dark:border dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
        on:click={toggleSortDirection}
    >
        <span class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 pointer-events-none">
            {$t(`sort.${sortDirection}`) || (sortDirection === "asc" ? "Asc" : "Desc")}
        </span>
        {#if sortDirection === "asc"}
            <Icon name="asc" class="w-3 h-4 text-current pointer-events-none dark:text-[#E0E0E0]" />
        {:else}
            <Icon name="desc" class="w-3 h-4 text-current pointer-events-none dark:text-[#E0E0E0]" />
        {/if}
    </button>

    <div class="relative">
        <button
            type="button"
            aria-label="Filters"
            class="h-[40px] px-4 gap-2 flex items-center justify-center rounded-full transition-colors cursor-pointer {isFilterActive ? 'bg-[#F9B90C] text-black hover:bg-[#E5AA0B] dark:bg-[#F9B90C] dark:text-black dark:hover:bg-[#E5AA0B]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-[#383838] dark:text-[#E0E0E0] dark:border-[#444444] dark:border hover:dark:bg-[#373737]'}"
            on:click|stopPropagation={toggleFilterDropdown}
        >
            <Icon name="filter" class="w-4 h-4 text-current pointer-events-none" />
            <span class="text-sm pointer-events-none">
                {$t("sort.filters") || "Filters"}
            </span>
        </button>

        {#if isFilterOpen}
            <div
                class="dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-6 z-40 outline-none absolute top-[48px] left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[350px] sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] sm:max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto"
                role="dialog" aria-modal="true" tabindex="-1"
                on:click|stopPropagation
                on:keydown|stopPropagation
            >
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-[#444444] pb-4">
                    <span class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800">
                        {$t("sort.ownedOnly") || "Owned Only"}
                    </span>
                    <button 
                        type="button" 
                        role="switch" 
                        aria-label="Owned switch"
                        aria-checked={showOwnedOnly}
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {showOwnedOnly ? 'bg-[#F9B90C]' : 'bg-gray-200 dark:bg-[#555]'}"
                        on:click={toggleOwnedOnly}
                    >
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {showOwnedOnly ? 'translate-x-6' : 'translate-x-1'} shadow-sm"></span>
                    </button>
                </div>

                <div>
                    <button type="button" class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("rarity")}>
                        {$t("sort.rarity") || "Rarity"}
                    </button>
                    <div class="flex flex-wrap gap-2">
                        {#each filterOptions.rarity as rar}
                            <button
                                type="button"
                                class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {isSelected('rarity', rar) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                on:click={() => toggleFilterItem("rarity", rar)}
                            >
                                <span class="font-bold pointer-events-none">{rar}</span>
                                <Icon name="star" class="w-3 h-3 text-current pointer-events-none" />
                            </button>
                        {/each}
                    </div>
                </div>

                {#if mode !== 'weapons'}
                    <div>
                        <button type="button" class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("class")}>
                            {$t("sort.class") || "Class"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.class as cls}
                                <button
                                    type="button"
                                    class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer {isSelected('class', cls) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("class", cls)}
                                >
                                    <div class="w-5 h-5 bg-[#2A2A2A] rounded flex items-center justify-center pointer-events-none">
                                        <Icon name={cls} class="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span class="text-xs font-bold capitalize pointer-events-none">{$t(`classes.${cls}`) || cls}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <div>
                        <button type="button" class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("element")}>
                            {$t("sort.element") || "Element"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.element as elm}
                                <button
                                    type="button"
                                    class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer {isSelected('element', elm) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("element", elm)}
                                >
                                    <div class="w-5 h-5 flex items-center justify-center pointer-events-none">
                                        <Icon name={elm} class="w-full h-full text-current" />
                                    </div>
                                    <span class="text-xs font-bold capitalize pointer-events-none">{$t(`elements.${elm}`) || elm}</span>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if mode === 'operators'}
                    <div>
                        <button type="button" class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("weapon")}>
                            {$t("sort.weapon") || "Weapon"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.weapon as wep}
                                <button
                                    type="button"
                                    class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer {isSelected('weapon', wep) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("weapon", wep)}
                                >
                                    <div class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]">
                                        <Icon name={wep} class="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span class="text-xs font-bold capitalize pointer-events-none">{$t(`weapons.${wep}`) || wep}</span>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if mode === 'weapons'}
                    <div>
                        <button type="button" class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("type")}>
                            {$t("sort.type") || "Type"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.type as wep}
                                <button
                                    type="button"
                                    class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer {isSelected('type', wep) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("type", wep)}
                                >
                                    <div class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]">
                                        <Icon name={wep} class="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span class="text-xs font-bold capitalize pointer-events-none">{$t(`weapons.${wep}`) || wep}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <div>
                        <button type="button" class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("attr1")}>
                            {$t("sort.attribute1") || "Атрибут 1"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.attr1 as skill}
                                <button
                                    type="button"
                                    class="h-[32px] px-2 pr-3 rounded flex items-center justify-center gap-1.5 border transition-all cursor-pointer {isSelected('attr1', skill) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("attr1", skill)}
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
                        <button type="button" class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("attr2")}>
                            {$t("sort.attribute2") || "Attribute 2"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.attr2 as skill}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center justify-center gap-1.5 border transition-all cursor-pointer {isSelected('attr2', skill) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("attr2", skill)}
                                >
                                    {#if skillIcons[skill]}
                                        {#if elementColors[skill]}
                                            <Icon 
                                                name={skillIcons[skill]} 
                                                class="w-4 h-4 pointer-events-none {elementColors[skill]}" 
                                            />
                                        {:else}
                                            <div class="w-5 h-5 bg-[#2A2A2A] dark:bg-[#2A2A2A] border border-[#3A3A3A] rounded-[4px] flex items-center justify-center pointer-events-none">
                                                <Icon 
                                                    name={skillIcons[skill]} 
                                                    class="w-3 h-3 text-white pointer-events-none" 
                                                />
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
                        <button type="button" class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70" on:click={() => toggleFilterGroup("attr3")}>
                            {$t("sort.attribute3") || "Attribute 3"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.attr3 as skill}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center justify-center gap-1.5 border transition-all cursor-pointer {isSelected('attr3', skill) ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]' : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                    on:click={() => toggleFilterItem("attr3", skill)}
                                >
                                    {#if skillIcons[skill]}
                                        <Icon name={skillIcons[skill]} class="w-4 h-4 text-current pointer-events-none" />
                                    {/if}
                                    <span class="text-xs font-bold pointer-events-none">{$t(`skills.${skill}`) || skill}</span>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <div class="pt-2 border-t border-gray-200 dark:border-[#444444] flex justify-end">
                    <button type="button" class="text-xs font-bold dark:text-[#B7B6B3] text-gray-500 hover:text-red-500 uppercase tracking-wider transition-colors px-2 py-1" on:click={resetFilters}>
                        {$t("sort.reset") || "Reset filters"}
                    </button>
                </div>
            </div>
        {/if}
    </div>

    <div class="flex-grow max-w-[400px] relative">
        <div class="absolute left-3 top-1/2 -translate-y-1/2 dark:text-[#E0E0E0] text-gray-500 pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <input
            type="text"
            bind:value={searchQuery}
            class="w-full h-[40px] dark:border-[#444444] dark:border dark:text-[#E0E0E0] dark:placeholder-[#E0E0E0] pl-10 pr-8 bg-gray-200 dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all placeholder-gray-500 text-gray-900"
            placeholder={$t("sort.search") || "Search..."}
        />

        {#if searchQuery}
            <button type="button" aria-label="Clear search" class="absolute right-3 top-1/2 -translate-y-1/2 dark:text-[#E0E0E0] text-gray-400 hover:text-gray-600 cursor-pointer" on:click={clearSearch}>
                <svg class="w-4 h-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
            </button>
        {/if}
    </div>
</div>