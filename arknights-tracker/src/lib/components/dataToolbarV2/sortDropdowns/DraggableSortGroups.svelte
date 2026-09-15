<script lang="ts" generics="TGroup extends DraggableItem">
    import type { DraggableItem } from "$lib/classes/dragndrop/DraggableItem";
    import { DraggableList } from "$lib/classes/dragndrop/DraggableList";
    import type { IDraggableList } from "$lib/classes/dragndrop/IDraggableList";
    import Icon from "$lib/components/Icon.svelte";
    import { flip } from "svelte/animate";

    export let openableGroups: boolean = false;

    export let getLocaleFunc: (group: TGroup) => string = (group) => group?.toString() ?? "null";

    // bindable
    export let groupList: TGroup[] = []; // if bound, it will be updated on change order of elements
    export let draggedGroup: TGroup | null = null;
    export let openedGroup: TGroup | null = null;

    function toggleGroupOpen(group: TGroup) {
        if (openedGroup === group) {
            openedGroup = null;

            return;
        }

        openedGroup = group;
    }

    function closeAllGroups() {
        openedGroup = null;
    }

    $: isGroupOpened = (group: TGroup) => openableGroups && openedGroup === group;

    let dragList: IDraggableList<TGroup> = new DraggableList(groupList);

    $: draggedGroup = dragList.draggedItemId;

    $: if (groupList) {
        updateItemList(groupList);
    }

    function forceGroupListUpdate() {
        groupList = dragList.itemList;
    }

    function forceDragListUpdate() {
        dragList = dragList;
    }

    function updateItemList(itemList: TGroup[]) {
        dragList.itemList = itemList;
    }

    let currentCursorPosX = 0;
    let currentCursorPosY = 0;

    $: isGroupDragged = (group: TGroup) => dragList.draggedItemId === group;

    function startDrag(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }, group: TGroup) {
        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;

        closeAllGroups();

        dragList.startDrag(group);
        forceDragListUpdate();

        document.body.classList.add("cursor-grabbing");
    }

    function endDrag() {
        dragList.endDrag();
        forceDragListUpdate();
    }

    function onGroupEnter(group: TGroup) {
        if (!dragList.draggedItemId)
            return;

        let wasModified = dragList.onEnter(group);

        forceDragListUpdate();

        if (wasModified) {
            forceGroupListUpdate();
        }
    }

    function onGroupLeave(group: TGroup) {
        if (!dragList.draggedItemId)
            return;

        dragList.onLeave(group);

        forceDragListUpdate();
    }


    function handleWindowPointerUp() {
        if (!dragList.draggedItemId)
            return;

        endDrag();

        document.body.classList.remove("cursor-grabbing");
    }

    function handleWindowPointerMove(event: PointerEvent & { currentTarget: EventTarget & Window }) {
        if (!dragList.draggedItemId)
            return;

        currentCursorPosX = event.clientX;
        currentCursorPosY = event.clientY;
    }


    let groupTouchHovered: TGroup | null = null;

    function handleWindowTouchMove(event: TouchEvent & { currentTarget: EventTarget & Window }) {
        if (!dragList.draggedItemId)
            return;

        const touch = event.touches[0];

        if (!touch)
            return;

        const elementUnderPointer = document.elementFromPoint(touch.clientX, touch.clientY);
        const groupItem = elementUnderPointer?.closest<HTMLElement>("[data-group]");
        const newGroup = (groupItem?.dataset.group ?? null) as TGroup | null;

        if (newGroup === groupTouchHovered)
            return;

        if (groupTouchHovered) {
            onGroupLeave(groupTouchHovered);
        }

        if (newGroup) {
            onGroupEnter(newGroup);
        }

        groupTouchHovered = newGroup;
    }

    function handleWindowTouchEnd() {
        if (!dragList.draggedItemId) return;

        if (groupTouchHovered) {
            onGroupLeave(groupTouchHovered);
            groupTouchHovered = null;
        }
    }

</script>

<svelte:window
    on:touchmove={handleWindowTouchMove}
    on:touchend={handleWindowTouchEnd}
    on:pointermove={handleWindowPointerMove}
    on:pointerup={handleWindowPointerUp}
/>

<div class="flex flex-col gap-3 select-none">

    {#each groupList as group (group)}

        <div
            animate:flip={{ duration: 100 }}
            class="flex flex-row transition-all duration-200 rounded-lg"
            role="listitem"
            data-group={group}
            on:pointerenter={() => {onGroupEnter(group)}}
            on:pointerleave={() => {onGroupLeave(group)}}
        >

            <div
                class="h-4 w-4 pt-[1px] mr-3 cursor-grab touch-none"
                role="button"
                tabindex="-1"
                on:pointerdown|preventDefault={(e) => startDrag(e, group)}
            >

                <Icon
                    name="dragDots"
                    class="h-5 w-5 {
                        isGroupDragged(group)
                            ? 'text-[#f9b90c]'
                            : 'text-gray-500 dark:text-gray-400'
                    }"
                />

            </div>

            <div class="flex flex-col">

                {#if openableGroups}

                    <button
                        class="flex flex-row gap-2 items-center text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
                        on:click={() => toggleGroupOpen(group)}
                    >

                        <span>
                            {getLocaleFunc(group)}
                        </span>

                        <Icon
                            name="arrowDown"
                            class="w-3 h-3 text-gray-500 transition-transform {
                                isGroupOpened(group)
                                    ? 'rotate-180'
                                    : ''
                            }"
                        />

                    </button>

                {:else}

                    <div class="flex flex-row gap-2 items-center text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2">

                        <span>
                            {getLocaleFunc(group)}
                        </span>

                    </div>

                {/if}

                {#if isGroupOpened(group)}

                    <slot />

                {/if}

            </div>

        </div>

    {/each}

</div>