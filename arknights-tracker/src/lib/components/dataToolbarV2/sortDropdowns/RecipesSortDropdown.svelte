<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { getDefaultItemSortParams } from "$lib/stores/filterStore.js";

    export let sortParams = {};

    export let onSortReset = () => {
        sortParams = getDefaultItemSortParams();
    };

    function switchLocaleSort() {
        let current = sortParams.sortFieldParams.localeName;
        sortParams.sortFieldParams.localeName = current === "a-z" ? "z-a" : "a-z";
    }

    function getSortFieldLocale(sortFieldName) {
        switch (sortFieldName) {
            case "itemGroups":
                return $t("sort.itemGroup");
            case "events":
                return $t("sort.eventsTitle");
            case "itemTypes":
                return $t("sort.itemTypesTitle");
            case "itemMaterials":
                return $t("sort.itemMaterialsTitle");
            case "localeName":
                return $t("sort.localeNameTitle");
            default:
                return $t(`sort.${sortFieldName}`);
        }
    }

    function getFilterNameLocale(sortFieldName, filterName) {
        if (sortFieldName === "rarity") {
            return filterName;
        }

        if (sortFieldName === "events") {
            if (filterName === "nonEvent") {
                return $t("sort.events.nonEvent");
            }

            return $t(FactoryEvent.getEvent(filterName)?.title);
        }

        return $t(`sort.${sortFieldName}.${filterName}`);
    }

    let openedSortField = null;

    function toggleSortField(sortFieldName) {
        if (openedSortField === sortFieldName) {
            openedSortField = null;
            return;
        }

        openedSortField = sortFieldName;
    }

    $: isSortFieldOpen = (sortFieldName) => sortFieldName === openedSortField;

    let draggedSortField = null;
    let dragOverSortField = null;

    function handleSortFieldDragStart(event, sortFieldName) {
        openedSortField = null;
        draggedSortField = sortFieldName;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData("text/plain", "sortField:" + sortFieldName);
    }

    function handleSortFieldDragEnter(event, sortFieldName) {
        event.preventDefault();

        if (!draggedSortField || draggedSortField === sortFieldName) return;

        dragOverSortField = sortFieldName;

        const currentOrder = [...sortParams.sortFieldOrder];
        const sourceIndex = currentOrder.indexOf(draggedSortField);
        const targetIndex = currentOrder.indexOf(sortFieldName);

        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
            currentOrder.splice(sourceIndex, 1);
            currentOrder.splice(targetIndex, 0, draggedSortField);
            sortParams.sortFieldOrder = currentOrder;
        }
    }

    let draggedFilter = null;
    let draggedFilterField = null;
    let dragOverFilter = null;

    function handleFilterDragStart(event, sortFieldName, filterName) {
        draggedFilter = filterName;
        draggedFilterField = sortFieldName;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", "filter:" + sortFieldName + ":" + filterName);
        event.stopPropagation();
    }

    let dragDebounceTimer = null;

    function handleFilterDragEnter(event, sortFieldName, filterName) {
        event.preventDefault();
        event.stopPropagation();

        if (!draggedFilter || !draggedFilterField) return;
        if (draggedFilterField !== sortFieldName) return;
        if (draggedFilter === filterName) return;

        if (dragOverFilter === filterName) return;

        dragOverFilter = filterName;

        if (dragDebounceTimer) {
            clearTimeout(dragDebounceTimer);
        }

        dragDebounceTimer = setTimeout(() => {
            const currentFilters = [...sortParams.sortFieldParams[sortFieldName]];
            const sourceIndex = currentFilters.indexOf(draggedFilter);
            const targetIndex = currentFilters.indexOf(filterName);

            if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
                const newFilters = [...currentFilters];
                const [movedItem] = newFilters.splice(sourceIndex, 1);
                newFilters.splice(targetIndex, 0, movedItem);

                sortParams.sortFieldParams = {
                    ...sortParams.sortFieldParams,
                    [sortFieldName]: newFilters
                };
            }
        }, 50);
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnd() {
        draggedSortField = null;
        dragOverSortField = null;
        draggedFilter = null;
        draggedFilterField = null;
        dragOverFilter = null;
    }

    function handleDrop(event) {
        event.preventDefault();
        draggedSortField = null;
        dragOverSortField = null;
        draggedFilter = null;
        draggedFilterField = null;
        dragOverFilter = null;
    }
</script>

<div
    class="z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[350px] max-h-[85vh] sm:relative sm:w-[500px] sm:max-w-[calc(100vw-2rem)] sm:transform-none sm:left-0 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col gap-3 outline-none overflow-y-auto"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|stopPropagation
    on:keydown|stopPropagation
>

    <div class="flex justify-start">

        <button
            class="text-xs font-bold text-gray-500 mb-2 dark:text-gray-400 border border-gray-300 dark:border-[#444444] rounded-full px-4 py-1.5 hover:text-[#F9B90C] hover:border-[#F9B90C] hover:bg-white hover:dark:bg-[#FFB200]/80 hover:dark:border-[#FFB200] hover:dark:text-[#E0E0E0] transition-all uppercase tracking-wider"
            on:click={onSortReset}
        >
            {$t("sort.reset")}
        </button>

    </div>

    {#each sortParams.sortFieldOrder as sortFieldName}

        <div
            class="flex flex-row transition-all duration-200 rounded-lg {
                draggedSortField === sortFieldName
                    ? 'opacity-40 scale-95'
                    : ''
            }"
            draggable="true"
            role="listitem"
            on:dragstart={(e) => handleSortFieldDragStart(e, sortFieldName)}
            on:dragenter={(e) => handleSortFieldDragEnter(e, sortFieldName)}
            on:dragover={handleDragOver}
            on:drop={handleDrop}
            on:dragend={handleDragEnd}
        >

            <div class="h-4 w-4 pt-[1px] mr-3 cursor-grab active:cursor-grabbing">

                <Icon
                    name="dragDots"
                    class="w-5 h-5 text-gray-500 dark:text-gray-400"
                />

            </div>

            <div class="flex flex-col">

                <button
                    class="flex flex-row gap-2 items-center text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                    on:click={() => toggleSortField(sortFieldName)}
                >

                    <span>
                        {getSortFieldLocale(sortFieldName)}
                    </span>

                    <Icon
                        name="arrowDown"
                        class="w-3 h-3 text-gray-500 transition-transform {
                            isSortFieldOpen(sortFieldName)
                                ? 'rotate-180'
                                : ''
                        }"
                    />

                </button>

                {#if isSortFieldOpen(sortFieldName)}

                    {#if sortFieldName === "rarity"}

                        <div class="flex flex-wrap gap-2 transition-transform">

                            {#each sortParams.sortFieldParams[sortFieldName] as filterName}

                                <div
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-grab active:cursor-grabbing bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a] {
                                        draggedFilter === filterName && draggedFilterField === sortFieldName
                                            ? 'opacity-40 scale-90'
                                            : ''
                                    }"
                                    role="listitem"
                                    draggable="true"
                                    on:dragstart={(e) => handleFilterDragStart(e, sortFieldName, filterName)}
                                    on:dragenter={(e) => handleFilterDragEnter(e, sortFieldName, filterName)}
                                    on:dragover={handleDragOver}
                                    on:drop={handleDrop}
                                    on:dragend={handleDragEnd}
                                >

                                    <span class="capitalize font-bold pointer-events-none">
                                        {filterName}
                                    </span>

                                    <Icon
                                        name="star"
                                        class="w-3 h-3 text-current pointer-events-none"
                                    />

                                </div>

                            {/each}

                        </div>

                    {:else if sortFieldName === "localeName"}

                        <button
                            class="flex flex-row justify-between gap-2 px-2 min-w-full rounded-md h-8 bg-gray-300 dark:bg-[#2a2a2a] border border-gray-400 dark:border-[#444444]"
                            on:click={switchLocaleSort}
                        >

                            <span class="font-bold text-xs text-gray-800 dark:text-gray-300 pl-2 pt-1.5 pointer-events-none">
                                {$t(`sort.localeName.${sortParams.sortFieldParams[sortFieldName]}`)}
                            </span>

                            <div class="relative flex flex-col h-full w-4 items-center justify-center">

                                <Icon
                                    name="arrowDown"
                                    class="absolute top-1/2 -translate-y-[85%] w-3 h-3 text-gray-500 rotate-180"
                                />

                                <Icon
                                    name="arrowDown"
                                    class="absolute top-1/2 -translate-y-[15%] w-3 h-3 text-gray-500"
                                />

                            </div>

                        </button>

                    {:else}

                        <div class="flex flex-wrap gap-2 transition-transform">

                            {#each sortParams.sortFieldParams[sortFieldName] as filterName}
                                <div
                                    class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-grab active:cursor-grabbing bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a] {
                                        draggedFilter === filterName && draggedFilterField === sortFieldName
                                            ? 'opacity-40 scale-90'
                                            : ''
                                    }"
                                    role="listitem"
                                    draggable="true"
                                    on:dragstart={(e) => handleFilterDragStart(e, sortFieldName, filterName)}
                                    on:dragenter={(e) => handleFilterDragEnter(e, sortFieldName, filterName)}
                                    on:dragover={handleDragOver}
                                    on:drop={handleDrop}
                                    on:dragend={handleDragEnd}
                                >
                                    <span class="text-xs capitalize font-bold pointer-events-none">
                                        {getFilterNameLocale(sortFieldName, filterName)}
                                    </span>

                                </div>

                            {/each}

                        </div>

                    {/if}

                {/if}

            </div>

        </div>

    {/each}

</div>