<script>
    import { DraggableList } from "$lib/classes/dragndrop/DraggableList.js";
    import Icon from "$lib/components/Icon.svelte";
    import { flip } from "svelte/animate";

    export let openableGroups = false;

    export let getLocaleFunc = (group) => group?.toString() ?? "null";

    // bindable
    export let groupList = [];
    export let draggedGroup = null;
    export let openedGroup = null;

    function toggleGroupOpen(group) {
        if (openedGroup === group) {
            openedGroup = null;
        }

        openedGroup = group;
    }

    $: isGroupOpened = (group) => openableGroups && openedGroup === group;

    let dragList = new DraggableList(groupList);
    $: dragList.itemList = groupList;

    function forceGroupListUpdate() {
        groupList = dragList.itemList;
    }

    function forceDragListUpdate() {
        dragList = dragList;
    }
</script>

<div class="flex flex-col gap-3 select-none">

    {#each groupList as group (group)}

        <div
            animate:flip={{ duration: 100 }}
            class="flex flex-row transition-all duration-200 rounded-lg"
            role="listitem"
            data-group={group}
            on:pointerenter={() => {}}
            on:pointerleave={() => {}}
        >

            <div
                class="h-4 w-4 pt-[1px] mr-3 cursor-grab touch-none"
                role="button"
                tabindex="-1"
            >

                <Icon
                    name="dragDots"
                    class="h-5 w-5"
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