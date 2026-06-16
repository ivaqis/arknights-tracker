<script>
    import { DraggableList } from "$lib/classes/dragndrop/DraggableList.js";
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { getDefaultItemSortParams } from "$lib/stores/filterStore.js";
    import { flip } from "svelte/animate";

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

    // sort field drag

    let sortFieldDragList = new DraggableList(sortParams.sortFieldOrder);

    let currentDragCursorPosX = 0;
    let currentDragCursorPosY = 0;

    function forceDragListUpdate() {
        sortFieldDragList = sortFieldDragList;
    }

    function forceSortFieldOrderUpdate() {
        sortParams.sortFieldOrder = sortFieldDragList.itemList;
    }

    $: isSortFieldDragged = (sortField) => {
       return sortFieldDragList.draggedItemId === sortField;
    };

    function sortFieldStartDrag(event, sortFieldName) {
        console.log(`start ${sortFieldName}`);

        currentDragCursorPosX = event.clientX;
        currentDragCursorPosY = event.clientY;

        openedSortField = null;

        sortFieldDragList.startDrag(sortFieldName);
        forceDragListUpdate();

        document.body.classList.add("cursor-grabbing");
    }

    function sortFieldEndDrag() {
        console.log(`end`);
        sortFieldDragList.endDrag();
        forceDragListUpdate();
    }

    function onSortFieldEnter(event, sortFieldName) {
        if (!sortFieldDragList.draggedItemId) {
            return;
        }
        console.log(`enter ${sortFieldName}`);

        let wasModified = sortFieldDragList.onEnter(sortFieldName);

        forceDragListUpdate();

        if (wasModified) {
            forceSortFieldOrderUpdate();
        }
    }

    function onSortFieldLeave(event, sortFieldName) {
        if (!sortFieldDragList.draggedItemId) {
            return;
        }
        console.log(`leave ${sortFieldName}`);

        sortFieldDragList.onLeave(sortFieldName);

        forceDragListUpdate();
    }

    function handleWindowPointerUp(event) {
        sortFieldEndDrag();

        document.body.classList.remove("cursor-grabbing");
    }

    function handleWindowPointerMove(event) {
        if (!sortFieldDragList.draggedItemId) {
            return;
        }

        currentDragCursorPosX = event.clientX;
        currentDragCursorPosY = event.clientY;

    }

    let touchSortFieldHovered = null;

    function handleWindowTouchMove(event) {
        const touch = event.touches[0];
        if (!touch) return;

        const elementUnderPointer = document.elementFromPoint(touch.clientX, touch.clientY);
        const listItem = elementUnderPointer?.closest('[data-sort-field]');
        const newField = listItem?.dataset.sortField ?? null;

        if (newField !== touchSortFieldHovered) {
            if (touchSortFieldHovered) {
                onSortFieldLeave(event, touchSortFieldHovered);
            }
            if (newField) {
                onSortFieldEnter(event, newField);
            }
            touchSortFieldHovered = newField;
        }
    }

    function handleWindowTouchEnd(event) {
        if (touchSortFieldHovered) {
            onSortFieldLeave(event, touchSortFieldHovered);
            touchSortFieldHovered = null;
        }
    }


</script>

<svelte:window
    on:touchmove={handleWindowTouchMove}
    on:touchend={handleWindowTouchEnd}
    on:pointermove={handleWindowPointerMove}
    on:pointerup={handleWindowPointerUp}
/>

{#if sortFieldDragList.draggedItemId}

    <div
        class="fixed flex flex-row rounded-lg z-[1000] pointer-events-none select-none"
        style="left: {currentDragCursorPosX-8}px; top: {currentDragCursorPosY-8}px"
    >

        <div class="h-4 w-4 pt-[1px] mr-3 cursor-grabbing">

            <Icon
                name="dragDots"
                class="w-5 h-5 text-gray-500 dark:text-gray-400"
            />

        </div>

        <div class="flex flex-row gap-2 items-center text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70">

                    <span>
                        {getSortFieldLocale(sortFieldDragList.draggedItemId)}
                    </span>

        </div>

    </div>

{/if}

<DropdownTemplate
    showResetButton={true}
    onResetButton={onSortReset}
>

    <div class="flex flex-col gap-3 select-none">

        {#each sortParams.sortFieldOrder as sortFieldName (sortFieldName)}

            <div
                animate:flip={{ duration: 100 }}
                class="flex flex-row transition-all duration-200 rounded-lg"
                role="listitem"
                data-sort-field={sortFieldName}
                on:pointerenter={(e) => onSortFieldEnter(e, sortFieldName)}
                on:pointerleave={(e) => onSortFieldLeave(e, sortFieldName)}
            >

                <div
                    class="h-4 w-4 pt-[1px] mr-3 cursor-grab touch-none"
                    role="button"
                    tabindex="0"
                    on:pointerdown|preventDefault={(event) => sortFieldStartDrag(event, sortFieldName)}
                >

                    <Icon
                        name="dragDots"
                        class="w-5 h-5 {isSortFieldDragged(sortFieldName) ? 'text-[#f9b90c]' : 'text-gray-500 dark:text-gray-400'}"
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
                                        class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-grab active:cursor-grabbing bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a]"
                                        role="listitem"
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

                            <div class="flex flex-wrap gap-2">

                                {#each sortParams.sortFieldParams[sortFieldName] as filterName}
                                    <div
                                        class="h-[32px] px-3 rounded flex items-center gap-1 border transition-all cursor-grab active:cursor-grabbing bg-gray-300 border-gray-400 text-black dark:text-[#E0E0E0] dark:bg-[#424242] dark:border-[#444444] hover:bg-gray-200 hover:dark:bg-[#4a4a4a]"
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

</DropdownTemplate>