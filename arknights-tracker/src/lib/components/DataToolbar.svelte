<!-- src/lib/components/DataToolbar.svelte -->
<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icons.svelte";

    export let sortField = "rarity";
    export let sortDirection = "desc";
    export let searchQuery = "";

    const filterOptions = {
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
        weapon: ["sword", "polearm", "artsUnit", "greatSword", "handcannon"],
    };

    export let filters = {
        rarity: [...filterOptions.rarity],
        class: [...filterOptions.class],
        element: [...filterOptions.element],
        weapon: [...filterOptions.weapon],
    };

    const sortOptions = ["rarity", "class", "element"];

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
        const current = filters[groupKey];
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
        return filters[group].includes(value);
    };

    function clearSearch() {
        searchQuery = "";
    }

    $: isFilterActive =
        filters.rarity.length !== filterOptions.rarity.length ||
        filters.class.length !== filterOptions.class.length ||
        filters.element.length !== filterOptions.element.length ||
        filters.weapon.length !== filterOptions.weapon.length;

    function resetFilters() {
        filters = {
            rarity: [...filterOptions.rarity],
            class: [...filterOptions.class],
            element: [...filterOptions.element],
            weapon: [...filterOptions.weapon],
        };
    }

    function closeAll() {
        isSortDropdownOpen = false;
        isFilterOpen = false;
    }
</script>

<svelte:window on:click={closeAll} />

<!-- WRAPPER -->
<div class="flex flex-wrap gap-3 items-center w-full mb-6 relative z-40">
    <!-- 1. СОРТИРОВКА (Dropdown) -->
    <div class="relative">
        <button
            type="button"
            class="h-[40px] dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] px-4 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors min-w-[140px] justify-between cursor-pointer select-none"
            on:click|stopPropagation={toggleSortDropdown}
        >
            <span
                class="text-sm font-medium dark:text-[#E0E0E0] text-gray-700 capitalize pointer-events-none"
            >
                {$t(`sort.${sortField}`) || sortField}
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

    <!-- 2. НАПРАВЛЕНИЕ -->
    <button
        type="button"
        class="h-[40px] px-4 bg-gray-100 dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] hover:bg-gray-200 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
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

    <!-- 3. КНОПКА ФИЛЬТРА -->
    <div class="relative">
        <button
            type="button"
            aria-label="Filters"
            class="h-[40px] w-[40px] dark:bg-[#383838] dark:text-[#E0E0E0] dark:border-[#444444] hover:dark:bg-[#373737] flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer
            {isFilterActive
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'text-gray-800'}"
            on:click|stopPropagation={toggleFilterDropdown}
        >
            <Icon
                name="filter"
                class="w-4 h-4 text-current pointer-events-none"
            />
        </button>

        {#if isFilterOpen}
            <div
                class="
        dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-6 z-40 outline-none
        
        absolute top-[48px]
        
        left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[350px]
        
        sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] sm:max-w-[calc(100vw-2rem)]
        "
                role="dialog"
                aria-modal="true"
                tabindex="-1"
                on:click|stopPropagation
                on:keydown|stopPropagation
            >
                <!-- RARITY -->
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
                                class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-pointer
                                {isSelected('rarity', rar)
                                    ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]'
                                    : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
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

                <!-- CLASS -->
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
                                class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer
                                {isSelected('class', cls)
                                    ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]'
                                    : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                on:click={() => toggleFilterItem("class", cls)}
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

                <!-- ELEMENT -->
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
                                class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer
                                {isSelected('element', elm)
                                    ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]'
                                    : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
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

                <!-- Weapon -->
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
                                class="h-[32px] px-2 pr-3 rounded flex items-center gap-2 border transition-all cursor-pointer
                                {isSelected('weapon', wep)
                                    ? 'bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444]'
                                    : 'bg-white dark:bg-[#383838] border-gray-200 text-gray-400 opacity-60 dark:border-[#444444] dark:text-[#787878]'}"
                                on:click={() => toggleFilterItem("weapon", wep)}
                            >
                                <div
                                    class="w-5 h-5 flex items-center justify-center pointer-events-none"
                                >
                                    <Icon
                                        name={wep}
                                        class="w-full h-full text-current"
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

                <!-- КНОПКА СБРОСА -->
                <div
                    class="pt-2 border-t border-gray-200 dark:border-[#444444] flex justify-end"
                >
                    <button
                        type="button"
                        class="text-xs font-bold dark:text-[#B7B6B3] text-gray-500 hover:text-red-500 uppercase tracking-wider transition-colors px-2 py-1"
                        on:click={resetFilters}
                    >
                        {$t("sort.reset") || "Reset filters"}
                    </button>
                </div>
            </div>
        {/if}
    </div>


    <!-- 4. ПОИСК -->
    <div class="flex-grow max-w-[400px] relative">
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
            class="w-full h-[40px] dark:text-[#E0E0E0] dark:placeholder-[#E0E0E0] pl-10 pr-8 bg-gray-100 dark:bg-[#383838] dark:border-[#444444] hover:dark:bg-[#373737] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all placeholder-gray-500 text-gray-900"
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
