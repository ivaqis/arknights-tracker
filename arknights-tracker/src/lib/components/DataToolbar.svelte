<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icons.svelte";

    export let mode = "operators"; // "operators" | "weapons" | "equipment"
    export let sortField = "rarity";
    export let sortDirection = "desc";
    export let searchQuery = "";
    export let showOwnedOnly = false;
    export let availablePacks = [];
    export let groupMode = true;

    const skillIcons = {
        attr_atk: "atk",
        attr_hp: "hp",
        attr_agi: "agi",
        attr_str: "str",
        attr_wisd: "int",
        attr_will: "will",
        attr_firedam: "heat",
        attr_icedam: "cryo",
        attr_naturaldam: "nature",
        attr_phydam: "physical",
        attr_pulsedam: "electric",
        attr_crirate: "crirate",
        attr_usp: "usp",
        attr_heal: "heal",
        attr_physpell: "magicdam",
    };

    const elementColors = {
        attr_firedam: "text-[#FE633D]",
        attr_icedam: "text-[#22C6D0]",
        attr_naturaldam: "text-[#AFCD47] dark:text-[#C3E354]",
        attr_pulsedam: "text-[#FEC001]",
        attr_phydam: "text-slate-500 dark:text-slate-300",
    };

    const attr1Skills = [
        "attr_str",
        "attr_agi",
        "attr_wisd",
        "attr_will",
        "attr_main",
    ];
    const attr2Skills = [
        "attr_firedam", // Heat
        "attr_icedam", // Cryo
        "attr_naturaldam", // Nature
        "attr_phydam", // Physical
        "attr_pulsedam", // Electric
        "attr_magicdam", // Arts
        "attr_atk", // Attack
        "attr_crirate", // Crit Rate
        "attr_heal", // Healing
        "attr_hp", // HP
        "attr_physpell", // Arts Intensity
        "attr_usp", // Ultimate Gain
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

    const hardcodedStats = [
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
    $: filterOptions = {
        rarity:
            mode === "equipment"
                ? [5, 4, 3, 2, 1]
                : mode === "weapons"
                  ? [6, 5, 4, 3]
                  : [6, 5, 4],
        class: [
            "guard",
            "vanguard",
            "caster",
            "defender",
            "supporter",
            "striker",
        ],
        element: ["cryo", "physical", "nature", "heat", "electric"],
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        type: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
        attr1: attr1Skills,
        attr2: attr2Skills,
        attr3: attr3Skills,
        partType: [0, 1, 2], // 0 = body, 1 = hand, 2 = edc
        pack: ["none", ...(availablePacks || [])],
        stats: hardcodedStats.filter((s) => s.toLowerCase() !== "def"),
    };

    export let filters = (() => {
        if (mode === "equipment") {
            return {
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
        } else if (mode === "weapons") {
            return {
                rarity: [6, 5, 4, 3],
                type: [
                    "sword",
                    "polearm",
                    "artsUnit",
                    "greatSword",
                    "handcannon",
                ],
                attr1: [...attr1Skills],
                attr2: [...attr2Skills],
                attr3: [...attr3Skills],
            };
        } else {
            return {
                rarity: [6, 5, 4],
                class: [
                    "guard",
                    "vanguard",
                    "caster",
                    "defender",
                    "supporter",
                    "striker",
                ],
                element: ["cryo", "physical", "nature", "heat", "electric"],
                weapon: [
                    "sword",
                    "polearm",
                    "artsUnit",
                    "greatSword",
                    "handcannon",
                ],
            };
        }
    })();

    $: sortOptions =
        mode === "equipment"
            ? ["rarity"] //, "level", "partType", "pack"
            : mode === "weapons"
              ? ["rarity", "type"]
              : ["rarity", "class", "element", "weapon"];

    let isFilterOpen = false;
    let isSortDropdownOpen = false;
    let activeStatTab = "any";

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

    let dirtyGroups = {};
    export let manualMode = {
        rarity: false,
        class: false,
        element: false,
        weapon: false,
        type: false,
        attr1: false,
        attr2: false,
        attr3: false,
        partType: false,
        pack: false,
        stats: false,
    };

    function toggleFilterGroup(groupKey) {
        if (groupKey === "stats" && mode === "equipment") {
            filters = { ...filters, stats: { any: [], 1: [], 2: [], 3: [] } };
            activeStatTab = "any";
        } else {
            filters = { ...filters, [groupKey]: [...filterOptions[groupKey]] };
        }
        manualMode = { ...manualMode, [groupKey]: false };
    }

    function toggleFilterItem(groupKey, value) {
        const current = filters[groupKey] || [];
        const allOptions = filterOptions[groupKey];
        let newSelected;

        if (current.length === allOptions.length && !manualMode[groupKey]) {
            newSelected = [value];
            manualMode[groupKey] = true;
        } else {
            if (current.includes(value)) {
                if (current.length === 1) {
                    newSelected = [...allOptions];
                    manualMode[groupKey] = false;
                } else {
                    newSelected = current.filter((v) => v !== value);
                    manualMode[groupKey] = true;
                }
            } else {
                newSelected = [...current, value];
                manualMode[groupKey] = true;
            }
        }

        filters = { ...filters, [groupKey]: newSelected };
    }

    $: isSelected = (group, value) => {
        const current = filters[group] || [];
        const all = filterOptions[group];
        if (current.length === all.length) return false;
        return current.includes(value);
    };

    function clearSearch() {
        searchQuery = "";
    }

    $: isFilterActive =
        mode === "equipment"
            ? filters.rarity?.length !== filterOptions.rarity.length ||
              manualMode.rarity ||
              filters.partType?.length !== filterOptions.partType.length ||
              manualMode.partType ||
              (filters.pack?.length > 0 &&
                  filters.pack?.length !== filterOptions.pack.length) ||
              manualMode.pack ||
              (filters.stats &&
                  (filters.stats.any?.length > 0 ||
                      filters.stats[1]?.length > 0 ||
                      filters.stats[2]?.length > 0 ||
                      filters.stats[3]?.length > 0)) ||
              manualMode.stats ||
              showOwnedOnly
            : mode === "weapons"
              ? filters.rarity?.length !== filterOptions.rarity.length ||
                manualMode.rarity ||
                filters.type?.length !== filterOptions.type.length ||
                manualMode.type ||
                filters.attr1?.length !== filterOptions.attr1.length ||
                manualMode.attr1 ||
                filters.attr2?.length !== filterOptions.attr2.length ||
                manualMode.attr2 ||
                filters.attr3?.length !== filterOptions.attr3.length ||
                manualMode.attr3 ||
                showOwnedOnly
              : filters.rarity?.length !== filterOptions.rarity.length ||
                manualMode.rarity ||
                filters.class?.length !== filterOptions.class.length ||
                manualMode.class ||
                filters.element?.length !== filterOptions.element.length ||
                manualMode.element ||
                filters.weapon?.length !== filterOptions.weapon.length ||
                manualMode.weapon ||
                showOwnedOnly;

    function resetFilters() {
        manualMode = {};
        if (mode === "equipment") {
            filters = {
                rarity: [...filterOptions.rarity],
                partType: [...filterOptions.partType],
                pack: [],
                stats: { any: [], 1: [], 2: [], 3: [] },
            };
            activeStatTab = "any";
        } else if (mode === "weapons") {
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

    $: getFilterClass = (group, value) => {
        const current = filters[group] || [];
        const isSel = current.includes(value);
        const isManual = manualMode[group];

        if (!isManual) {
            return "bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a]";
        }

        if (isSel) {
            return "bg-[#F9B90C]/20 border-[#F9B90C] text-gray-900 dark:text-[#E0E0E0] dark:bg-[#FFB200]/50 dark:border-[#FFB200]";
        }

        return "bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878] hover:opacity-100 hover:bg-gray-50 hover:dark:bg-[#424242]";
    };

    $: statGroups =
        mode === "equipment" && filterOptions.stats
            ? [
                  filterOptions.stats.slice(0, 10),
                  filterOptions.stats.slice(10, 15),
                  filterOptions.stats.slice(15, 20),
                  filterOptions.stats.slice(20),
              ]
            : [];

    $: getStatClass = (stat, tab) => {
        const currentArr = filters.stats[tab] || [];
        const isSel = currentArr.includes(stat);
        const hasAnySelected = currentArr.length > 0;
        if (isSel) {
            return "border-[#F9B90C] bg-[#F9B90C]/10 text-[#F9B90C]";
        }
        if (!hasAnySelected) {
            return "bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a]";
        }
        return "bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878] hover:opacity-100 hover:bg-gray-50 hover:dark:bg-[#424242]";
    };
</script>

<svelte:window on:click={closeAll} />

<div class="flex flex-wrap gap-3 items-center w-full mb-6 relative z-40">
    <div class="relative">
        <button
            type="button"
            class="h-[40px] dark:bg-[#383838] dark:border dark:border-[#444444] hover:dark:bg-[#373737] px-4 bg-gray-200 hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors min-w-[140px] justify-between cursor-pointer select-none"
            on:click|stopPropagation={toggleSortDropdown}
        >
            <span
                class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 capitalize pointer-events-none"
            >
                {$t("sort.title") || "Sort"}
            </span>
            <svg
                class="w-4 h-4 text-gray-500 transition-transform {isSortDropdownOpen
                    ? 'rotate-180'
                    : ''}"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                />
            </svg>
        </button>

        {#if isSortDropdownOpen}
            <div
                class="dark:bg-[#383838] dark:border-[#444444] absolute top-[48px] left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 flex flex-col z-40"
            >
                {#each sortOptions as option}
                    <button
                        type="button"
                        class="px-4 py-2.5 text-left text-sm hover:bg-gray-50 hover:dark:bg-[#424242] transition-colors capitalize cursor-pointer {sortField ===
                        option
                            ? 'text-black font-bold bg-gray-50 dark:text-[#E0E0E0] dark:bg-[#424242]'
                            : 'text-gray-600 dark:text-[#B7B6B3]'}"
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
        <span
            class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 pointer-events-none"
        >
            {$t(`sort.${sortDirection}`) ||
                (sortDirection === "asc" ? "Asc" : "Desc")}
        </span>
        {#if sortDirection === "asc"}
            <Icon
                name="asc"
                class="w-3 h-4 text-current pointer-events-none dark:text-[#E0E0E0]"
            />
        {:else}
            <Icon
                name="desc"
                class="w-3 h-4 text-current pointer-events-none dark:text-[#E0E0E0]"
            />
        {/if}
    </button>

    <div class="relative">
        <div
            class="flex items-center h-[40px] rounded-full transition-colors {isFilterActive
                ? 'bg-[#F9B90C] text-black dark:bg-[#F9B90C] dark:text-black shadow-sm'
                : 'bg-gray-200 text-gray-800 dark:bg-[#383838] dark:text-[#E0E0E0] dark:border-[#444444] dark:border'}"
        >
            <button
                type="button"
                aria-label="Filters"
                class="flex items-center gap-2 h-full pl-4 {isFilterActive
                    ? 'pr-3 rounded-l-full hover:bg-[#E5AA0B] dark:hover:bg-[#E5AA0B]'
                    : 'pr-4 rounded-full hover:bg-gray-300 hover:dark:bg-[#373737]'}"
                on:click|stopPropagation={toggleFilterDropdown}
            >
                <Icon
                    name="filter"
                    class="w-4 h-4 text-current pointer-events-none"
                />
                <span class="text-sm pointer-events-none">
                    {$t("sort.filters") || "Filters"}
                </span>
            </button>

            {#if isFilterActive}
                <div
                    class="w-[1px] h-4 bg-black/20 shrink-0 pointer-events-none"
                ></div>

                <div
                    class="flex items-center justify-center px-2 h-full rounded-r-full"
                >
                    <button
                        type="button"
                        aria-label="Clear filters"
                        class="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-black/10 hover:bg-black/25 dark:bg-black/15 dark:hover:bg-black/30 transition-colors cursor-pointer"
                        on:click|stopPropagation={resetFilters}
                        title={$t("sort.reset") || "Reset filters"}
                    >
                        <svg
                            class="w-[10px] h-[10px] text-black/80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="3"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>
            {/if}
        </div>

        {#if isFilterOpen}
            <div
                class="dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-3 outline-none overflow-y-auto z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[350px] max-h-[85vh] sm:absolute sm:top-[48px] sm:left-0 sm:transform-none sm:w-[500px] sm:max-w-[calc(100vw-2rem)]"
                role="dialog"
                aria-modal="true"
                tabindex="-1"
                on:click|stopPropagation
                on:keydown|stopPropagation
            >
                <div class="flex justify-between">
                    {#if mode !== "equipment"}
                        <div class="flex items-center gap-3">
                            <span
                                class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800"
                            >
                                {$t("sort.ownedOnly") || "Owned Only"}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-label="switch"
                                aria-checked={showOwnedOnly}
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {showOwnedOnly
                                    ? 'bg-[#F9B90C]'
                                    : 'bg-gray-200 dark:bg-[#555]'}"
                                on:click={toggleOwnedOnly}
                            >
                                <span
                                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {showOwnedOnly
                                        ? 'translate-x-6'
                                        : 'translate-x-1'} shadow-sm"
                                ></span>
                            </button>
                        </div>
                    {/if}
                    <div class="flex justify-end">
                        <button
                            type="button"
                            class="text-xs font-bold text-gray-500 mb-2 dark:text-gray-400 border border-gray-300 dark:border-[#444444] rounded-full px-4 py-1.5 hover:text-[#F9B90C] hover:border-[#F9B90C] hover:bg-white hover:dark:bg-[#FFB200]/80 hover:dark:border-[#FFB200] hover:dark:text-[#E0E0E0] transition-all uppercase tracking-wider"
                            on:click={resetFilters}
                        >
                            {$t("sort.reset") || "Reset filters"}
                        </button>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                        on:click={() => toggleFilterGroup("rarity")}
                    >
                        {$t("sort.rarity") || "Rarity"}
                    </button>
                    <div class="flex flex-wrap gap-2">
                        {#each filterOptions.rarity as rar}
                            <button
                                type="button"
                                class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                    'rarity',
                                    rar,
                                )}"
                                on:click={() => toggleFilterItem("rarity", rar)}
                            >
                                <span class="font-bold pointer-events-none"
                                    >{rar}</span
                                >
                                <Icon
                                    name="star"
                                    class="w-3 h-3 text-current pointer-events-none"
                                />
                            </button>
                        {/each}
                    </div>
                </div>

                {#if mode === "operators"}
                    <div>
                        <button
                            type="button"
                            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("class")}
                        >
                            {$t("sort.class") || "Class"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.class as cls}
                                <button
                                    type="button"
                                    class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer {getFilterClass(
                                        'class',
                                        cls,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("class", cls)}
                                >
                                    <div
                                        class="w-5 h-5 bg-[#2A2A2A] rounded flex items-center justify-center pointer-events-none"
                                    >
                                        <Icon
                                            name={cls}
                                            class="w-3.5 h-3.5 text-white"
                                        />
                                    </div>
                                    <span
                                        class="text-xs font-bold capitalize pointer-events-none"
                                        >{$t(`classes.${cls}`) || cls}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("element")}
                        >
                            {$t("sort.element") || "Element"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.element as elm}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'element',
                                        elm,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("element", elm)}
                                >
                                    <div
                                        class="w-5 h-5 flex items-center justify-center pointer-events-none"
                                    >
                                        <Icon
                                            name={elm}
                                            class="w-full h-full text-current"
                                        />
                                    </div>
                                    <span
                                        class="text-xs font-bold capitalize pointer-events-none"
                                        >{$t(`elements.${elm}`) || elm}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("weapon")}
                        >
                            {$t("sort.weapon") || "Weapon"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.weapon as wep}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'weapon',
                                        wep,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("weapon", wep)}
                                >
                                    <div
                                        class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]"
                                    >
                                        <Icon
                                            name={wep}
                                            class="w-3.5 h-3.5 text-white"
                                        />
                                    </div>
                                    <span
                                        class="text-xs font-bold capitalize pointer-events-none"
                                        >{$t(`weapons.${wep}`) || wep}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if mode === "weapons"}
                    <div>
                        <button
                            type="button"
                            class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("type")}
                        >
                            {$t("sort.type") || "Type"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.type as wep}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'type',
                                        wep,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("type", wep)}
                                >
                                    <div
                                        class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]"
                                    >
                                        <Icon
                                            name={wep}
                                            class="w-3.5 h-3.5 text-white"
                                        />
                                    </div>
                                    <span
                                        class="text-xs font-bold capitalize pointer-events-none"
                                        >{$t(`weapons.${wep}`) || wep}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("attr1")}
                            >{$t("sort.attribute1") || "Attribute 1"}</button
                        >
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.attr1 as skill}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'attr1',
                                        skill,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("attr1", skill)}
                                >
                                    {#if skillIcons[skill]}<div
                                            class="w-5 h-5 bg-[#2A2A2A] border border-[#3A3A3A] rounded-[4px] flex items-center justify-center pointer-events-none"
                                        >
                                            <Icon
                                                name={skillIcons[skill]}
                                                class="w-3 h-3 text-white pointer-events-none"
                                            />
                                        </div>{/if}
                                    <span
                                        class="text-xs font-bold pointer-events-none"
                                        >{$t(`skills.${skill}`) || skill}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("attr2")}
                        >
                            {$t("sort.attribute2") || "Attribute 2"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.attr2 as skill}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'attr2',
                                        skill,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("attr2", skill)}
                                >
                                    {#if skillIcons[skill]}
                                        {#if elementColors[skill]}
                                            <Icon
                                                name={skillIcons[skill]}
                                                class="w-4 h-4 pointer-events-none {elementColors[
                                                    skill
                                                ]}"
                                            />
                                        {:else}
                                            <div
                                                class="w-5 h-5 bg-[#2A2A2A] border border-[#3A3A3A] rounded-[4px] flex items-center justify-center pointer-events-none"
                                            >
                                                <Icon
                                                    name={skillIcons[skill]}
                                                    class="w-3 h-3 text-white pointer-events-none"
                                                />
                                            </div>
                                        {/if}
                                    {/if}
                                    <span
                                        class="text-xs font-bold pointer-events-none {elementColors[
                                            skill
                                        ] || 'text-current'}"
                                    >
                                        {$t(`skills.${skill}`) || skill}
                                    </span>
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("attr3")}
                            >{$t("sort.attribute3") || "Attribute 3"}</button
                        >
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.attr3 as skill}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'attr3',
                                        skill,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("attr3", skill)}
                                >
                                    {#if skillIcons[skill]}<Icon
                                            name={skillIcons[skill]}
                                            class="w-4 h-4 text-current pointer-events-none"
                                        />{/if}
                                    <span
                                        class="text-xs font-bold pointer-events-none"
                                        >{$t(`skills.${skill}`) || skill}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if mode === "equipment"}
                    <div>
                        <button
                            type="button"
                            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("stats")}
                        >
                            {$t("sort.stats") || "Attributes"}
                        </button>

                        <div
                            class="flex items-center gap-1 bg-gray-100 dark:bg-[#2C2C2C] p-1 rounded-lg mb-3 w-fit"
                        >
                            {#each [{ id: "any", label: $t("essencesPage.anyAttr") }, { id: 1, label: $t("essencesPage.attr1") }, { id: 2, label: $t("essencesPage.attr2") }, { id: 3, label: $t("essencesPage.attr3") }] as tab}
                                {@const hasItems =
                                    filters.stats[tab.id] &&
                                    filters.stats[tab.id].length > 0}
                                {@const isActive = activeStatTab === tab.id}

                                <button
                                    type="button"
                                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all text-xs
                                    {isActive
                                        ? 'bg-white dark:bg-[#444] shadow-sm text-[#21272C] dark:text-white'
                                        : 'hover:bg-gray-200 dark:hover:bg-[#333]'} 
                                    {!isActive && hasItems
                                        ? 'text-[#F9B90C]'
                                        : ''} 
                                    {!isActive && !hasItems
                                        ? 'text-gray-500 dark:text-gray-400'
                                        : ''}"
                                    on:click={() => (activeStatTab = tab.id)}
                                >
                                    {tab.label}

                                    {#if hasItems}
                                        <div
                                            class="w-1.5 h-1.5 rounded-full bg-[#F9B90C] {isActive
                                                ? 'shadow-[0_0_6px_rgba(249,185,12,0.6)]'
                                                : ''}"
                                        ></div>
                                    {/if}
                                </button>
                            {/each}
                        </div>

                        <div class="flex flex-col gap-2.5">
                            {#each statGroups as group, index}
                                <div
                                    class="flex flex-wrap gap-2 {index <
                                    statGroups.length - 1
                                        ? 'pb-2.5 border-b border-gray-200/60 dark:border-[#444]/50'
                                        : ''}"
                                >
                                    {#each group as stat}
                                        {@const statIcon =
                                            stat.toLowerCase() === "maxhp"
                                                ? "hp"
                                                : stat.toLowerCase()}
                                        <button
                                            type="button"
                                            class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getStatClass(
                                                stat,
                                                activeStatTab,
                                            )}"
                                            on:click={() => {
                                                manualMode.stats = true;
                                                let newStats = {
                                                    ...filters.stats,
                                                };
                                                if (activeStatTab === "any") {
                                                    newStats[1] = [];
                                                    newStats[2] = [];
                                                    newStats[3] = [];
                                                } else {
                                                    newStats.any = [];
                                                }
                                                const currentArr =
                                                    newStats[activeStatTab];
                                                if (currentArr.includes(stat)) {
                                                    newStats[activeStatTab] =
                                                        currentArr.filter(
                                                            (s) => s !== stat,
                                                        );
                                                } else {
                                                    newStats[activeStatTab] = [
                                                        ...currentArr,
                                                        stat,
                                                    ];
                                                }
                                                filters.stats = newStats;
                                            }}
                                        >
                                            <div
                                                class="w-5 h-5 bg-[#2A2A2A] border border-[#3A3A3A] rounded-[4px] flex items-center justify-center pointer-events-none"
                                            >
                                                <Icon
                                                    name={statIcon}
                                                    class="w-3 h-3 text-white pointer-events-none"
                                                />
                                            </div>
                                            <span
                                                class="text-xs font-bold pointer-events-none"
                                                >{$t(`equipSkills.${stat}`) ||
                                                    stat}</span
                                            >
                                        </button>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                            on:click={() => toggleFilterGroup("pack")}
                        >
                            {$t("sort.pack") || "Set / Pack"}
                        </button>
                        <div class="flex flex-wrap gap-2">
                            {#each filterOptions.pack as pack}
                                <button
                                    type="button"
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer {getFilterClass(
                                        'pack',
                                        pack,
                                    )}"
                                    on:click={() =>
                                        toggleFilterItem("pack", pack)}
                                >
                                    <span
                                        class="text-xs font-bold capitalize pointer-events-none"
                                        >{$t(`packs.${pack}`) || pack}</span
                                    >
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <div class="flex-grow max-w-[400px] relative">
        <div class="relative flex-grow">
            <div
                class="absolute left-3 top-1/2 -translate-y-1/2 dark:text-[#E0E0E0] text-gray-500 pointer-events-none"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path></svg
                >
            </div>

            <input
                type="text"
                bind:value={searchQuery}
                class="w-full h-[40px] dark:border-[#444444] dark:border dark:text-[#E0E0E0] dark:placeholder-[#E0E0E0] pl-10 pr-8 bg-gray-200 dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all placeholder-gray-500 text-gray-900"
                placeholder={$t("sort.search") || "Search..."}
            />

            {#if searchQuery}
                <button
                    type="button"
                    aria-label="Clear search"
                    class="absolute right-3 top-1/2 -translate-y-1/2 dark:text-[#E0E0E0] text-gray-400 hover:text-gray-600 cursor-pointer"
                    on:click={clearSearch}
                >
                    <svg
                        class="w-4 h-4 pointer-events-none"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        ><path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"
                        /></svg
                    >
                </button>
            {/if}
        </div>
    </div>
    {#if mode === "equipment"}
        <button
            type="button"
            class="h-[40px] w-[40px] flex shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer {groupMode
                ? 'bg-[#F9B90C] text-black hover:bg-[#E5AA0B] dark:bg-[#F9B90C] dark:text-black dark:hover:bg-[#E5AA0B]'
                : 'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-[#383838] dark:text-[#787878] dark:border-[#444444] dark:border hover:dark:bg-[#373737]'}"
            on:click={() => (groupMode = !groupMode)}
            title="Toggle Grouping"
        >
            <svg
                class="w-5 h-5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                {#if groupMode}
                    <Icon name="list" />
                {:else}
                    <Icon name="grid" />
                {/if}
            </svg>
        </button>
    {/if}
</div>
